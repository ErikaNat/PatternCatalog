// src/patterns/estructural/decorator/logger.decorator.ts

interface DataService {
  getData(id: string): string;
  saveData(id: string, data: string): void;
}

class RealDataService implements DataService {
  getData(id: string): string {
    const start = Date.now();
    while (Date.now() - start < 10) {} // 10ms
    return `{ "id": "${id}", "value": "datos_reales_${id}", "ts": ${Date.now()} }`;
  }

  saveData(id: string, data: string): void {
    const start = Date.now();
    while (Date.now() - start < 5) {}
  }
}

class LoggedDataService implements DataService {
  constructor(private readonly wrapped: DataService) {}

  getData(id: string): string {
    console.log(`[LOG] → getData("${id}") iniciado`);
    const start = Date.now();
    const result = this.wrapped.getData(id);
    const elapsed = Date.now() - start;
    console.log(`[LOG] ← getData("${id}") completado en ${elapsed}ms`);
    console.log(`[LOG]   resultado: ${result}`);
    return result;
  }

  saveData(id: string, data: string): void {
    console.log(`[LOG] → saveData("${id}") iniciado`);
    const start = Date.now();
    this.wrapped.saveData(id, data);
    const elapsed = Date.now() - start;
    console.log(`[LOG] ← saveData("${id}") completado en ${elapsed}ms`);
  }
}

class CachedDataService implements DataService {
  private cache: Map<string, string> = new Map();

  constructor(private readonly wrapped: DataService) {}

  getData(id: string): string {
    if (this.cache.has(id)) {
      console.log(`[CACHE]    HIT para id="${id}" — evitando llamada al servicio real`);
      return this.cache.get(id)!;
    }
    console.log(`[CACHE] MISS para id="${id}" — delegando al siguiente decorador`);
    const result = this.wrapped.getData(id);
    this.cache.set(id, result);
    return result;
  }

  saveData(id: string, data: string): void {
    this.cache.delete(id); // invalida caché al guardar
    console.log(`[CACHE]     Caché invalidada para id="${id}"`);
    this.wrapped.saveData(id, data);
  }
}

console.log('══════════════════════════════════════════════');
console.log('   DECORATOR — Logger + Cache sobre DataService');
console.log('══════════════════════════════════════════════\n');

const service: DataService = new CachedDataService(
  new LoggedDataService(
    new RealDataService()
  )
);

console.log('── Llamada 1: getData("user-42") — primera vez ──────');
service.getData('user-42');
console.log();

console.log('── Llamada 2: getData("user-42") — segunda vez (debe ser CACHE HIT) ──');
service.getData('user-42');
console.log();

console.log('── Llamada 3: saveData("user-42", ...) — invalida caché ──────────────');
service.saveData('user-42', '{ "value": "dato_actualizado" }');
console.log();

console.log('── Llamada 4: getData("user-42") — tras invalidación (MISS de nuevo) ─');
service.getData('user-42');
