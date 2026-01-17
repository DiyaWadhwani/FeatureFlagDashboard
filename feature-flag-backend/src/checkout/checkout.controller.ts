import { Controller, Get, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { FeatureService } from '../feature/feature.service';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly features: FeatureService,
  ) {}

  @Get('experience')
  async getCheckoutExperience() {
    const useNewCheckout = await this.features.isEnabled('new_checkout_flow');
    return useNewCheckout
      ? this.checkout.newCheckout()
      : this.checkout.legacyCheckout();
  }

  @Post('complete')
  async completePurchase() {
    const result = await this.checkout.completeOrder();
    return result;
  }
}
