// src/patterns/comportamiento/chain/http-middleware.chain.ts

interface HttpRequest {
  method: string;
  path: string;
  origin: string;
  authToken: string | null;
  ip: string;
  requestCount?: number;
}

interface HttpResponse {
  status: number;
  body: string;
}

// ── Middleware abstracto ───────────────────────────────────────────────────────
abstract class Middleware {
  private next: Middleware | null = null;

  setNext(middleware: Middleware): Middleware {
    this.next = middleware;
    return middleware;
  }

  protected passToNext(req: HttpRequest): HttpResponse {
    if (this.next) return this.next.handle(req);
    return { status: 200, body: `   Respuesta de ${req.path}` };
  }

  abstract handle(req: HttpRequest): HttpResponse;
}

// ── Middlewares concretos ─────────────────────────────────────────────────────
class RateLimiterMiddleware extends Middleware {
  private readonly maxRequests = 100;

  handle(req: HttpRequest): HttpResponse {
    console.log(`[RATE-LIMITER] 🚦 Verificando tasa de peticiones desde ${req.ip}...`);
    const count = req.requestCount ?? 0;
    if (count > this.maxRequests) {
      console.log(`[RATE-LIMITER]    BLOQUEADO — límite de ${this.maxRequests} req/min superado`);
      return { status: 429, body: 'Too Many Requests' };
    }
    console.log(`[RATE-LIMITER] ✓ Tasa OK (${count}/${this.maxRequests})`);
    return this.passToNext(req);
  }
}

class CorsMiddleware extends Middleware {
  private readonly allowedOrigins = ['https://app.empresa.com', 'https://admin.empresa.com'];

  handle(req: HttpRequest): HttpResponse {
    console.log(`[CORS] 🌐 Verificando origen "${req.origin}"...`);
    if (!this.allowedOrigins.includes(req.origin)) {
      console.log(`[CORS]    BLOQUEADO — origen no permitido`);
      return { status: 403, body: 'CORS: Origin not allowed' };
    }
    console.log(`[CORS] ✓ Origen permitido`);
    return this.passToNext(req);
  }
}

class LoggerMiddleware extends Middleware {
  handle(req: HttpRequest): HttpResponse {
    console.log(`[LOGGER]    ${req.method} ${req.path} desde ${req.origin}`);
    const response = this.passToNext(req);
    console.log(`[LOGGER]    Respuesta: ${response.status}`);
    return response;
  }
}

class AuthMiddleware extends Middleware {
  handle(req: HttpRequest): HttpResponse {
    console.log(`[AUTH]    Verificando token de autenticación...`);
    if (!req.authToken) {
      console.log(`[AUTH]    BLOQUEADO — token ausente`);
      return { status: 401, body: 'Unauthorized' };
    }
    console.log(`[AUTH] ✓ Token válido`);
    return this.passToNext(req);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('     CHAIN — HTTP Middleware Pipeline          ');
console.log('══════════════════════════════════════════════\n');

// Pipeline: RateLimiter → CORS → Logger → Auth
const rateLimiter = new RateLimiterMiddleware();
const cors        = new CorsMiddleware();
const logger      = new LoggerMiddleware();
const authMiddleware = new AuthMiddleware();
rateLimiter.setNext(cors).setNext(logger).setNext(authMiddleware);

// Request válida
console.log('── Request válida (pasa todo el pipeline) ─────────────');
const validReq: HttpRequest = {
  method: 'GET', path: '/api/orders',
  origin: 'https://app.empresa.com',
  authToken: 'Bearer jwt_token_abc123',
  ip: '192.168.1.1', requestCount: 5,
};
const res1 = rateLimiter.handle(validReq);
console.log(`   → Respuesta final: [${res1.status}] ${res1.body}`);
console.log();

// Request con origen no permitido (se detiene en CORS)
console.log('── Request con origen inválido (se detiene en CORS) ───');
const invalidOriginReq: HttpRequest = {
  method: 'POST', path: '/api/checkout',
  origin: 'https://sitio-malicioso.com',
  authToken: 'Bearer jwt_token_xyz',
  ip: '10.0.0.5', requestCount: 1,
};
const res2 = rateLimiter.handle(invalidOriginReq);
console.log(`   → Respuesta final: [${res2.status}] ${res2.body}`);
