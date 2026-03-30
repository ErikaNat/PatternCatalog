// src/application/PatternUseCaseImpl.ts

import { Pattern, Example, CategoryGroup, PatternCategory } from '../domain/Pattern';
import { PatternRepositoryPort } from '../domain/PatternRepositoryPort';
import { ExampleRunnerPort } from '../domain/ExampleRunnerPort';
import { PatternUseCase } from './PatternUseCase';

export class PatternUseCaseImpl implements PatternUseCase {
  constructor(
    private readonly patternRepository: PatternRepositoryPort,
    private readonly exampleRunner: ExampleRunnerPort
  ) {}

  getAllCategories(): CategoryGroup[] {
    return this.patternRepository.getAllCategories();
  }

  getPatternsByCategory(category: PatternCategory): Pattern[] {
    return this.patternRepository.findByCategory(category);
  }

  getPatternById(id: string): Pattern | undefined {
    return this.patternRepository.findById(id);
  }

  runExample(example: Example): string {
    return this.exampleRunner.run(example);
  }
}
