import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm"
import { UsersModule } from './users/users.module';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

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
    UsersModule,
    CategoriesModule,
    ProductsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_INTERCEPTOR, useClass: ResponseInterceptor},
    {provide: APP_FILTER, useClass: GlobalExceptionFilter}
  ],
})
export class AppModule implements NestModule {
  configure( consumer: MiddlewareConsumer){
    consumer.apply(LoggerMiddleware).forRoutes("*")
  }
}
