import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { refreshTokenDto } from './dto/refresh-token.dto.';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}

    @Public()
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    register(@Body()dto: RegisterDto){
        return this.authService.register(dto)
    }
    @Public()
    @UseGuards(AuthGuard('local'))
    @Post("login")
    @HttpCode(HttpStatus.CREATED)
    login(@CurrentUser() user:User){
        return this.authService.login(user)
    }
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body() dto:refreshTokenDto){
        return this.authService.refreshTokens(dto.refreshToken)
    }

    @Post('me')
    @HttpCode(HttpStatus.OK)
    getMe(@CurrentUser()user: User){
        const {password: _, ...safeUser} = user
        return safeUser
    }
}
