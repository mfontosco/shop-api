import { Type } from "class-transformer";
import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, isURL, IsUUID, Min } from "class-validator";
import { ProductStatus } from "../entities/product.entity";


export class CreateProductDto{

    @IsNotEmpty()
    @IsString()
    name:string

    @IsOptional()
    @IsString()
    description: string

    @IsNotEmpty()
    @Type(()=> Number)
    @IsNumber()
    @Min(0)
    price: number

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(0)
    stock?: number

    @IsOptional()
    @IsUrl()
    ImageUrl?: string

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus

    @IsNotEmpty()
    @IsUUID()
    categoryId: string

}