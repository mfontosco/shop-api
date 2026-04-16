import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { FilterOrderDto } from './dto/filter-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from 'src/auth/decorators/roles.decorators.';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly orderService:OrdersService
    ){}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body()dto: CreateOrderDto,
        @CurrentUser() user: User
    ){
        return this.orderService.create(dto,user)
    }

    @Get()
    findAll(
        @Query()filter:FilterOrderDto,
        @CurrentUser()user:User
    ){
        return this.orderService.findAll(filter,user)
    }

    @Get("stats")
    getStats(@CurrentUser() user:User){
        return this.orderService.getOrderStats(user)
    }

    @Get(":id")
    findOne(
        @Param("id",ParseUUIDPipe)id: string,
        @CurrentUser()user: User
    ){
        return this.orderService.findOne(id,user)
    }
    @Roles(UserRole.Admin)
    @Patch(':id/status')
    updateStatus(
        @Param("id",ParseUUIDPipe)id: string,
        @Body() dto: UpdateOrderStatusDto,
        @CurrentUser()user: User
    ){
        return this.orderService.updateStatus(id,dto,user)
    }
    @Patch(':id/cancel')
    cancel(
        @Param("id",ParseUUIDPipe)id: string,
        @CurrentUser()user: User
    ){
        return this.orderService.cancelOrder(id,user)
    }
}
