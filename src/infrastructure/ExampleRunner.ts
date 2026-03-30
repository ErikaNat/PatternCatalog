// src/infrastructure/ExampleRunner.ts

import { execSync } from 'child_process';
import * as path from 'path';
import { Example } from '../domain/Pattern';
import { ExampleRunnerPort } from '../domain/ExampleRunnerPort';

export class ExampleRunner implements ExampleRunnerPort {
  run(example: Example): string {
    const absolutePath = path.resolve(process.cwd(), example.filePath);
    try {
      const output = execSync(`npx ts-node "${absolutePath}"`, {
        encoding: 'utf-8',
        timeout: 15000,
        cwd: process.cwd(),
      });
      return output;
    } catch (error: any) {
      if (error.stdout) return error.stdout;
      return `   Error al ejecutar el ejemplo:\n${error.message}`;
    }
  }
}
