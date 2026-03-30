// src/patterns/comportamiento/state/session.state.ts

// ── Interfaz de estado ────────────────────────────────────────────────────────
interface SessionState {
  login(user: string, password: string): void;
  logout(): void;
  makeRequest(resource: string): string | null;
  expireSession(): void;
  readonly stateName: string;
}

// ── Contexto ──────────────────────────────────────────────────────────────────
class UserSession {
  private state: SessionState;
  private currentUser: string | null = null;

  constructor() {
    this.state = new AnonymousState(this);
    console.log(`[SESSION] 🌐 Sesión creada. Estado inicial: ${this.state.stateName}`);
  }

  setState(state: SessionState): void {
    console.log(`[SESSION]    ${this.state.stateName} → ${state.stateName}`);
    this.state = state;
  }

  setUser(user: string | null): void { this.currentUser = user; }
  getUser(): string | null          { return this.currentUser; }
  getStateName(): string            { return this.state.stateName; }

  login(user: string, password: string): void { this.state.login(user, password); }
  logout(): void                              { this.state.logout(); }
  makeRequest(resource: string): string | null { return this.state.makeRequest(resource); }
  expireSession(): void                       { this.state.expireSession(); }
}

// ── Estados concretos ─────────────────────────────────────────────────────────
class AnonymousState implements SessionState {
  readonly stateName = 'Anónimo';
  constructor(private readonly session: UserSession) {}

  login(user: string, password: string): void {
    if (password.length < 6) {
      console.log(`  [ANON]    Login fallido: contraseña muy corta`);
      return;
    }
    this.session.setUser(user);
    this.session.setState(new AuthenticatedState(this.session));
    console.log(`  [ANON]    Login exitoso para "${user}"`);
  }

  logout(): void         { console.log(`  [ANON]     No hay sesión activa para cerrar`); }
  expireSession(): void  { console.log(`  [ANON]     No hay sesión activa para expirar`); }
  makeRequest(resource: string): string | null {
    console.log(`  [ANON]    Acceso denegado a "${resource}": debe iniciar sesión`);
    return null;
  }
}

class AuthenticatedState implements SessionState {
  readonly stateName = 'Autenticado';
  constructor(private readonly session: UserSession) {}

  login(): void {
    console.log(`  [AUTH]     Ya existe una sesión activa para "${this.session.getUser()}"`);
  }

  logout(): void {
    console.log(`  [AUTH]    Cerrando sesión de "${this.session.getUser()}"`);
    this.session.setUser(null);
    this.session.setState(new AnonymousState(this.session));
  }

  makeRequest(resource: string): string | null {
    const data = `Datos de ${resource} para ${this.session.getUser()}`;
    console.log(`  [AUTH]    Acceso concedido a "${resource}" → ${data}`);
    return data;
  }

  expireSession(): void {
    console.log(`  [AUTH]    Sesión de "${this.session.getUser()}" expirada por inactividad`);
    this.session.setState(new ExpiredState(this.session));
  }
}

class ExpiredState implements SessionState {
  readonly stateName = 'Expirado';
  constructor(private readonly session: UserSession) {}

  login(user: string, password: string): void {
    console.log(`  [EXPIRED]    Re-autenticando sesión expirada...`);
    if (password.length >= 6) {
      this.session.setUser(user);
      this.session.setState(new AuthenticatedState(this.session));
      console.log(`  [EXPIRED]    Sesión renovada para "${user}"`);
    } else {
      console.log(`  [EXPIRED]    Re-autenticación fallida`);
    }
  }

  logout(): void {
    this.session.setUser(null);
    this.session.setState(new AnonymousState(this.session));
    console.log(`  [EXPIRED]    Sesión expirada cerrada`);
  }

  makeRequest(resource: string): string | null {
    console.log(`  [EXPIRED]    Sesión expirada — debe re-autenticarse para acceder a "${resource}"`);
    return null;
  }

  expireSession(): void {
    console.log(`  [EXPIRED]     La sesión ya está expirada`);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('       STATE — User Session                    ');
console.log('══════════════════════════════════════════════\n');

const session = new UserSession();

console.log('── Intento de request sin login ───────────────────────');
session.makeRequest('/api/profile');

console.log('\n── Login con contraseña inválida ──────────────────────');
session.login('alice', '123');

console.log('\n── Login exitoso ──────────────────────────────────────');
session.login('alice@empresa.com', 'password123');

console.log('\n── Requests autenticadas ──────────────────────────────');
session.makeRequest('/api/profile');
session.makeRequest('/api/orders');

console.log('\n── Sesión expira por inactividad ──────────────────────');
session.expireSession();
session.makeRequest('/api/orders'); // denegado: expirado

console.log('\n── Re-autenticación tras expiración ───────────────────');
session.login('alice@empresa.com', 'newpassword456');
session.makeRequest('/api/dashboard');

console.log('\n── Logout ─────────────────────────────────────────────');
session.logout();
console.log(`\n  Estado final: ${session.getStateName()}`);
