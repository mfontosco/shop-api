import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";


@Injectable()
export class JwtStrategy  extends PassportStrategy(Strategy,'jwt'){

    constructor(
        private readonly config: ConfigService,
        private readonly usersService: UsersService 
    ){
        super({
            
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload:JwtPayload){
        const user = await this.usersService.findOne(payload.sub)

        if(!user || !user.isActive){
            throw new UnauthorizedException("user not found or is inactive")
        }

        return user
    }
}