import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/orders.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Order,OrderItem,Product]),
    ProductsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports:[OrdersService]
})
export class OrdersModule {}
