// src/patterns/comportamiento/observer/event-system.observer.ts

type ObserverFn = (data: unknown) => void;

class EventEmitter {
  private listeners: Map<string, ObserverFn[]> = new Map();

  on(event: string, observer: ObserverFn): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(observer);
    console.log(`[EMITTER]    Observer suscrito al evento "${event}"`);
  }

  off(event: string, observer: ObserverFn): void {
    const list = this.listeners.get(event) ?? [];
    const filtered = list.filter((fn) => fn !== observer);
    this.listeners.set(event, filtered);
    console.log(`[EMITTER]    Observer desuscrito del evento "${event}"`);
  }

  emit(event: string, data: unknown): void {
    const list = this.listeners.get(event) ?? [];
    console.log(`[EMITTER]    Emitiendo "${event}" → ${list.length} observer(s) notificados`);
    list.forEach((fn) => fn(data));
  }
}

class AuditObserver {
  handle = (data: unknown): void => {
    console.log(`  [AUDIT]    Registro de auditoría: ${JSON.stringify(data)}`);
  };
}

class EmailObserver {
  handle = (data: unknown): void => {
    const payload = data as { user?: string; action?: string };
    console.log(`  [EMAIL]    Email enviado a ${payload.user ?? 'admin'} — acción: ${payload.action ?? 'desconocida'}`);
  };
}

class MetricsObserver {
  private counts: Map<string, number> = new Map();

  handle = (data: unknown): void => {
    const payload = data as { action?: string };
    const key = payload.action ?? 'unknown';
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
    console.log(`  [METRICS]    Contador "${key}": ${this.counts.get(key)}`);
  };
}

console.log('══════════════════════════════════════════════');
console.log('       OBSERVER — Event System                 ');
console.log('══════════════════════════════════════════════\n');

const emitter   = new EventEmitter();
const audit     = new AuditObserver();
const email     = new EmailObserver();
const metrics   = new MetricsObserver();

emitter.on('user.login',  audit.handle);
emitter.on('user.login',  email.handle);
emitter.on('user.login',  metrics.handle);
emitter.on('user.logout', audit.handle);
emitter.on('user.logout', metrics.handle);
console.log();

console.log('── Evento: user.login ────────────────────────────────');
emitter.emit('user.login', { user: 'alice@empresa.com', action: 'login', ip: '192.168.1.1' });
console.log();

console.log('── Evento: user.logout ───────────────────────────────');
emitter.emit('user.logout', { user: 'alice@empresa.com', action: 'logout' });
console.log();

console.log('── Desuscribiendo EmailObserver de "user.login" ──────');
emitter.off('user.login', email.handle);
console.log();

console.log('── Evento: user.login (tras desuscripción de email) ──');
emitter.emit('user.login', { user: 'bob@empresa.com', action: 'login', ip: '10.0.0.2' });
