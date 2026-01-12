import { Resolver, Query, ID, Mutation, Args } from '@nestjs/graphql';
import { FeatureService } from './feature.service';
import { FeatureFlag } from './feature.model';

@Resolver(() => FeatureFlag)
export class FeatureResolver {
  constructor(private readonly featureService: FeatureService) {}

  @Query(() => [FeatureFlag])
  featureFlags(): Promise<FeatureFlag[]> {
    return this.featureService.getAllFeatureFlags();
  }

  @Mutation(() => FeatureFlag)
  toggleFeatureFlag(@Args('id', { type: () => ID }) id: string) {
    return this.featureService.toggleFeatureFlag(id);
  }
}
