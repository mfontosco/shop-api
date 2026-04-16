import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./orders.entity";
import { Product } from "src/products/entities/product.entity";


@Entity("order_items")
export class OrderItem{
@PrimaryGeneratedColumn("uuid")
id: string

@Column()
quantity: number

@Column({type: 'decimal', precision: 10, scale: 2})
unitPrice: number;

@Column({type: "decimal", precision:10, scale:2})
subtotal: number

@ManyToOne(()=> Order, (order)=> order.items, {onDelete: 'CASCADE'})
@JoinColumn({name: 'order_id'})
order: Order

@ManyToOne(()=> Product, {eager: true, nullable: false})
@JoinColumn({name:"product_id"})
product: Product
}