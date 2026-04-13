import { createParamDecorator,ExecutionContext } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";


export const CurrentUser =  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User => {
        const requst = ctx.switchToHttp().getRequest()
    return requst.user
    }
)


