import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { ProductModel } from 'src/DB/models/product.model';
import { CartRepository } from 'src/DB/Repositories/cart.repository';
import { CartModel } from 'src/DB/models/cart.model';

@Module({
  imports: [UserModel, ProductModel, CartModel],
  controllers: [CartController],
  providers: [
    CartService,
    TokenService,
    JwtService,
    UserRepository,
    ProductRepository,
    CartRepository,
  ],
  exports: [],
})
export class CartModule {}
