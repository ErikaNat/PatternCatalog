// src/patterns/creacional/factory/auth-factory.ts
// Sirve para crear diferentes tipo de autenticacion sin repetir codigo

// Interfaz que todo autenticador debe cumplir
interface Authenticator {
  authenticate(username: string, password: string): boolean;
  readonly type: string;
}

// Autenticador que valida contra base de datos
class DBAuthenticator implements Authenticator {
  readonly type = 'DB';
  authenticate(username: string, password: string): boolean {
    // Valida que la contraseña tenga al menos 6 caracteres
    return password.length >= 6;
  }
}

// Autenticador que valida contra directorio LDAP
class LDAPAuthenticator implements Authenticator {
  readonly type = 'LDAP';
  authenticate(username: string, password: string): boolean {
    // Valida que el usuario sea de la empresa
    return username.includes('@empresa.com');
  }
}

// Autenticador que valida con tokens OAuth
class OAuthAuthenticator implements Authenticator {
  readonly type = 'OAuth';
  authenticate(username: string, password: string): boolean {
    // Valida que el token sea de tipo OAuth
    return password.startsWith('oauth_token_');
  }
}

// Tipos de autenticación disponibles
type AuthType = 'db' | 'ldap' | 'oauth';

// Fabrica: crea el autenticador correcto segun el tipo
class AuthenticatorFactory {
  // Metodo estatico que recibe el tipo y devuelve la implementacion
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

// ─── Demo ────────────────────────────────────────────────────────────────────
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
  console.log(`[${auth.type}] "${user}" → ${ok ? '✓ Autenticado' : '✗ Falló'}`);
}

console.log('\n[TEST] Tipo inválido:');
try {
  AuthenticatorFactory.create('saml' as AuthType);
} catch (e: any) {
  console.log(`✗ ${e.message}`);
}
