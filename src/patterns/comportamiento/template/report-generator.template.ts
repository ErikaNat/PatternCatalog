// src/patterns/comportamiento/template/report-generator.template.ts

abstract class ReportGenerator {
  generate(): void {
    console.log(`\n[TEMPLATE]    Iniciando generación: ${this.reportName()}`);
    const raw       = this.fetchData();
    const processed = this.processData(raw);
    const output    = this.formatOutput(processed);
    this.saveReport(output);
    console.log(`[TEMPLATE]    Reporte "${this.reportName()}" generado correctamente\n`);
  }

  protected abstract reportName(): string;
  protected abstract fetchData(): unknown[];
  protected abstract processData(data: unknown[]): unknown;
  protected abstract formatOutput(data: unknown): string;

  protected saveReport(content: string): void {
    console.log(`  [SAVE]    Guardando reporte en /reports/${this.reportName().replace(/ /g, '_')}.pdf`);
    console.log(`  [SAVE]    ${content.length} bytes escritos`);
  }
}

interface SaleRecord { product: string; quantity: number; price: number; }

class SalesReportGenerator extends ReportGenerator {
  protected reportName(): string { return 'Reporte de Ventas'; }

  protected fetchData(): SaleRecord[] {
    console.log('  [FETCH]    Consultando tabla "sales" en la base de datos...');
    return [
      { product: 'Laptop Pro',  quantity: 12, price: 1200 },
      { product: 'Mouse Inalámbrico', quantity: 45, price: 25 },
      { product: 'Monitor 27"',  quantity: 8,  price: 350  },
    ];
  }

  protected processData(data: SaleRecord[]): { total: number; topProduct: string; units: number } {
    console.log('  [PROCESS]    Calculando totales y producto estrella...');
    const total      = data.reduce((sum, r) => sum + r.quantity * r.price, 0);
    const topProduct = data.reduce((a, b) => (a.quantity * a.price > b.quantity * b.price ? a : b));
    const units      = data.reduce((sum, r) => sum + r.quantity, 0);
    return { total, topProduct: topProduct.product, units };
  }

  protected formatOutput(data: { total: number; topProduct: string; units: number }): string {
    console.log('  [FORMAT]    Generando formato PDF de ventas...');
    const output = `=== REPORTE DE VENTAS ===\nTotal: $${data.total.toLocaleString()} | Unidades: ${data.units} | Top: ${data.topProduct}`;
    console.log(`  [FORMAT] ${output}`);
    return output;
  }
}

interface StockRecord { sku: string; name: string; stock: number; minStock: number; }

class InventoryReportGenerator extends ReportGenerator {
  protected reportName(): string { return 'Reporte de Inventario'; }

  protected fetchData(): StockRecord[] {
    console.log('  [FETCH]    Consultando tabla "inventory" en la base de datos...');
    return [
      { sku: 'SKU-001', name: 'Laptop Pro',  stock: 5,  minStock: 10 },
      { sku: 'SKU-002', name: 'Mouse',        stock: 50, minStock: 20 },
      { sku: 'SKU-003', name: 'Monitor 27"',  stock: 2,  minStock: 5  },
    ];
  }

  protected processData(data: StockRecord[]): { alerts: StockRecord[]; totalSkus: number } {
    console.log('  [PROCESS]    Detectando SKUs con stock bajo...');
    const alerts = data.filter((r) => r.stock < r.minStock);
    return { alerts, totalSkus: data.length };
  }

  protected formatOutput(data: { alerts: StockRecord[]; totalSkus: number }): string {
    console.log('  [FORMAT]    Generando formato PDF de inventario...');
    const alertLines = data.alerts.map((a) => `      ${a.sku} ${a.name}: ${a.stock}/${a.minStock}`).join('\n');
    const output = `=== REPORTE DE INVENTARIO ===\nTotal SKUs: ${data.totalSkus} | Alertas: ${data.alerts.length}\n${alertLines}`;
    console.log(`  [FORMAT] ${output}`);
    return output;
  }
}

console.log('══════════════════════════════════════════════');
console.log('       TEMPLATE METHOD — Report Generator      ');
console.log('══════════════════════════════════════════════');

const generators: ReportGenerator[] = [
  new SalesReportGenerator(),
  new InventoryReportGenerator(),
];

for (const generator of generators) {
  generator.generate();
}

console.log('   Ambos reportes usan el mismo flujo: fetchData → processData → formatOutput → saveReport');
console.log('   Solo cambia el contenido de cada paso, no el orden.');
