// src/patterns/creacional/singleton/app-config.singleton.ts
interface Config {
  appName: string;
  version: string;
  maxRetries: number;
  debug: boolean;
  apiUrl: string;
}

class AppConfig {
  private static instance: AppConfig;
  private config: Config;

  private constructor() {
    this.config = {
      appName: 'PatternsApp',
      version: '1.0.0',
      maxRetries: 3,
      debug: false,
      apiUrl: 'https://api.empresa.com',
    };
  }

  static getInstance(): AppConfig {
    return AppConfig.instance ||= new AppConfig();
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
  }

  getAll(): Config {
    return { ...this.config };
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('        SINGLETON — App Configuration       ');
console.log('═══════════════════════════════════════════\n');

const configA = AppConfig.getInstance();
const configB = AppConfig.getInstance();

console.log(`✓ Una sola instancia: ${configA === configB}\n`);

console.log('Configuración inicial:');
console.log(configA.getAll());
console.log();

configA.set('debug', true);
configA.set('maxRetries', 5);
configA.set('apiUrl', 'https://api.produccion.com');

console.log('Cambios reflejados en la misma instancia:');
console.log(`  debug:      ${configB.get('debug')}`);
console.log(`  maxRetries: ${configB.get('maxRetries')}`);
console.log(`  apiUrl:     ${configB.get('apiUrl')}`);