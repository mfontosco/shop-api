import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { refreshTokenDto } from './dto/refresh-token.dto.';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}
    @ApiOperation({summary: "Register a new user"})
    @ApiResponse({status: 201, description: "User registered, tokens returned"})
    @ApiResponse({status: 409, description: 'Email already registered'})
    @Public()
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    register(@Body()dto: RegisterDto){
        return this.authService.register(dto)
    }

    @ApiOperation({summary:"Login with email and password"})
    @ApiResponse({status: 200, description: 'Token returned'})
    @ApiResponse({status: 401, description: "invalid description"})
    @Public()
    @UseGuards(AuthGuard('local'))
    @Post("login")
    @HttpCode(HttpStatus.CREATED)
    login(@CurrentUser() user:User){
        return this.authService.login(user)
    }
    @ApiOperation({summary: 'Refresh access token'})
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body() dto:refreshTokenDto){
        return this.authService.refreshTokens(dto.refreshToken)
    }

    @ApiOperation({summary: 'Get current logged in user'})
    @ApiBearerAuth("access-token")
    @Public()
    @Post('me')
    @HttpCode(HttpStatus.OK)
    getMe(@CurrentUser()user: User){
        const {password: _, ...safeUser} = user
        return safeUser
    }
}
