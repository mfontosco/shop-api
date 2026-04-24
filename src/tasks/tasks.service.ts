import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/orders.entity' ;
import { Product, ProductStatus } from '../products/entities/product.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,

    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // Runs every night at midnight
  // Cancels orders that have been Pending for more than 24 hours
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cancelStalePendingOrders() {
    this.logger.log('Running: cancel stale pending orders');

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const staleOrders = await this.ordersRepo.find({
      where: {
        status:    OrderStatus.Pending,
        createAt: LessThan(cutoff),
      },
      relations: ['items', 'items.product'],
    });

    for (const order of staleOrders) {
      order.status = OrderStatus.Canceled;
      await this.ordersRepo.save(order);

      // Restore stock
      for (const item of order.items) {
        await this.productsRepo.increment(
          { id: item.product.id },
          'stock',
          item.quantity,
        );
      }
    }

    this.logger.log(`Cancelled ${staleOrders.length} stale orders`);
  }

  // Runs every hour — marks products with 0 stock as OUT_OF_STOCK
  @Cron(CronExpression.EVERY_HOUR)
  async syncProductStockStatus() {
    this.logger.log('Running: sync product stock status');

    // Mark out of stock
    const outOfStock = await this.productsRepo.find({
      where: { stock: 0, status: ProductStatus.Active },
    });
    for (const p of outOfStock) {
      p.status = ProductStatus.OutOfStock;
      await this.productsRepo.save(p);
    }

    // Mark back to active if stock restored
    const backInStock = await this.productsRepo.find({
      where: { status: ProductStatus.OutOfStock },
    });
    for (const p of backInStock) {
      if (p.stock > 0) {
        p.status = ProductStatus.Active;
        await this.productsRepo.save(p);
      }
    }

    this.logger.log(
      `Stock sync: ${outOfStock.length} marked out of stock, ` +
      `${backInStock.filter(p => p.stock > 0).length} restored to active`,
    );
  }

  // Runs every 5 minutes — just a health log to confirm scheduler is alive
  @Cron(CronExpression.EVERY_5_MINUTES)
  async healthLog() {
    this.logger.log('Scheduler heartbeat — all tasks running normally');
  }
}