import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server,Socket } from 'socket.io';
import { Order } from 'src/orders/entities/orders.entity';

@WebSocketGateway({
  cors:"*",
  namespace:"/notifications"
})
export class NotificationsGateway 
  implements OnGatewayConnection,OnGatewayDisconnect {
 
    @WebSocketServer()
    server: Server


    private readonly logger = new Logger(NotificationsGateway.name)

    handleConnection (client: Socket) {
      this.logger.log(`Client connected: ${client.id}`)
    }

    handleDisconnect (client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`)
    }


    @SubscribeMessage('subscribe')
    handleSubscribe(@ConnectedSocket() client:Socket,
  @MessageBody() data: {userId:string}) {
    const room = `user: ${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`)

    return {
      event:"subscribed",
      room
    }
  }

  notifyOrderUpdate(userId: string, order:Partial<Order>){
    const room = `user: ${userId}`;
    this.server.to(room).emit("order:updated",{
      orderId: order.id,
      status: order.status,
      updatedAt: order.updatedAt
    });
    this.logger.log(`Emitted order: updated to room ${room}`);
  }
  broadcatSystemMessage(message: string){
    this.server.emit("ssysstem:message",{message, timestamp: new Date()})
  }
}
