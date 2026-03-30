// src/domain/ExampleRunnerPort.ts

import { Example } from './Pattern';

export interface ExampleRunnerPort {
  run(example: Example): string;
}
