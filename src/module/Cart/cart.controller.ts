import { Body, Controller, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreatedCartDTO, UpdateCartDTO } from './dto/cart.dto';
import { TokenType } from 'src/common/enums/token.enums';
import { RoleType } from 'src/common/enums/user.enums';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import type { HUserDocument } from 'src/DB/models/user.model';
import { Types } from 'mongoose';

@Controller('carts')
export class CartController {
  constructor(private readonly CartService: CartService) {}
  /**
   *  add to  Cart
   * @param CartDTO
   * @param user
   * @returns the Cart
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @Post('/create')
  async addToCart(
    @Body() CartDTO: CreatedCartDTO,
    @User() user: HUserDocument,
  ) {
    const Cart = await this.CartService.addToCart(CartDTO, user);
    return { message: 'Done', Cart };
  }

  /**
   * Update quantity of a product in the cart
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @Patch('/update')
  async updateQuantity(
    @Body() CartDTO: UpdateCartDTO,
    @User() user: HUserDocument,
  ) {
    const Cart = await this.CartService.updateQuantity(CartDTO as any, user);
    return { message: 'Updated', Cart };
  }

  /**
   * Remove product from cart
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @Patch('/remove')
  async removeFromCart(
    @Body() dto: { productId: Types.ObjectId },
    @User() user: HUserDocument,
  ) {
    const Cart = await this.CartService.removeFromCart(dto as any, user);
    return { message: 'Removed', Cart };
  }
}
