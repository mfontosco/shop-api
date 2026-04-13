import { IsNotEmpty, IsString } from "class-validator";



export class refreshTokenDto{
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}