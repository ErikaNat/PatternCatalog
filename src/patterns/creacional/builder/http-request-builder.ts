// src/patterns/creacional/builder/http-request-builder.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface BuilderHttpRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: unknown | null;
  timeoutMs: number;
}

class HttpRequestBuilder {
  private url = '';
  private httpMethod: HttpMethod = 'GET';
  private headers: Record<string, string> = {};
  private bodyData: unknown | null = null;
  private timeoutMs = 5000;

  to(url: string): this { this.url = url; return this; }
  
  method(m: HttpMethod): this { this.httpMethod = m; return this; }
  
  withAuth(token: string): this { this.headers['Authorization'] = `Bearer ${token}`; return this; }
  
  withHeader(k: string, v: string): this { this.headers[k] = v; return this; }
  
  withBody(data: unknown): this { this.bodyData = data; this.headers['Content-Type'] = 'application/json'; return this; }
  
  timeout(ms: number): this { this.timeoutMs = ms; return this; }

  build(): BuilderHttpRequest {
    if (!this.url) throw new Error('URL requerida');
    return { url: this.url, method: this.httpMethod, headers: { ...this.headers }, body: this.bodyData, timeoutMs: this.timeoutMs };
  }
}

console.log('═══════════════════════════════════════════');
console.log('       BUILDER — HTTP Request Builder       ');
console.log('═══════════════════════════════════════════\n');

const post = new HttpRequestBuilder()
  .to('https://api.empresa.com/v1/orders')
  .method('POST')
  .withAuth('token_abc')
  .withBody({ productId: 'SKU-001', qty: 3 })
  .build();

console.log('POST construido:');
console.log(`  ${post.method} ${post.url}`);
console.log(`  Headers: ${Object.keys(post.headers).length}`);
console.log();

const get = new HttpRequestBuilder()
  .to('https://api.empresa.com/v1/users/42')
  .withAuth('token_xyz')
  .build();

console.log('GET construido:');
console.log(`  ${get.method} ${get.url}`);
console.log();

console.log('[TEST] Sin URL:');
try {
  new HttpRequestBuilder().method('POST').build();
} catch (e: any) {
  console.log(` ${e.message}`);
}
