import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BrandModule } from './module/brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL as string, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => {
          console.log('Data base Connected');
        });
        connection.on('disconnected', () => {
          console.log('Data base Disconnected');
        });
      },
    }),
    UserModule,
    BrandModule,
  ], // add any module here
  controllers: [AppController], // your project controllers
  providers: [AppService], // your project services
})
export class AppModule {}
