import { IsEnum, IsNotEmpty } from "class-validator";
import { OrderStatus } from "../entities/orders.entity";


export class UpdateOrderStatusDto{
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    sstatus: OrderStatus
}