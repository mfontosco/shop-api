import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categories)
        private readonly categoriesRepo:Repository<Categories>,
    ){}

    async create(dto: CreateCategoryDto){
        const existing = await this.categoriesRepo.findOne({
            where:{ name: dto.name}
        })
        if(existing){
            throw new ConflictException("Category already exists")
        }
        const category = this.categoriesRepo.create(dto)

        return this.categoriesRepo.save(category)

    }

    async findAll():Promise<Categories[]>{
        return this.categoriesRepo.find({
            order:{
                name:'ASC'
            }
        })
    }

    async findOne(id:string):Promise<Categories>{
        const category =  await this.categoriesRepo.findOne({where:{
            id
        }})
        if(!category) throw new NotFoundException(`the category with this id ${id} doesn't exist`)

            return category
    }

    async Update(id:string, dto:UpdateCategoryDto):Promise<Categories>{
        const existing = await this.categoriesRepo.findOne({
            where:{
                id
            }
        })
        if(!existing) throw new NotFoundException("Category not found")

            Object.assign(existing,dto)
            return this.categoriesRepo.save(existing)
    }

    async remove(id: string):Promise<void>{
        const category = await this.categoriesRepo.findOne({
            where:{id}
        })
        if(!category)throw new NotFoundException("This category doessn't exist")
    }

}
