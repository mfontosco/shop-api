import { Product } from "src/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class Categories{
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({unique: true, length: 100})
    name: string

    @Column({type: 'text', nullable: true})
    description: string

    @Column({default: true})
    isActive:boolean;

    @CreateDateColumn()
    createdAt: Date

    @CreateDateColumn()
    updatedAt: Date

    @OneToMany(()=>Product,(product)=>product.category)
    products: Product[]



}