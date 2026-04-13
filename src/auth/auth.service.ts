import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { AuthTokens } from './interfaces/auth-token.interface';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtservice: JwtService,
        private readonly config: ConfigService
    ){}

    async validateUser(email: string, password: string): Promise<User|null>{
        const user = await this.userService.findByEmail(email)
        if(!user)return null;

        const isMatch =await bcrypt.compare(password, user.password)
        if(!isMatch)  return  null

        return user
    }

    async register (dto: RegisterDto): Promise<AuthTokens>{
        const existing = await this.userService.findByEmail(dto.email)
        if(existing) throw new ConflictException("user with email already exists")

            const user = await this.userService.create(dto)

        return this.generateToken(user)
    }
    async login(user: User): Promise<AuthTokens>{
        return this.generateToken(user)
    }
async refreshTokens(refreshToken: string): Promise<AuthTokens>{
    try{
        const payload = this.jwtservice.verify<JwtPayload>(refreshToken,{secret: this.config.get<string>('JWT_REFRESH_SECRET')})

        const user = await this.userService.findOne(payload.sub)
        return this.generateToken(user)
    }catch{
            throw new UnauthorizedException("invalid or expired refresh token")
    }
}
private generateToken(user:User): AuthTokens{
    const payload:JwtPayload = {
        sub:user.id,
        email: user.email,
        role: user.role
    }
    const expiresIn = 15 * 60

    const accessToken = this.jwtservice.sign(payload,{
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn,
    })
      const refreshToken = this.jwtservice.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
  });
    return {accessToken,refreshToken,expiresIn}
}

}
