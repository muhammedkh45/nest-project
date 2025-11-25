import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from 'src/DB/Repositories/cart.repository';
import { CreatedCartDTO } from './dto/cart.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class CartService {
  constructor(
    private readonly Cartmodel: CartRepository,
    private readonly productModel: ProductRepository,
  ) {}

  async addToCart(CartDTO: CreatedCartDTO, user: HUserDocument) {
    try {
      let { productId, quantity } = CartDTO;
      const product = await this.productModel.findOne({
        _id: productId,
        stock: { $gte: quantity },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      const cart = await this.Cartmodel.findOne({ createdBy: user._id });
      if (!cart) {
        const newCart = await this.Cartmodel.createOneCart({
          createdBy: user._id,
          products: [{ productId, quantity, finalPrice: product.price }],
        });
        return newCart;
      }
      const productCart = cart.products.find(
        (product) => product.productId.toString() === productId.toString(),
      );
      if (productCart) {
        throw new ConflictException('Product alreay exists');
      }
      cart.products.push({ quantity, productId, finalPrice: product.price });
      cart.save();
      return cart;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeFromCart(CartDTO: { productId: any }, user: HUserDocument) {
    try {
      const { productId } = CartDTO;
      const cart = await this.Cartmodel.findOne({ createdBy: user._id });
      if (!cart) throw new NotFoundException('Cart not found');

      const idx = cart.products.findIndex(
        (p) => p.productId.toString() === productId.toString(),
      );
      if (idx === -1) throw new NotFoundException('Product not in cart');

      cart.products.splice(idx, 1);
      await cart.save();
      return cart;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateQuantity(
    CartDTO: { productId: any; quantity?: number },
    user: HUserDocument,
  ) {
    try {
      const { productId, quantity } = CartDTO;
      if (quantity == null) {
        throw new BadRequestException('Quantity is required');
      }

      const product = await this.productModel.findOne({ _id: productId });
      if (!product) throw new NotFoundException('Product not found');
      if (product.stock < quantity)
        throw new BadRequestException('Requested quantity exceeds stock');

      const cart = await this.Cartmodel.findOne({ createdBy: user._id });
      if (!cart) throw new NotFoundException('Cart not found');

      const productCart = cart.products.find(
        (p) => p.productId.toString() === productId.toString(),
      );
      if (!productCart) throw new NotFoundException('Product not in cart');

      productCart.quantity = quantity;
      productCart.finalPrice = product.price;

      await cart.save();
      return cart;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
