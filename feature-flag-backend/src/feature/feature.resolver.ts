import {
  Resolver,
  Query,
  ObjectType,
  Field,
  ID,
  Mutation,
  Args,
} from '@nestjs/graphql';

@ObjectType()
class FeatureFlag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  enabled: boolean;
}

@Resolver()
export class FeatureResolver {
  private flags = [
    { id: '1', name: 'dark_mode_v2', enabled: true },
    { id: '2', name: 'new_checkout_flow', enabled: false },
    { id: '3', name: 'beta_analytics', enabled: true },
  ];

  @Query(() => [FeatureFlag])
  featureFlags() {
    return this.flags;
  }

  @Mutation(() => FeatureFlag)
  toggleFeatureFlag(@Args('id') id: string) {
    const flag = this.flags.find((f) => f.id === id);
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    flag.enabled = !flag.enabled;
    return flag;
  }
}
