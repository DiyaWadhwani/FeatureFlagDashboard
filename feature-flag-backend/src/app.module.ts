import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { FeatureModule } from './feature/feature.module';
import { PrismaModule } from './prisma/prisma.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
    }),
    FeatureModule,
    CheckoutModule,
  ],
})
export class AppModule {}
