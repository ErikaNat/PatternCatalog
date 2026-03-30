// src/patterns/comportamiento/chain/access-validation.chain.ts

interface AccessRequest {
  user: string;
  token: string | null;
  role: string;
  resource: string;
  allowedResources: string[];
}

// ── Handler abstracto ─────────────────────────────────────────────────────────
abstract class AccessHandler {
  private next: AccessHandler | null = null;

  setNext(handler: AccessHandler): AccessHandler {
    this.next = handler;
    return handler;
  }

  protected passToNext(request: AccessRequest): boolean {
    if (this.next) return this.next.handle(request);
    console.log(`[CHAIN]   Acceso CONCEDIDO para "${request.user}" → recurso "${request.resource}"`);
    return true;
  }

  abstract handle(request: AccessRequest): boolean;
}

// ── Handlers concretos ────────────────────────────────────────────────────────
class AuthHandler extends AccessHandler {
  handle(request: AccessRequest): boolean {
    console.log(`[AUTH-HANDLER]    Verificando token de "${request.user}"...`);
    if (!request.token) {
      console.log(`[AUTH-HANDLER]    DENEGADO — token ausente`);
      return false;
    }
    console.log(`[AUTH-HANDLER] ✓ Token válido`);
    return this.passToNext(request);
  }
}

class RoleHandler extends AccessHandler {
  constructor(private readonly requiredRole: string) { super(); }

  handle(request: AccessRequest): boolean {
    console.log(`[ROLE-HANDLER]    Verificando rol "${request.role}" (requerido: "${this.requiredRole}")...`);
    if (request.role !== this.requiredRole) {
      console.log(`[ROLE-HANDLER]    DENEGADO — rol insuficiente`);
      return false;
    }
    console.log(`[ROLE-HANDLER] ✓ Rol correcto`);
    return this.passToNext(request);
  }
}

class ResourceHandler extends AccessHandler {
  handle(request: AccessRequest): boolean {
    console.log(`[RESOURCE-HANDLER]    Verificando acceso al recurso "${request.resource}"...`);
    if (!request.allowedResources.includes(request.resource)) {
      console.log(`[RESOURCE-HANDLER]    DENEGADO — recurso no permitido`);
      return false;
    }
    console.log(`[RESOURCE-HANDLER] ✓ Recurso permitido`);
    return this.passToNext(request);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('   CHAIN — Access Validation Chain             ');
console.log('══════════════════════════════════════════════\n');

// Construir cadena: Auth → Role → Resource
const authHandler     = new AuthHandler();
const roleHandler     = new RoleHandler('ADMIN');
const resourceHandler = new ResourceHandler();
authHandler.setNext(roleHandler).setNext(resourceHandler);

const testCases: Array<{ label: string; request: AccessRequest }> = [
  {
    label: 'Caso 1: ADMIN con token y recurso válido (aprobado)',
    request: {
      user: 'alice', token: 'valid_token_123', role: 'ADMIN',
      resource: '/admin/dashboard', allowedResources: ['/admin/dashboard', '/reports'],
    },
  },
  {
    label: 'Caso 2: Sin token (denegado en Auth)',
    request: {
      user: 'bob', token: null, role: 'ADMIN',
      resource: '/admin/dashboard', allowedResources: ['/admin/dashboard'],
    },
  },
  {
    label: 'Caso 3: Rol incorrecto (denegado en Role)',
    request: {
      user: 'carol', token: 'valid_token_456', role: 'USER',
      resource: '/admin/dashboard', allowedResources: ['/admin/dashboard'],
    },
  },
  {
    label: 'Caso 4: Recurso no permitido (denegado en Resource)',
    request: {
      user: 'dave', token: 'valid_token_789', role: 'ADMIN',
      resource: '/secret/vault', allowedResources: ['/admin/dashboard'],
    },
  },
];

for (const { label, request } of testCases) {
  console.log(`── ${label} ──`);
  authHandler.handle(request);
  console.log();
}
