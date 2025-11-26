import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { ProductModel } from 'src/DB/models/product.model';
import { OrderRepository } from 'src/DB/Repositories/order.repository';
import { OrderModel } from 'src/DB/models/order.model';
import { CartModel } from 'src/DB/models/cart.model';
import { CouponModel } from 'src/DB/models/coupon.model';
import { CartRepository } from 'src/DB/Repositories/cart.repository';
import { CouponRepository } from 'src/DB/Repositories/coupon.repository';
import { StripeService } from 'src/common/services/Payment/stripe.service';

@Module({
  imports: [UserModel, CartModel, ProductModel, OrderModel, CouponModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    TokenService,
    JwtService,
    CartRepository,
    CouponRepository,
    ProductRepository,
    OrderRepository,
    UserRepository,
    StripeService,
  ],
  exports: [],
})
export class OrderModule {}
