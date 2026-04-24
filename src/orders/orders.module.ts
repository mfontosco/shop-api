import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/orders.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';
import { EmailModule } from 'src/email/email.module';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from './processors/order.processor';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ORDER_QUEUE } from './queues/order.queue';

@Module({
  imports:[
    TypeOrmModule.forFeature([Order,OrderItem,Product]),
    ProductsModule,
    NotificationsModule,
    EmailModule,
    BullModule.registerQueue({ name: ORDER_QUEUE }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService,OrderProcessor],
  exports:[OrdersService]
})
export class OrdersModule {}
