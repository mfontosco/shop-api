import { BeforeInsert, Column, CreateDateColumn, Entity,PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';

export enum UserRole{
    Admin = 'ADMIN',
    User = 'USER',
}
@Entity('users')
export class User{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column({length: 100})
    name: string

    @Column({unique: true, length: 150})
    email: string;

    @Column({select:false})
    password: string;

    @Column({type: 'enum', enum: UserRole, default: UserRole.User})
    role: UserRole

    @Column({default: true})
    isActive: boolean

    @CreateDateColumn()
    createdAt:Date


    @CreateDateColumn()
    updatedAt: Date


    @BeforeInsert()
    async hashPassword(){
        if(this.password){
            this.password = await bcrypt.hash(this.password,12)
        }
    }




}