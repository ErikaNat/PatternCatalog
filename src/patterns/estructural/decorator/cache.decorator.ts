// src/patterns/estructural/decorator/cache.decorator.ts

// ── Interfaz base ─────────────────────────────────────────────────────────────
interface UserService {
  findUser(id: string): { id: string; name: string; email: string } | null;
}

// ── Implementación real con delay simulado ────────────────────────────────────
class RealUserService implements UserService {
  private callCount = 0;

  findUser(id: string): { id: string; name: string; email: string } | null {
    this.callCount++;
    // Simula latencia de red/BD (síncrono para demostración)
    const start = Date.now();
    while (Date.now() - start < 20) {}

    const users: Record<string, { id: string; name: string; email: string }> = {
      'u-1': { id: 'u-1', name: 'Alice López',  email: 'alice@empresa.com' },
      'u-2': { id: 'u-2', name: 'Bob Martínez', email: 'bob@empresa.com' },
    };

    console.log(`[REAL-SVC]    Consulta #${this.callCount} a la base de datos para id="${id}"`);
    return users[id] ?? null;
  }

  getCallCount(): number { return this.callCount; }
}

// ── Decorator: Cache con TTL ──────────────────────────────────────────────────
interface CacheEntry {
  value: { id: string; name: string; email: string } | null;
  expiresAt: number;
}

class CachedUserService implements UserService {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;

  constructor(
    private readonly wrapped: RealUserService,
    private readonly ttlMs: number = 5000
  ) {}

  findUser(id: string): { id: string; name: string; email: string } | null {
    const cached = this.cache.get(id);

    if (cached && Date.now() < cached.expiresAt) {
      this.hitCount++;
      console.log(`[CACHE]    HIT #${this.hitCount} para id="${id}" (expira en ${Math.round((cached.expiresAt - Date.now()) / 1000)}s)`);
      return cached.value;
    }

    if (cached) {
      console.log(`[CACHE]    EXPIRED para id="${id}" — recargando...`);
    } else {
      console.log(`[CACHE] MISS para id="${id}" — consultando servicio real...`);
    }

    const result = this.wrapped.findUser(id);
    this.cache.set(id, { value: result, expiresAt: Date.now() + this.ttlMs });
    console.log(`[CACHE]    Almacenado en caché con TTL de ${this.ttlMs}ms`);
    return result;
  }

  getStats(): { hits: number; dbCalls: number } {
    return { hits: this.hitCount, dbCalls: this.wrapped.getCallCount() };
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('       DECORATOR — Cache sobre UserService  ');
console.log('═══════════════════════════════════════════\n');

const realService = new RealUserService();
const cachedService = new CachedUserService(realService, 3000);

console.log('── Llamada 1: findUser("u-1") — primera vez ────────');
const user1a = cachedService.findUser('u-1');
console.log(`   Resultado: ${JSON.stringify(user1a)}\n`);

console.log('── Llamada 2: findUser("u-1") — segunda vez (CACHE HIT) ─');
const user1b = cachedService.findUser('u-1');
console.log(`   Resultado: ${JSON.stringify(user1b)}\n`);

console.log('── Llamada 3: findUser("u-2") — usuario diferente ──────');
const user2 = cachedService.findUser('u-2');
console.log(`   Resultado: ${JSON.stringify(user2)}\n`);

console.log('── Llamada 4: findUser("u-2") — CACHE HIT ──────────────');
cachedService.findUser('u-2');
console.log();

console.log('── Llamada 5: findUser("u-99") — usuario inexistente ───');
const notFound = cachedService.findUser('u-99');
console.log(`   Resultado: ${notFound}\n`);

const stats = cachedService.getStats();
console.log(`   Estadísticas: ${stats.hits} hits de caché | ${stats.dbCalls} llamadas reales a BD`);
console.log(`   Llamadas ahorradas: ${stats.hits} de ${stats.hits + stats.dbCalls} totales`);
