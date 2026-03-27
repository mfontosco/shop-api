import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Paginated } from 'src/common/interfaces/paginated.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo:Repository<User>
    ){}

    async create(dto: CreateUserDto):Promise<User>{

        const existing =  await this.userRepo.findOne({
            where: {email:dto.email}
        })

        if(existing){
            throw new ConflictException('Email already registered')
        }
        const user = this.userRepo.create(dto)

        return this.userRepo.save(user)
    }

    async findAll(pagination:PaginationDto):Promise<Paginated<User>>{
        const {page, limit, skip, search} = pagination

        const qb = this.userRepo.createQueryBuilder('user').select([
            'user.id', 'user.name', 'user.email','user.role','user.isActive','user.createdAt','user.updatedAt'
        ]);
        if(search){
            qb.where(
                'user.name ILIKE :search OR user.email ILIKE :search',
                {search: `%${search}%`},
            )
        }
        const [data, total] = await qb
        .orderBy('user.createdAt','DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount()

        return{
            data,
            meta:{
                total,
                page,
                limit,
                totalPages:Math.ceil(total/limit),
                hasNextPage: page < Math.ceil(total/limit),
                hasPrevPage: page > 1
            }
        }
    }

    async findOne(id: string): Promise<User>{
        const user = await this.userRepo.findOne({where:{id}})

        if(!user){
            throw new NotFoundException("User not found")
        }
        return user
    }

    async findByEmail(email: string): Promise<User | null>{
        return this.userRepo
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', {email})
        .getOne()

    }
    async update(id: string, dto:UpdateUserDto):Promise<User>{
        const user = await this.findOne(id)

        if(dto.email && dto.email !== user.email){
            const emailTaken =  await this.userRepo.findOne({
                where:{email: dto.email}
            })
            if(emailTaken){
                throw new ConflictException('Email already in use')
            }
        }
        const {password: _, ...safeDto} = dto

        Object.assign(user,safeDto)
        return this.userRepo.save(user)
    }

    async remove(id: string): Promise<void>{
        const user = await this.findOne(id)
        await this.userRepo.remove(user)
    }

    async toggleIsActive(id: string): Promise<User>{
        const user  = await this.findOne(id)
        user.isActive = !user.isActive

        return this.userRepo.save(user)
    }
}
