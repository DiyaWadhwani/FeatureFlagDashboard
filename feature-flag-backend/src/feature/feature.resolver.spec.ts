import { Test, TestingModule } from '@nestjs/testing';
import { FeatureResolver } from './feature.resolver';

describe('FeatureResolver', () => {
  let resolver: FeatureResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureResolver],
    }).compile();

    resolver = module.get<FeatureResolver>(FeatureResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
