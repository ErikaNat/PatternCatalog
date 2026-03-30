// src/patterns/estructural/proxy/lazy-loading.proxy.ts

type ReportType = 'sales' | 'inventory' | 'financial';

// ── Interfaz ──────────────────────────────────────────────────────────────────
interface ReportService {
  generate(type: ReportType): string;
}

// ── Servicio real (costoso de instanciar) ─────────────────────────────────────
class HeavyReportService implements ReportService {
  constructor() {
    // Simula carga costosa: conexiones a BD, carga de templates, etc.
    console.log('[HEAVY-SVC]     Iniciando carga pesada...');
    const start = Date.now();
    while (Date.now() - start < 50) {} // Simula 50ms de carga
    console.log('[HEAVY-SVC]    Servicio listo (conexiones establecidas, templates cargados)');
  }

  generate(type: ReportType): string {
    const reports: Record<ReportType, string> = {
      sales:     '   Reporte de Ventas — Total: $142,500 | Período: Q1 2024',
      inventory: '   Reporte de Inventario — 1,240 SKUs | 3 alertas de stock bajo',
      financial: '   Reporte Financiero — EBITDA: 23% | Margen neto: 8.4%',
    };
    return reports[type];
  }
}

// ── Proxy de lazy loading ─────────────────────────────────────────────────────
class LazyReportProxy implements ReportService {
  private realService: HeavyReportService | null = null;

  generate(type: ReportType): string {
    if (!this.realService) {
      console.log('[PROXY]    Primera llamada detectada — instanciando HeavyReportService...');
      this.realService = new HeavyReportService();
    } else {
      console.log('[PROXY]     Reutilizando instancia existente de HeavyReportService');
    }
    return this.realService.generate(type);
  }

  isLoaded(): boolean {
    return this.realService !== null;
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('       PROXY — Lazy Loading Proxy           ');
console.log('═══════════════════════════════════════════\n');

console.log('[TEST] Creando proxy... (el servicio real NO se instancia aún)');
const proxy = new LazyReportProxy();
console.log(`[TEST] ¿Servicio cargado? → ${proxy.isLoaded()}`);
console.log();

console.log('── Llamada 1: generate("sales") — debe instanciar el servicio real ──');
const report1 = proxy.generate('sales');
console.log(`   ${report1}`);
console.log(`[TEST] ¿Servicio cargado ahora? → ${proxy.isLoaded()}`);
console.log();

console.log('── Llamada 2: generate("inventory") — reutiliza instancia ──────────');
const report2 = proxy.generate('inventory');
console.log(`   ${report2}`);
console.log();

console.log('── Llamada 3: generate("financial") — reutiliza instancia ──────────');
const report3 = proxy.generate('financial');
console.log(`   ${report3}`);
