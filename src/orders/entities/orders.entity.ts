import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    Pending = "PENDING",
    Confirmed = "CONFIRMED",
    Shipped = "SHIPPED",
    Delivered = "DELIVERED",
    Canceled ="CANCELLED"
}

@Entity("orders")
export class Order{
@PrimaryGeneratedColumn("uuid")
id: string

@Column({ type: 'enum', enum: OrderStatus, default:OrderStatus.Pending})
status: OrderStatus

@Column({type: "decimal", precision: 10, scale: 2})
total: number

@Column({type: 'jsonb', nullable: true})
shippingAddress: {
street: string,
city: string,
state: string,
country: string,
zip: string
}

@Column({type: 'text', nullable: true})
notes: string;


@ManyToOne(()=> User, {eager: false, nullable: false})
@JoinColumn({name:"user_id"})
user: User


@OneToMany(()=> OrderItem, (item) => item.order,{
    cascade: true,
    eager: true
})
items: OrderItem[]

@CreateDateColumn()
createAt: Date;

@UpdateDateColumn()
updatedAt: Date;

}