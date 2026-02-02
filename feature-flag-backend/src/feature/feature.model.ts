import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { FeatureFlagTier } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(FeatureFlagTier, {
  name: 'FeatureFlagTier',
  description: 'Risk classification for feature flags',
});

@ObjectType()
export class FeatureFlag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  enabled: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Field(() => FeatureFlagTier)
  tier: FeatureFlagTier;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
