import { PaginationDto } from "src/common/dto/pagination.dto";
import { OrderStatus } from "../entities/orders.entity";
import { IsEnum, IsOptional, IsUUID } from "class-validator";



export class FilterOrderDto extends PaginationDto{
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus

    @IsOptional()
    @IsUUID()
    userId?: string
}