import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ORDER_CONFIRMATION_JOB, ORDER_QUEUE, ORDER_STATUS_UPDATE_JOB, OrderConfirmationPayload, OrderStatusUpdatePayload } from "../queues/order.queue";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "../entities/orders.entity";
import { EmailService } from "src/email/email.service";
import { Repository } from "typeorm";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";





@Processor(ORDER_QUEUE)
export class OrderProcessor extends WorkerHost{
 private readonly logger = new Logger(OrderProcessor.name)
 constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly mailService: EmailService,
 ){
    super()
 }

 async process(job:Job): Promise<void>{
    this.logger.log(`Processing Job: ${job.name} [${job.id}]`);

    switch(job.name){
        case ORDER_CONFIRMATION_JOB:
        await this.handleOrderConfirmation(job.data as OrderConfirmationPayload)
        break;

        case ORDER_STATUS_UPDATE_JOB:
            await this.handleStatusUpdate(job.data as OrderStatusUpdatePayload)
            break;
         default:
            this.logger.warn(`Uknown job type: ${job.name}`)   

    }
    
 }
 private async handleOrderConfirmation(payload: OrderConfirmationPayload){
        const order = await this.orderRepo.findOne({
            where:{
                id: payload.orderId
            },
            relations: ['items','items.product']
        });
        if(!order){
            this.logger.error(`Order ${payload.orderId} not found for confirmation email`)
            return
        }
        await this.mailService.sendOrderConfirmation(order, payload.userEmail)
        this.logger.log(`Confirmation email queued for order ${payload.orderId}`)
    }

    private async handleStatusUpdate(payload:OrderStatusUpdatePayload){
        const order = await this.orderRepo.findOne({
            where:{id: payload.orderId}
        })
        if(!order) return

        await this.mailService.sendStatusUpdate(order,payload.userEmail,payload.oldStatus)
    }
}

