import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  constructor() {}
  createCheckoutSession = async ({
    line_items,
    discounts,
    metadata,
    customer_email,
  }: {
    line_items: [];
    discounts?: Stripe.Checkout.SessionCreateParams.Discount[];
    metadata: {};
    customer_email: string;
  }) => {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      discounts,
      metadata,
      customer_email,
      success_url: 'http://localhost:3000/order/success',
      cancel_url: 'http://localhost:3000/order/cancel',
    });
    return session;
  };
  createCoupon = async ({
    percent_off,
    duration,
  }: {
    percent_off: number;
    duration: Stripe.Coupon.Duration;
  }) => {
    const coupon = await this.stripe.coupons.create({
      duration,
      percent_off,
    });
    return coupon;
  };
  createRefundPayment = async ({
    reason,
    payment_intent,
  }: {
    reason: Stripe.RefundCreateParams.Reason;
    payment_intent: string;
  }) => {
    const refund = await this.stripe.refunds.create({
      payment_intent,
      reason,
    });
    return refund;  
  };
}
