// src/index.ts

import { InMemoryPatternRepository } from './infrastructure/InMemoryPatternRepository';
import { ExampleRunner } from './infrastructure/ExampleRunner';
import { PatternUseCaseImpl } from './application/PatternUseCaseImpl';
import { Menu } from './infrastructure/Menu';

async function main(): Promise<void> {
  const patternRepository = new InMemoryPatternRepository();
  const exampleRunner = new ExampleRunner();

  const patternUseCase = new PatternUseCaseImpl(patternRepository, exampleRunner);
  const menu = new Menu(patternUseCase);

  await menu.start();
}

main().catch((err) => {
  console.error('   Error fatal:', err);
  process.exit(1);
});
