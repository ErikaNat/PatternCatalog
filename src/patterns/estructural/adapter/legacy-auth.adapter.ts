// src/patterns/estructural/adapter/legacy-auth.adapter.ts

interface ModernAuthResult {
  authenticated: boolean;
  reason: string;
}

interface ModernAuthenticator {
  login(username: string, password: string): ModernAuthResult;
}

type LegacyCode = 0 | 1 | 2;

class LegacyAuthSystem {
  checkUser(username: string, pwd: string, domain: string): LegacyCode {
    console.log(`[LEGACY]     checkUser("${username}", "***", "${domain}")`);
    if (username === 'blocked_user') return 2;
    if (pwd === 'wrong') return 1;
    return 0;
  }
}

class LegacyAuthAdapter implements ModernAuthenticator {
  private readonly legacy: LegacyAuthSystem;
  private readonly domain: string;

  constructor(domain: string) {
    this.legacy = new LegacyAuthSystem();
    this.domain = domain;
  }

  login(username: string, password: string): ModernAuthResult {
    const code = this.legacy.checkUser(username, password, this.domain);
    
    const messages: Record<LegacyCode, string> = {
      0: 'Autenticacion exitosa',
      1: 'Credenciales incorrectas',
      2: 'Cuenta bloqueada',
    };
    
    return { authenticated: code === 0, reason: messages[code] };
  }
}

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
  const icon = result.authenticated ? '' : '';
  console.log(`${icon} ${label}: ${result.reason}`);
}
