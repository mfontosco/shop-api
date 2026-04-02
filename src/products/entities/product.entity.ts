import { Categories } from "src/categories/entities/category.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum ProductStatus{
    Active = 'ACTIVE',
    InActive = 'INACTIVE',
    OutOfStock = 'OUT_OF_STOCK'
}

@Entity('products')
export class Product{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    name: string;

    @Column({type:"text", nullable: true})
    description: string;

    @Column({type: "decimal", precision: 10, scale: 2})
    price: number

    @Column({default: 0})
    stock:number;

    @Column({nullable: true})
    imageUrl: string;

    @Column({type:'enum',enum:ProductStatus, default:ProductStatus.Active})
    status: ProductStatus

    @ManyToOne(()=>Categories,{eager:true, nullable: false})
    @JoinColumn({name:'category_id'})
    category: Categories

    @ManyToOne(()=> User, {eager: false,nullable: false})
    @JoinColumn({name:"created_by"})
    createdBy: User

    @CreateDateColumn()
    createdAt: Date
    
    @CreateDateColumn()
    upatedAt: Date




}
