// src/patterns/estructural/facade/security.facade.ts


class AuthService {
  validate(user: string, password: string): boolean {
    console.log(`  [AUTH-SVC]    Validando credenciales de "${user}"...`);
    return password.length >= 6; // Simulación
  }
}

class PermissionsService {
  loadPermissions(user: string): string[] {
    console.log(`  [PERMS-SVC]    Cargando permisos para "${user}"...`);
    const permissionsMap: Record<string, string[]> = {
      'admin@empresa.com': ['read', 'write', 'delete', 'admin'],
      'user@empresa.com':  ['read'],
    };
    return permissionsMap[user] ?? ['read'];
  }
}

class AuditService {
  log(event: string, user: string, metadata: Record<string, unknown>): void {
    console.log(`  [AUDIT-SVC]    Evento: "${event}" | Usuario: ${user} | ${JSON.stringify(metadata)}`);
  }
}

class SessionService {
  createSession(user: string, permissions: string[]): string {
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    console.log(`  [SESSION-SVC]     Sesión creada para "${user}" | Token: ${token}`);
    return token;
  }

  destroySession(token: string): void {
    console.log(`  [SESSION-SVC]     Sesión destruida: ${token}`);
  }
}


class SecurityFacade {
  private authService      = new AuthService();
  private permissionsService = new PermissionsService();
  private auditService     = new AuditService();
  private sessionService   = new SessionService();

  login(user: string, password: string): { token: string | null; permissions: string[] } {
    console.log(`[FACADE]    Iniciando login para "${user}"...`);

    const valid = this.authService.validate(user, password);
    if (!valid) {
      this.auditService.log('LOGIN_FAILED', user, { reason: 'Credenciales inválidas' });
      console.log(`[FACADE]    Login fallido para "${user}"`);
      return { token: null, permissions: [] };
    }

    const permissions = this.permissionsService.loadPermissions(user);

    this.auditService.log('LOGIN_SUCCESS', user, { permissions });

    const token = this.sessionService.createSession(user, permissions);

    console.log(`[FACADE]    Login exitoso. Token entregado.\n`);
    return { token, permissions };
  }

  logout(user: string, token: string): void {
    console.log(`[FACADE]    Cerrando sesión de "${user}"...`);
    this.sessionService.destroySession(token);
    this.auditService.log('LOGOUT', user, { token });
    console.log(`[FACADE]    Sesión cerrada.\n`);
  }
}

console.log('═══════════════════════════════════════════');
console.log('          FACADE — Security Facade          ');
console.log('═══════════════════════════════════════════\n');

const security = new SecurityFacade();

console.log('── Caso 1: Login exitoso (admin) ─────────────────');
const { token, permissions: adminPerms } = security.login('admin@empresa.com', 'securePass');
console.log(`   Permisos obtenidos: [${adminPerms.join(', ')}]`);
console.log(`   Token: ${token}`);
console.log();

if (token) {
  security.logout('admin@empresa.com', token);
}

console.log('── Caso 2: Login fallido (contraseña inválida) ────');
const { token: failToken } = security.login('user@empresa.com', '123');
console.log(`   Token recibido: ${failToken}`);
