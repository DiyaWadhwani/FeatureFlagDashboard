import { Controller, Get } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly flags: FeatureService,
    private readonly checkout: CheckoutService,
  ) {}

  @Get('experience')
  async getCheckoutExperience() {
    const useNewCheckout = await this.flags.isEnabled('new_checkout_flow');

    return useNewCheckout
      ? this.checkout.newCheckout()
      : this.checkout.legacyCheckout();
  }
}
