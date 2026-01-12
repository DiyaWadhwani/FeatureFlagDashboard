import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { FeatureModule } from '../feature/feature.module';

@Module({
  imports: [FeatureModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
