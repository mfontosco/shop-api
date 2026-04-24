import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from "nodemailer"
import { Order } from 'src/orders/entities/orders.entity';
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: nodemailer.Transporter;

    constructor( private readonly config: ConfigService){
        this.transporter = nodemailer.createTransport({
            host: config.get<string>('MAIL_HOST'),
            port: config.get<number>('MAIL_PORT'),
            auth: {
                user: config.get<string>('MAIL_USER'),
                pass: config.get<string>('MAIL_PASS')
            }
        })
    }
      async sendOrderConfirmation(order: Order, userEmail: string): Promise<void> {
    const itemsList = order.items
      .map((i) => `  - ${i.product.name} × ${i.quantity}  $${i.subtotal}`)
      .join('\n');

    try {
      await this.transporter.sendMail({
        from:    this.config.get<string>('MAIL_FROM'),
        to:      userEmail,
        subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
        text: `
Hi there,

Your order has been confirmed!

Order ID: ${order.id}
Status:   ${order.status}

Items:
${itemsList}

Total: $${order.total}

Shipping to:
  ${order.shippingAddress.street}
  ${order.shippingAddress.city}, ${order.shippingAddress.state}
  ${order.shippingAddress.country} ${order.shippingAddress.zip}

Thank you for shopping with ShopAPI!
        `.trim(),
      });

      this.logger.log(`Order confirmation sent to ${userEmail}`);
    } catch (error) {
      // Log but don't throw — a failed email should never break the order flow
      this.logger.error(`Failed to send confirmation to ${userEmail}`, error);
    }
  }

  async sendStatusUpdate(
    order: Order,
    userEmail: string,
    oldStatus: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    this.config.get<string>('MAIL_FROM'),
        to:      userEmail,
        subject: `Your order is now ${order.status}`,
        text: `
Your order #${order.id.slice(0, 8).toUpperCase()} status has been updated.

Previous: ${oldStatus}
Current:  ${order.status}

Track your order at: http://localhost:3000/api/v1/orders/${order.id}
        `.trim(),
      });
    } catch (error) {
      this.logger.error(`Failed to send status update to ${userEmail}`, error);
    }
  }
}
