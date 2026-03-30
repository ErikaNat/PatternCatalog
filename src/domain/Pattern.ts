// src/domain/Pattern.ts

export interface Example {
  id: string;
  title: string;
  description: string;
  filePath: string;
}

export interface Pattern {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  intent: string;
  examples: Example[];
}

export type PatternCategory = 'creacional' | 'estructural' | 'comportamiento';

export interface CategoryGroup {
  name: PatternCategory;
  label: string;
  patterns: Pattern[];
}
