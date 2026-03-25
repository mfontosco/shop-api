import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule,ConfigService } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm"
import { UsersModule } from './users/users.module';

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

    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
