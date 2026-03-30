// src/application/PatternUseCase.ts

import { Pattern, Example, CategoryGroup, PatternCategory } from '../domain/Pattern';

export interface PatternUseCase {
  getAllCategories(): CategoryGroup[];
  getPatternsByCategory(category: PatternCategory): Pattern[];
  getPatternById(id: string): Pattern | undefined;
  runExample(example: Example): string;
}
