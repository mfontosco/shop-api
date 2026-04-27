import { Type } from "class-transformer";
import { IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, isURL, IsUUID, Min } from "class-validator";
import { ProductStatus } from "../entities/product.entity";
import { ApiProperty } from "@nestjs/swagger";


export class CreateProductDto{
    @ApiProperty({ example: 'iPhone 15 Pro', description: 'Product name' })
    @IsNotEmpty()
    @IsString()
    name:string


    @IsOptional()
    @IsString()
    description: string

    @ApiProperty({ example: 999.99, description: 'Price in USD' })
    @IsNotEmpty()
    @Type(()=> Number)
    @IsNumber()
    @Min(0)
    price: number

    @ApiProperty({ example: 50, description: 'Available stock units' })
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(0)
    stock: number

    @ApiProperty({ example: 50, description: 'Available stock units' })
    @IsOptional()
    @IsUrl()
    ImageUrl?: string

    @ApiProperty({ example: "pending", description: 'Available stock units' })
    @IsOptional()
    @IsEnum(ProductStatus)
    status: ProductStatus

    @ApiProperty({ example: 'uuid-here', description: 'Category UUID' })
    @IsNotEmpty()
    @IsUUID()
    categoryId: string

}