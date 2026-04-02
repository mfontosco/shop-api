import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { User } from 'src/users/entities/user.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { Paginated } from 'src/common/interfaces/paginated.interface';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly createProductRepo:Repository<Product>,
        private readonly  categoryService: CategoriesService
    ){} 

    async create(dto: CreateProductDto, creator: User):Promise<Product>{
        const category = await this.categoryService.findOne(dto.categoryId)

        const existing =  await this.createProductRepo.findOne({where:{
            name:  dto.name
        }})
        if(existing){
            throw new ConflictException("Product already exists")
        }

        const product = await this.createProductRepo.create({
            ...dto,
            category,
            createdBy:creator
        })
        return this.createProductRepo.save(product)
    }

    async  findAll(filter:FilterProductDto):Promise<Paginated<Product>>{
        const {page,limit,skip,search,categoryId,status,minPrice,maxPrice} = filter
        const qb = this.createProductRepo.createQueryBuilder('product').leftJoinAndSelect('product.category','category')

        if(search){
            qb.andWhere('product.name ILIKE :SEARCH or PRODUCT.DESSCRIPTION ilike :search',
                {search: '%${search}%'},
            );
        }
        if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });
    if (status)     qb.andWhere('product.status = :status', { status });
    if (minPrice !== undefined) qb.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('product.price <= :maxPrice', { maxPrice });

       const [data,total] = await qb.orderBy('product.createdAt','DESC').
       skip(skip)
       .take(limit)
       .getManyAndCount()

       return {
        data,
        meta:{
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit),
            hasNextPage: page < Math.ceil(total/limit),
            hasPrevPage: page > 1
        }
       }
    }

    async findOne(id:string):Promise<Product>{
        const product = await this.createProductRepo.findOne({where:{
            id
        },
        relations:['createdBy', 'category']
    })
        if(!product){
            throw new NotFoundException(`the product with this ID:${id} does not exist`)
        }
        return product
    }

    async update(id:string,dto:UpdateProductDto):Promise<Product>{
        const  product =  await this.findOne(id)
        if(dto.categoryId){
           product.category  = await this.categoryService.findOne(dto.categoryId)
        }
        const {categoryId: _ , ...rest} = dto
        Object.assign(product,rest)
        return this.createProductRepo.save(product)
    }

    async remove(id:string):Promise<void>{
        const product =  await this.findOne(id)
        if(!product){
            throw new NotFoundException("Product with this id doesn't exist")
        }
        await this.createProductRepo.remove(product)
    }


    async adjustStock(id:string, quantity:number):Promise<Product>{
        const product = await this.findOne(id)
        if(product.stock + quantity < 0){
            throw new ConflictException("Insufficient  stock")
        }
        product.stock += quantity

        return this.createProductRepo.save(product)
    }
}


   