import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";


export class OrderItemDto{
    @IsUUID()
    productId: string

    @IsNumber()
    quantity: number


}

export class ShippingAddressDto{
    @IsNotEmpty()
    @IsString()
    street: string

    @IsNotEmpty()
    @IsString()
    city: string
    
    @IsNotEmpty()
    @IsString()
    state: string

    @IsNotEmpty()
    @IsString()
    country: string

    @IsNotEmpty()
    @IsString()
    zip: string
}

export class CreateOrderDto{
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(()=>OrderItemDto)
    items: OrderItemDto []

    @IsObject()
    @ValidateNested()
    @Type(()=> ShippingAddressDto)
    shippingAddress:ShippingAddressDto

    @IsOptional()
    @IsString()
    notes?: string


}