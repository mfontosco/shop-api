import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const port = config.get<number>('PORT') ?? 3000 
  await app.listen(port);
  console.log(`shop api eunning on http://localhost:${port}/api/v1`)
}
bootstrap();
