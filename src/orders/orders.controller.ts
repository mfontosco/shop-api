import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { FilterOrderDto } from './dto/filter-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from 'src/auth/decorators/roles.decorators.';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly orderService:OrdersService
    ){}

   
    @ApiOperation({summary: "place a new order"})
    @ApiResponse({status: 201, description: 'Order placed successfully'})
    @ApiResponse({status: 400, description: 'Insufficient stock or invalid products'})
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body()dto: CreateOrderDto,
        @CurrentUser() user: User
    ){
        return this.orderService.create(dto,user)
    }

    @ApiOperation({summary:"List orders (own orders for users, all for admins)"})
    @Get()
    findAll(
        @Query()filter:FilterOrderDto,
        @CurrentUser()user:User
    ){
        return this.orderService.findAll(filter,user)
    }

    @ApiOperation({summary: "Get order statistics"})
    @Get("stats")
    getStats(@CurrentUser() user:User){
        return this.orderService.getOrderStats(user)
    }
    @ApiOperation({summary: "Get order by id"})
    @Get(":id")
    findOne(
        @Param("id",ParseUUIDPipe)id: string,
        @CurrentUser()user: User
    ){
        return this.orderService.findOne(id,user)
    }
    @ApiOperation({summary: "Update order status (admin only"})
    @Roles(UserRole.Admin)
    @Patch(':id/status')
    updateStatus(
        @Param("id",ParseUUIDPipe)id: string,
        @Body() dto: UpdateOrderStatusDto,
        @CurrentUser()user: User
    ){
        return this.orderService.updateStatus(id,dto,user)
    }
    @ApiOperation({summary: "Cancel an order"})
    @Patch(':id/cancel')
    cancel(
        @Param("id",ParseUUIDPipe)id: string,
        @CurrentUser()user: User
    ){
        return this.orderService.cancelOrder(id,user)
    }
}
