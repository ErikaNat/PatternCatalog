// src/patterns/estructural/adapter/google-oauth.adapter.ts
// Sirve para hacer compatible un sistema viejo con el codigo nuevo 

// ── Interfaz estándar que el sistema espera ───────────────────────────────────
interface OAuthAuthService {
  authenticate(user: string, credential: string): { success: boolean; message: string };
}

// ── Cliente externo de Google (interfaz incompatible) ─────────────────────────
interface GoogleTokenResult {
  email: string;
  valid: boolean;
  expiresAt: Date;
}

class GoogleOAuthClient {
  verifyGoogleToken(token: string, clientId: string): GoogleTokenResult {
    // Simulación: tokens que empiezan con "valid_" son aceptados
    const isValid = token.startsWith('valid_');
    return {
      email: isValid ? 'usuario@gmail.com' : '',
      valid: isValid,
      expiresAt: isValid
        ? new Date(Date.now() + 3600 * 1000)
        : new Date(0),
    };
  }
}

// ── Adapter: adapta GoogleOAuthClient a la interfaz OAuthAuthService ─────────────
class GoogleOAuthAdapter implements OAuthAuthService {
  private readonly client: GoogleOAuthClient;
  private readonly clientId: string;

  constructor(clientId: string) {
    this.client = new GoogleOAuthClient();
    this.clientId = clientId;
    console.log(`[ADAPTER]    GoogleOAuthAdapter inicializado (clientId: ${clientId})`);
  }

  authenticate(user: string, credential: string): { success: boolean; message: string } {
    console.log(`[ADAPTER]    Traduciendo llamada authenticate() → verifyGoogleToken()...`);
    const result = this.client.verifyGoogleToken(credential, this.clientId);

    if (!result.valid) {
      return { success: false, message: `Token inválido o expirado para "${user}"` };
    }
    if (result.email !== user) {
      return { success: false, message: `Email del token (${result.email}) no coincide con "${user}"` };
    }
    return {
      success: true,
      message: `Autenticado como ${result.email}. Token válido hasta ${result.expiresAt.toISOString()}`,
    };
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('       ADAPTER — Google OAuth Adapter       ');
console.log('═══════════════════════════════════════════\n');

const adapter: OAuthAuthService = new GoogleOAuthAdapter('mi-app-client-id-123');
console.log();

// Caso exitoso
console.log('── Caso 1: Token válido ──────────────────────');
const ok = adapter.authenticate('usuario@gmail.com', 'valid_google_token_abc');
console.log(ok.success ? `   ${ok.message}` : `   ${ok.message}`);
console.log();

// Caso fallido: token inválido
console.log('── Caso 2: Token inválido ────────────────────');
const fail1 = adapter.authenticate('usuario@gmail.com', 'expired_token_xyz');
console.log(fail1.success ? `   ${fail1.message}` : `   ${fail1.message}`);
console.log();

// Caso fallido: email no coincide
console.log('── Caso 3: Email no coincide ─────────────────');
const fail2 = adapter.authenticate('otro@gmail.com', 'valid_google_token_abc');
console.log(fail2.success ? `   ${fail2.message}` : `   ${fail2.message}`);
