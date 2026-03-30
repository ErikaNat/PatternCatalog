// src/patterns/estructural/adapter/legacy-auth.adapter.ts

// Interfaz moderna que el sistema nuevo espera
interface ModernAuthResult {
  authenticated: boolean;
  reason: string;
}

interface ModernAuthenticator {
  login(username: string, password: string): ModernAuthResult;
}

// Tipo para los codigos que devuelve el sistema viejo
type LegacyCode = 0 | 1 | 2;

// Sistema legado que no se puede cambiar
class LegacyAuthSystem {
  // Sistema viejo devuelve numeros: 0=exito, 1=error, 2=bloqueado
  checkUser(username: string, pwd: string, domain: string): LegacyCode {
    console.log(`[LEGACY]     checkUser("${username}", "***", "${domain}")`);
    if (username === 'blocked_user') return 2;
    if (pwd === 'wrong') return 1;
    return 0;
  }
}

// Adaptador que traduce interfaz vieja a interfaz moderna
class LegacyAuthAdapter implements ModernAuthenticator {
  // Guarda instancia del sistema viejo
  private readonly legacy: LegacyAuthSystem;
  // Guarda el dominio de autenticacion
  private readonly domain: string;

  constructor(domain: string) {
    this.legacy = new LegacyAuthSystem();
    this.domain = domain;
  }

  // Traduce login (interfaz moderna) a checkUser (interfaz vieja)
  login(username: string, password: string): ModernAuthResult {
    // Llama al sistema viejo
    const code = this.legacy.checkUser(username, password, this.domain);
    
    // Mapea los codigos numericos a mensajes
    const messages: Record<LegacyCode, string> = {
      0: 'Autenticacion exitosa',
      1: 'Credenciales incorrectas',
      2: 'Cuenta bloqueada',
    };
    
    // Devuelve el resultado en formato moderno
    return { authenticated: code === 0, reason: messages[code] };
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('       ADAPTER — Legacy Auth Adapter        ');
console.log('═══════════════════════════════════════════\n');

const auth: ModernAuthenticator = new LegacyAuthAdapter('CORP_DOMAIN');

const tests = [
  { user: 'alice',        pass: 'correct_pass', label: 'Válido' },
  { user: 'bob',          pass: 'wrong',       label: 'Credenciales incorrectas' },
  { user: 'blocked_user', pass: 'any',        label: 'Cuenta bloqueada' },
];

for (const { user, pass, label } of tests) {
  const result = auth.login(user, pass);
  const icon = result.authenticated ? '✓' : '✗';
  console.log(`${icon} ${label}: ${result.reason}`);
}
