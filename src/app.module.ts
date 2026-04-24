import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm"
import { UsersModule } from './users/users.module';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.gaurd';
import { RolesGuard } from './auth/guards/roles.guard';
import { OrdersModule } from './orders/orders.module';
import  {CacheModule} from '@nestjs/cache-manager'
import { CacheableMemory, createKeyv } from "cacheable"
import KeyvRedis from '@keyv/redis'
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    AuthModule,

    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: (config: ConfigService) =>({
        type:'postgres',
        host:  config.get<string>('DB_HOST'),
        port:  config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development'
    }),
    inject:[ConfigService]
    }),
    ThrottlerModule.forRoot([{ttl:60000,limit :100}]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService)=>({
        stores: [
          createKeyv(new CacheableMemory({ttl: 30000, lruSize: 5000})),
          new KeyvRedis(`redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`),
        ]
      })
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config:ConfigService)=>({
        connection:{
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT')
        }
      })
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    EmailModule,
    NotificationsModule,
    TasksModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_INTERCEPTOR, useClass: ResponseInterceptor},
    {provide: APP_FILTER, useClass: GlobalExceptionFilter},
    { provide: APP_GUARD, useClass: JwtAuthGuard  },
{ provide: APP_GUARD, useClass: RolesGuard   },
NotificationsGateway,
  ],
})
export class AppModule implements NestModule {
  configure( consumer: MiddlewareConsumer){
    consumer.apply(LoggerMiddleware).forRoutes("*")
  }
}
