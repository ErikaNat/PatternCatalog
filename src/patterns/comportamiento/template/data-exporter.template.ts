// src/patterns/comportamiento/template/data-exporter.template.ts

interface RawRecord { id: number; name: string; value: number; active: boolean; }

// ── Clase abstracta con Template Method ───────────────────────────────────────
abstract class DataExporter {
  // Template Method
  export(records: RawRecord[]): void {
    console.log(`\n[TEMPLATE]    Iniciando exportación: ${this.formatName()}`);
    this.connect();
    const extracted  = this.extractData(records);
    const transformed = this.transform(extracted);
    this.load(transformed);
    this.disconnect();
    console.log(`[TEMPLATE]    Exportación "${this.formatName()}" completada\n`);
  }

  protected abstract formatName(): string;
  protected abstract transform(data: RawRecord[]): string;

  protected connect(): void {
    console.log(`  [CONNECT]    Conectando con destino de exportación ${this.formatName()}...`);
  }

  protected extractData(records: RawRecord[]): RawRecord[] {
    console.log(`  [EXTRACT]    Extrayendo ${records.length} registros...`);
    return records.filter((r) => r.active); // solo activos
  }

  protected load(data: string): void {
    console.log(`  [LOAD]    Cargando ${data.length} bytes al destino`);
    console.log(`  [LOAD] Vista previa:\n${data.split('\n').slice(0, 4).map(l => '    ' + l).join('\n')}`);
  }

  protected disconnect(): void {
    console.log(`  [DISCONNECT]    Desconectando de ${this.formatName()}`);
  }
}

// ── Subclase 1: CSV Exporter ──────────────────────────────────────────────────
class CSVExporter extends DataExporter {
  protected formatName(): string { return 'CSV'; }

  protected transform(data: RawRecord[]): string {
    console.log('  [TRANSFORM]    Convirtiendo a formato CSV...');
    const header = 'id,name,value,active';
    const rows   = data.map((r) => `${r.id},${r.name},${r.value},${r.active}`);
    return [header, ...rows].join('\n');
  }
}

// ── Subclase 2: JSON Exporter ─────────────────────────────────────────────────
class JSONExporter extends DataExporter {
  protected formatName(): string { return 'JSON'; }

  protected transform(data: RawRecord[]): string {
    console.log('  [TRANSFORM]    Convirtiendo a formato JSON...');
    return JSON.stringify({ exportedAt: new Date().toISOString(), count: data.length, records: data }, null, 2);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('       TEMPLATE METHOD — Data Exporter         ');
console.log('══════════════════════════════════════════════');

const records: RawRecord[] = [
  { id: 1, name: 'Producto A', value: 150.00, active: true  },
  { id: 2, name: 'Producto B', value: 89.99,  active: false }, // inactivo, no se exporta
  { id: 3, name: 'Producto C', value: 220.50, active: true  },
  { id: 4, name: 'Producto D', value: 45.00,  active: true  },
];

console.log(`\nDatos de entrada: ${records.length} registros (${records.filter(r => r.active).length} activos)\n`);

new CSVExporter().export(records);
new JSONExporter().export(records);

console.log('   Ambos exportadores usan el mismo flujo: connect → extract → transform → load → disconnect');
