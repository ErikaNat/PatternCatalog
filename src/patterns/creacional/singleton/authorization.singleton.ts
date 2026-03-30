// src/patterns/creacional/singleton/authorization.singleton.ts

class AuthorizationManager {
  private static instance: AuthorizationManager;
  private currentUser: string | null = null;
  private permissions: string[] = [];

  private constructor() {
    console.log('[SINGLETON] AuthorizationManager instanciado.');
  }

  static getInstance(): AuthorizationManager {
    if (!AuthorizationManager.instance) {
      AuthorizationManager.instance = new AuthorizationManager();
    }
    return AuthorizationManager.instance;
  }

  login(user: string, permissions: string[]): void {
    this.currentUser = user;
    this.permissions = permissions;
    console.log(`[AUTH]    Usuario "${user}" logueado con permisos: [${permissions.join(', ')}]`);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  logout(): void {
    console.log(`[AUTH]    Usuario "${this.currentUser}" deslogueado.`);
    this.currentUser = null;
    this.permissions = [];
  }

  getUser(): string | null {
    return this.currentUser;
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('       SINGLETON — Authorization Manager    ');
console.log('═══════════════════════════════════════════\n');

const auth1 = AuthorizationManager.getInstance();
const auth2 = AuthorizationManager.getInstance();

console.log(`[TEST] ¿auth1 === auth2? → ${auth1 === auth2}`);
console.log();

auth1.login('alice@empresa.com', ['read', 'write', 'delete']);
console.log(`[AUTH] ¿Tiene permiso "read"?   → ${auth1.hasPermission('read')}`);
console.log(`[AUTH] ¿Tiene permiso "delete"? → ${auth1.hasPermission('delete')}`);
console.log(`[AUTH] ¿Tiene permiso "admin"?  → ${auth1.hasPermission('admin')}`);
console.log();

// auth2 apunta a la misma instancia
console.log(`[AUTH] Usuario desde auth2: "${auth2.getUser()}"`);
auth2.logout();
console.log(`[AUTH] Usuario después del logout desde auth2: ${auth1.getUser()}`);