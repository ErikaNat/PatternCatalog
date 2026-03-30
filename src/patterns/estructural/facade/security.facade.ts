// src/patterns/estructural/facade/security.facade.ts

// ── Subsistemas internos (complejos e independientes) ─────────────────────────

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

// ── Facade: interfaz simplificada sobre los 4 subsistemas ────────────────────

class SecurityFacade {
  private authService      = new AuthService();
  private permissionsService = new PermissionsService();
  private auditService     = new AuditService();
  private sessionService   = new SessionService();

  login(user: string, password: string): { token: string | null; permissions: string[] } {
    console.log(`[FACADE]    Iniciando login para "${user}"...`);

    // Paso 1: validar credenciales
    const valid = this.authService.validate(user, password);
    if (!valid) {
      this.auditService.log('LOGIN_FAILED', user, { reason: 'Credenciales inválidas' });
      console.log(`[FACADE]    Login fallido para "${user}"`);
      return { token: null, permissions: [] };
    }

    // Paso 2: cargar permisos
    const permissions = this.permissionsService.loadPermissions(user);

    // Paso 3: registrar auditoría
    this.auditService.log('LOGIN_SUCCESS', user, { permissions });

    // Paso 4: crear sesión
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

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('          FACADE — Security Facade          ');
console.log('═══════════════════════════════════════════\n');

const security = new SecurityFacade();

// Caso exitoso: admin
console.log('── Caso 1: Login exitoso (admin) ─────────────────');
const { token, permissions: adminPerms } = security.login('admin@empresa.com', 'securePass');
console.log(`   Permisos obtenidos: [${adminPerms.join(', ')}]`);
console.log(`   Token: ${token}`);
console.log();

// Logout
if (token) {
  security.logout('admin@empresa.com', token);
}

// Caso fallido: contraseña corta
console.log('── Caso 2: Login fallido (contraseña inválida) ────');
const { token: failToken } = security.login('user@empresa.com', '123');
console.log(`   Token recibido: ${failToken}`);
