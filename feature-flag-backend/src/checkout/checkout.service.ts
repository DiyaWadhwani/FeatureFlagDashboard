import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckoutService {
  legacyCheckout() {
    return {
      version: 'v1',
      total: 100,
      shipping: 5,
      message: 'Legacy checkout applied',
    };
  }

  newCheckout() {
    return {
      version: 'v2',
      total: 90,
      shipping: 0,
      message: 'New checkout applied with dynamic pricing and free shipping',
    };
  }
}
