import { Injectable } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly flags: FeatureService) {}
  private readonly items = [
    { name: 'Coffee Beans', price: 40 },
    { name: 'Mug', price: 30 },
  ];

  legacyCheckout() {
    const subtotal = this.items.reduce((sum, i) => sum + i.price, 0);

    return {
      version: 'v1' as const,
      items: this.items,
      shipping: 10,
      total: subtotal + 10,
      message: 'Legacy checkout applied',
    };
  }

  newCheckout() {
    const subtotal = this.items.reduce((sum, i) => sum + i.price, 0);
    const discount = Math.round(subtotal * 0.25);

    return {
      version: 'v2' as const,
      items: this.items,
      subtotal,
      discount,
      shipping: 0,
      total: subtotal - discount,
      message: 'Holiday pricing applied! Enjoy 25% off your order.',
    };
  }

  async completeOrder() {
    const subtotal = this.items.reduceRight((sum, i) => sum + i.price, 0);

    if (await this.flags.isEnabled('beta_analytics')) {
      console.log('[ANALYTICS]', {
        event: 'CHECKOUT_COMPLETED',
        subtotal,
        itemCount: this.items.length,
        timestamp: new Date().toISOString(),
      });
    }
    return {
      success: true,
      message: 'Order completed successfully',
      orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
    };
  }
}
