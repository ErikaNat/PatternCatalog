// src/patterns/creacional/factory/auth-factory.ts

interface Authenticator {
  authenticate(username: string, password: string): boolean;
  readonly type: string;
}

class DBAuthenticator implements Authenticator {
  readonly type = 'DB';
  authenticate(username: string, password: string): boolean {
    return password.length >= 6;
  }
}

class LDAPAuthenticator implements Authenticator {
  readonly type = 'LDAP';
  authenticate(username: string, password: string): boolean {
    return username.includes('@empresa.com');
  }
}

class OAuthAuthenticator implements Authenticator {
  readonly type = 'OAuth';
  authenticate(username: string, password: string): boolean {
    return password.startsWith('oauth_token_');
  }
}

type AuthType = 'db' | 'ldap' | 'oauth';

class AuthenticatorFactory {
  static create(type: AuthType): Authenticator {
    switch (type) {
      case 'db':    return new DBAuthenticator();
      case 'ldap':  return new LDAPAuthenticator();
      case 'oauth': return new OAuthAuthenticator();
      default:
        throw new Error(`   Tipo de autenticador desconocido: ${type}`);
    }
  }
}

console.log('═══════════════════════════════════════════');
console.log('        FACTORY METHOD — Auth Factory       ');
console.log('═══════════════════════════════════════════\n');

const authTests: Array<{ type: AuthType; user: string; pass: string }> = [
  { type: 'db',    user: 'alice',          pass: 'securePass123' },
  { type: 'ldap',  user: 'bob@empresa.com', pass: 'ldap_pass' },
  { type: 'oauth', user: 'carol@gmail.com', pass: 'oauth_token_abc123' },
];

for (const { type, user, pass } of authTests) {
  const auth = AuthenticatorFactory.create(type);
  const ok = auth.authenticate(user, pass);
  console.log(`[${auth.type}] "${user}" → ${ok ? ' Autenticado' : ' Falló'}`);
}

console.log('\n[TEST] Tipo inválido:');
try {
  AuthenticatorFactory.create('saml' as AuthType);
} catch (e: any) {
  console.log(` ${e.message}`);
}
