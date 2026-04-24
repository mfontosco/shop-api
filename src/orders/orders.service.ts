import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/orders.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Paginated } from 'src/common/interfaces/paginated.interface';
import { FilterOrderDto } from './dto/filter-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Product } from 'src/products/entities/product.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { ORDER_CONFIRMATION_JOB, ORDER_QUEUE, ORDER_STATUS_UPDATE_JOB } from './queues/order.queue';
import { Queue } from 'bullmq';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class OrdersService {
constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,

    private readonly datasource: DataSource,

    private readonly notificationsGateway: NotificationsGateway,

    private readonly productService:ProductsService,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectQueue(ORDER_QUEUE)
    private readonly orderQueue: Queue

){}
async create(dto: CreateOrderDto, user: User): Promise<Order|null>{
    const queryRunner = this.datasource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        const ressolvedItems = await Promise.all(
            dto.items.map(async (item)=>{
                const product = await this.productService.findOne(item.productId)
                if(product.stock < item.quantity){
                    throw new BadRequestException(
                        `Insufficient stock for ${product.name}` +
                        `Available: ${product.stock}, requested: ${item.quantity}`
                    );
                }
                console.log("--------------------",{product, quantity:item.quantity})
                 return {product, quantity:item.quantity}
            })
           
        )
        console.log("ressolvedItems-------------",ressolvedItems)
           const orderItems = ressolvedItems.map(({product,quantity})=>{
            const unitPrice = Number(product.price)
            const subTotal = unitPrice * quantity

            const item =  new OrderItem
            item.product = product
            item.quantity = quantity
            item.unitPrice = unitPrice
            item.subtotal = subTotal
            return item
           });
        const total = orderItems.reduce((sum,i)=> sum + i.subtotal,0) 

         const order = await queryRunner.manager.create(Order,{
            user,
            items:orderItems,
            total,
            shippingAddress: dto.shippingAddress,
            notes: dto.notes,
            status: OrderStatus.Pending
         })

         const savedOrder = await queryRunner.manager.save(Order,order)
         await Promise.all(
            ressolvedItems.map(({product, quantity})=>
                queryRunner.manager.decrement(
                   Product,
                    {id: product.id},
                    'stock',
                    quantity,
                )
            )
         )
         await queryRunner.commitTransaction();
await this.orderQueue.add(ORDER_CONFIRMATION_JOB,
    {orderId: savedOrder.id,userEmail:user.email},
    {
        attempts: 3,
        backoff: {type: 'exponential',delay:2000},
        removeOnComplete: true
    }
)
         return this.findOne(savedOrder.id,user)
           
    } catch (error) {
await queryRunner.rollbackTransaction()
throw error
        
    }finally{
        await queryRunner.release()
    }
}
async findAll(filters: FilterOrderDto, user:User):Promise<Paginated<Order>>{
    const {page, limit, skip, status, userId} = filters;

    const qb = this.ordersRepo.createQueryBuilder("order")
                .leftJoinAndSelect("order.user","user")
                .leftJoinAndSelect("order.items", "items")
                .leftJoinAndSelect("items.product",'product')

                if(user.role !== UserRole.Admin){
                    qb.where('user.id = :userId',{userId: user.id})
                }else if(userId){
                    qb.where("user.id = :userId",{userId})
                }

                if(status){
                    qb.andWhere('order.status = :status', {status})
                }
                const [data, total] = await qb
                .orderBy('order.createAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount()

                return{
                    data,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                        hasNextPage: page < Math.ceil(total / limit),
                        hasPrevPage: page >  1
                    }
                }

}
async findOne(id: string, user: User): Promise<Order | null>{
    const order =  await this.ordersRepo
                    .createQueryBuilder("order")
                    .leftJoinAndSelect("order.user", "user")
                    .leftJoinAndSelect("order.items", "items")
                    .leftJoinAndSelect("items.product", "product")
                    .where('order.id = :id', {id})
                    .getOne()

                    if(!order) throw new NotFoundException(`Order with ${id} not found`)

                        if(user.role !== UserRole.Admin && order.user.id !== user.id){
                            throw new ForbiddenException('You do not have access to this order')
                        }


                        return order
}

async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    user:User
):Promise<Order| null>{
    const order = await this.findOne(id, user);
  if (!order) throw new NotFoundException(`Order with ${id} not found`);
    const validTransitions : Record<OrderStatus, OrderStatus[]> ={
        [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Canceled],
        [OrderStatus.Confirmed]: [OrderStatus.Shipped,OrderStatus.Canceled],
        [OrderStatus.Shipped]: [OrderStatus.Delivered],
        [OrderStatus.Delivered]:[],
        [OrderStatus.Canceled]:[]
    }
    if(!validTransitions[order?.status].includes(dto.sstatus)){
        throw new BadRequestException(`Cannot transition order from "${order?.status}" to "${dto.sstatus}`)
    }
    if(dto.sstatus === OrderStatus.Canceled){
        await this.restoreStock(order)
    }
    order.status = dto.sstatus
    await this.orderQueue.add(
  ORDER_STATUS_UPDATE_JOB,
  { orderId: order.id, userEmail: order.user.email, oldStatus: order.status },
  { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
);
    const savedOrder = await this.ordersRepo.save(order)

    this.notificationsGateway.notifyOrderUpdate(order.user.id, savedOrder)
    return savedOrder
}
async cancelOrder(id: string, user: User): Promise<Order|null>{
    const order = await this.findOne(id, user);
    if(!order){
        throw new NotFoundException("Order with the id does not exist")
    }
    if(order?.status === OrderStatus.Canceled){
        throw new BadRequestException('Order is already cancelled');;
    }

    if([OrderStatus.Delivered,OrderStatus.Shipped].includes(order?.status)){
        throw new BadRequestException("Cannot cancel a shipped or delivered order")
    }
    await this.restoreStock(order)
    order.status = OrderStatus.Canceled

    return this.ordersRepo.save(order)
}
private async restoreStock(order:Order){
    await Promise.all(
        order.items.map((item)=>{
            this.datasource.manager.increment(
               Product,
                {id: item.product.id},
                "stock",
                item.quantity
            )
        })
    )
}
async getOrderStats(user: User){
    const qb = this.ordersRepo
    .createQueryBuilder('order')
    .select('order.status','status')
    .addSelect('COUNT(*)',"count")
    .addSelect('SUM(order.total)','revenue')

    if(user.role !== UserRole.Admin){
        qb.leftJoin('order.user','user')
        .where('user.id = :userId',{userId: user.id})
    }

    const stats = await qb.groupBy('order.status').getMany()

    const total = await (user.role === UserRole.Admin
        ? this.ordersRepo.count()
        : this.ordersRepo.count({ where: { user: {id: user.id}}})
    )

    return {
        total,
        stats
    }
}
}
