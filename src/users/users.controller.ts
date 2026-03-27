import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}
    

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto:CreateUserDto){
        return this.userService.create(dto)
    }
    @Get()
    findAll(@Query() pagination:PaginationDto){
        return this.userService.findAll(pagination)
    }
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe)id: string){
        return this.userService.findOne(id)
    }
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto:UpdateUserDto
    ){
        return this.userService.update(id,dto)
    }
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param("id", ParseUUIDPipe)id: string){
        
    }


}
