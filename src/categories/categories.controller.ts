import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoryService:CategoriesService
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(dto:CreateCategoryDto){
        return this.categoryService.create(dto)
    }

    @Get()
    findAll(){
        return this.categoryService.findAll()
    }

    @Get(':id')
    findOne(id:string){
        return this.categoryService.findOne(id)
    }
    @Patch(":id")
    update(
        @Param("id",ParseUUIDPipe)id: string,
        @Body()dto:UpdateCategoryDto
    ){
        return this.categoryService.Update(id,dto)
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param("id",ParseUUIDPipe)id:string){
        this.categoryService.remove(id)
    }
}
