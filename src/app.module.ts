import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './module/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BrandModule } from './module/brand/brand.module';
import { CategoryModule } from './module/category/category.module';
import { SubCategoryModule } from './module/subCategory/subCategory.module';
import { ProductModule } from './module/product/product.module';
import { CartModule } from './module/Cart/cart.module';
import { CouponModule } from './module/Coupon/coupon.module';
import { OrderModule } from './module/Order/order.module';

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
    CategoryModule,
    SubCategoryModule,
    ProductModule,
    CartModule,
    CouponModule,
    OrderModule,
  ], // add any module here
  controllers: [AppController], // your project controllers
  providers: [AppService], // your project services
})
export class AppModule {}
