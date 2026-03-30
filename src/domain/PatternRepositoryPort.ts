// src/domain/PatternRepositoryPort.ts

import { Pattern, PatternCategory, CategoryGroup } from './Pattern';

export interface PatternRepositoryPort {
  findAll(): Pattern[];
  findById(id: string): Pattern | undefined;
  findByCategory(category: PatternCategory): Pattern[];
  getAllCategories(): CategoryGroup[];
}
