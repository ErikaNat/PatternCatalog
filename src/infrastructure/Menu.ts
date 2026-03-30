// src/infrastructure/Menu.ts

import * as readline from 'readline';
import { PatternUseCase } from '../application/PatternUseCase';
import { CategoryGroup, Pattern, Example } from '../domain/Pattern';

export class Menu {
  private rl: readline.Interface;

  constructor(private readonly patternUseCase: PatternUseCase) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start(): Promise<void> {
    this.printHeader();
    await this.showCategories();
    this.rl.close();
  }

  private printHeader(): void {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║             CATÁLOGO DE PATRONES DE DISEÑO               ║');
    console.log('║              Arquitectura Hexagonal · TypeScript         ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log();
  }

  private ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => resolve(answer.trim()));
    });
  }

  private async showCategories(): Promise<void> {
    while (true) {
      this.printHeader();
      const categories: CategoryGroup[] = this.patternUseCase.getAllCategories();

      console.log('  Selecciona una categoría:\n');
      categories.forEach((cat, i) => {
        console.log(`  [${i + 1}] ${cat.label}  (${cat.patterns.length} patrones)`);
      });
      console.log('\n  [0] Salir');
      console.log();

      const input = await this.ask('  → Opción: ');
      const choice = parseInt(input);

      if (choice === 0) {
        console.log('\n   ¡Hasta luego!\n');
        break;
      }

      if (choice >= 1 && choice <= categories.length) {
        await this.showPatterns(categories[choice - 1]);
      } else {
        console.log('\n   Opción inválida. Presiona Enter para continuar...');
        await this.ask('');
      }
    }
  }

  private async showPatterns(category: CategoryGroup): Promise<void> {
    while (true) {
      this.printHeader();
      console.log(`    ${category.label}\n`);
      category.patterns.forEach((pattern, i) => {
        console.log(`  [${i + 1}] ${pattern.name}`);
        console.log(`       ${pattern.description}`);
        console.log();
      });
      console.log('  [0] Volver a categorías');
      console.log();

      const input = await this.ask('  → Opción: ');
      const choice = parseInt(input);

      if (choice === 0) break;

      if (choice >= 1 && choice <= category.patterns.length) {
        await this.showExamples(category.patterns[choice - 1]);
      } else {
        console.log('\n     Opción inválida. Presiona Enter para continuar...');
        await this.ask('');
      }
    }
  }

  private async showExamples(pattern: Pattern): Promise<void> {
    while (true) {
      this.printHeader();
      console.log(`    ${pattern.name}  ·  ${pattern.category}`);
      console.log(`  ─────────────────────────────────────────────`);
      console.log(`  ${pattern.intent}\n`);
      console.log('  Ejemplos disponibles:\n');

      pattern.examples.forEach((ex, i) => {
        console.log(`  [${i + 1}] ${ex.title}`);
        console.log(`       ${ex.description}`);
        console.log();
      });
      console.log('  [0] Volver a patrones');
      console.log();

      const input = await this.ask('  → Opción: ');
      const choice = parseInt(input);

      if (choice === 0) break;

      if (choice >= 1 && choice <= pattern.examples.length) {
        await this.runExample(pattern, pattern.examples[choice - 1]);
      } else {
        console.log('\n     Opción inválida. Presiona Enter para continuar...');
        await this.ask('');
      }
    }
  }

  private async runExample(pattern: Pattern, example: Example): Promise<void> {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log(`║        ${pattern.name} — ${example.title}`.padEnd(61) + '║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`    ${example.description}`);
    console.log(`    ${example.filePath}`);
    console.log();
    console.log('  ──────────────── Salida del ejemplo ────────────────────');
    console.log();

    const output = this.patternUseCase.runExample(example);
    console.log(output);

    console.log('  ─────────────────────────────────────────────────────────');
    console.log();
    console.log('  [1] Volver al menú    [2] Salir');
    console.log();

    const input = await this.ask('  → Opción: ');
    if (input === '2') {
      console.log('\n   ¡Hasta luego!\n');
      this.rl.close();
      process.exit(0);
    }
    // Cualquier otra tecla vuelve al menú (el bucle de showExamples lo maneja)
  }
}
