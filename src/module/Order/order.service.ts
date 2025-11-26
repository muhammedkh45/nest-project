import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from 'src/DB/Repositories/cart.repository';
import { CouponRepository } from 'src/DB/Repositories/coupon.repository';
import { OrderRepository } from 'src/DB/Repositories/order.repository';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { CreateOrderDto, ParamDTO } from './dto/order.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import {
  OrderStatusEnum,
  PaymentMethodEnum,
} from 'src/common/enums/order.enum';
import ca from 'zod/v4/locales/ca.js';
import { StripeService } from 'src/common/services/Payment/stripe.service';
import { ref } from 'process';

@Injectable()
export class OrderService {
  constructor(
    private readonly Ordermodel: OrderRepository,
    private readonly productModel: ProductRepository,
    private readonly couponModel: CouponRepository,
    private readonly cartModel: CartRepository,
    private readonly stripeService: StripeService,
  ) {}
  async createOrder(OrederDTo: CreateOrderDto, user: HUserDocument) {
    try {
      const { address, phone, paymentMethod, coupon } = OrederDTo;
      let Validcoupon;
      if (coupon) {
        Validcoupon = await this.couponModel.findOne({
          code: coupon,
          isActive: true,
        });
        if (!Validcoupon) throw new Error('Coupon not found');
        if (Validcoupon.usageLimit <= Validcoupon.usedCount)
          throw new Error('Coupon is expired');
      }

      const cart = await this.cartModel.findOne({ createdBy: user._id });
      if (!cart || cart.products.length === 0)
        throw new Error('Cart not found');

      const products = await this.productModel.find({
        filter: {
          _id: { $in: cart.products.map((p) => p.productId) },
          stock: { $gte: cart.products.map((p) => p.quantity) },
        },
      });
      if (!products) throw new Error('Product not found');
      const order = await this.Ordermodel.createOneOrder({
        userId: user._id,
        cart: cart._id,
        address,
        phone,
        paymentMethod,
        coupon: coupon ? Validcoupon._id : undefined,
        totalPrice: coupon
          ? cart.subTotal - (cart.subTotal * Validcoupon.discount) / 100
          : cart.subTotal,
        status:
          paymentMethod === PaymentMethodEnum.CASH
            ? OrderStatusEnum.PLACED
            : OrderStatusEnum.PENDING,
      });
      for (const product of cart.products) {
        const updatedProducts = await this.productModel.findOneAndUpdate(
          { _id: product.productId },
          { $inc: { stock: -product.quantity } },
        );
      }

      if (paymentMethod === PaymentMethodEnum.CASH) {
        await this.cartModel.findOneAndUpdate(
          { _id: cart._id },
          { products: [] },
        );
      }
      return order;
    } catch (error) {
      throw new Error("order can't be created" + error.message, {
        cause: error.cause,
      });
    }
  }

  async checkOut(_id: ParamDTO, user: HUserDocument) {
    try {
      const order = await this.Ordermodel.findOne({
        _id,
        status: OrderStatusEnum.PENDING,
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      await order.populate({
        path: 'cart',
        populate: {
          path: 'products',
          populate: { path: 'productId' },
        },
      });
      await order.populate({ path: 'coupon' });
      let coupon;
      if (order.coupon) {
        coupon = await this.stripeService.createCoupon({
          percent_off: (order.coupon as any).discount,
          duration: 'forever',
        });
      }

      const { url } = await this.stripeService.createCheckoutSession({
        customer_email: user.email,
        metadata: {
          order_id: order._id.toString(),
        },
        line_items: order.cart['products'].map((product) => ({
          price_data: {
            currency: 'EGP',
            product_data: {
              name: product.productId.name,
              images: [product.productId.mainImage],
            },
            unit_amount: product.productId.price * 100,
          },
          quantity: product.quantity,
        })),
        discounts: coupon
          ? [
              {
                coupon: coupon.id,
              },
            ]
          : [],
      });
      return url;
    } catch (error) {
      throw new Error(`${error.srack} \n ${error.message}`, {
        cause: error.cause,
      });
    }
  }
  async webhook(body: any) {
    try {
      const orderId = body.data.object.metadata.order_id;
      const order = await this.Ordermodel.findOne({ _id: orderId });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (body.type === 'checkout.session.completed') {
        order.status = OrderStatusEnum.PAID;
        order.paymentIntent = body.data.object.payment_intent;
        await order.save();
      }

      return order;
    } catch (error) {
      throw new Error(`${error.srack} \n ${error.message}`, {
        cause: error.cause,
      });
    }
  }

  async refund(_id: ParamDTO, user: HUserDocument) {
    try {
      const order = await this.Ordermodel.findOneAndUpdate(
        {
          _id,
          status: { $in: [OrderStatusEnum.PENDING, OrderStatusEnum.PLACED] },
        },
        {
          status: OrderStatusEnum.CANCELLED,
          orderChanges: {
            canceledAt: new Date(),
            canceledBy: user._id,
          },
        },
        { new: true },
      );
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      if (order.paymentMethod === PaymentMethodEnum.CARD) {
        await this.stripeService.createRefundPayment({
          payment_intent: order.paymentIntent,
          reason: 'requested_by_customer',
        });
        await this.Ordermodel.findOneAndUpdate(
          { _id },
          {
            status: OrderStatusEnum.REFUNDED,
            orderChanges: {
              refundedAt: new Date(),
              refundedBy: user._id,
            },
          },
        );
      }
      return order;
    } catch (error) {
      throw new Error(`${error.srack} \n ${error.message}`, {
        cause: error.cause,
      });
    }
  }
}
