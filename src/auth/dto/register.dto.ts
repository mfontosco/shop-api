import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class RegisterDto{
    @ApiProperty({example:" Emeka Eze"})
    @IsNotEmpty()
    @IsString()
    name?: string

    @ApiProperty({example: 'emaeka@example.com'})
    @IsEmail()
    email?: string

    @ApiProperty({example: 'password123', minLength:8})
    @IsString()
    @MinLength(8)
    password?: string

}