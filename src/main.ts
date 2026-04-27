import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'
import { WinstonModule } from 'nest-winston';
import * as winston from "winston"
import {DocumentBuilder,SwaggerModule} from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({timestamp,level,message,context})=>{
              return `${timestamp} [${context ?? 'App'}] ${level}: ${message}`;
            }),
          ),
        }),

        new winston.transports.File({
          filename:'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),

        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    })
  });

  const config = app.get(ConfigService)

  app.use(helmet())

  app.setGlobalPrefix("/api/v1");

  app.enableCors({
    origin: ['http://localhost: 3001'],
    credentials: true
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )
 const swaggerConfig = new DocumentBuilder()
 .setTitle('ShopAPI')
  .setDescription('A production-grade e-commerce REST API built with Nestjs')
  .setVersion('1.0')
  .addBearerAuth(
    {type: 'http',scheme: "bearer", bearerFormat: "JWT", in: 'header'},
    'access-token'
  )
  .addTag('auth', 'Registration,Login, token refresh')
  .addTag('users', 'User management')
  .addTag('categories', 'Product categories')
  .addTag('products', 'Product catalogue')
  .addTag('orders', 'Order placement and management')
  .addTag('health', 'Service health probes')
  .build();


  const document =  SwaggerModule.createDocument(app,swaggerConfig);
    SwaggerModule.setup('api/docs',app,document,{
      swaggerOptions: {persistAuthorization: true}
    })

  const port = config.get<number>('PORT') ?? 3000 
  await app.listen(port);
  console.log(`shop api eunning on http://localhost:${port}/api/v1`)
  console.log(`Swagger: http://localhost:${port}/api/docs`)
}
bootstrap();
