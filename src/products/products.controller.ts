import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorators.';
import { Public } from 'src/auth/decorators/public.decorator';


// const TEMP_user = {id:"123455",name:"Admin"} as any
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productService:ProductsService
    ){}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto:CreateProductDto,
            @CurrentUser()user:User                
){
        return this.productService.create(dto,user)
    }
    @Public()
    @Get()
    findAll(@Query() filters:FilterProductDto){
        return this.productService.findAll(filters)
    }
    @Public()
    @Get(":id")
    findOne(@Param('id',ParseUUIDPipe)id:string){
        return this.productService.findOne(id)
    }
     @Public()
    @Patch(":id")
    update(@Param('id',ParseUUIDPipe)id:string, dto:UpdateProductDto){
          return this.productService.update(id,dto)
    }
    @Public()
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id', ParseUUIDPipe)id:string):Promise<void>{
        return this.productService.remove(id)
    }
  
}
