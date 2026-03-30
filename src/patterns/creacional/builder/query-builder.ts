// src/patterns/creacional/builder/query-builder.ts

interface Query {
  sql: string;
  params: unknown[];
}

class QueryBuilder {
  private table: string = '';
  private columns: string[] = ['*'];
  private conditions: string[] = [];
  private order: string = '';
  private limitValue: number | null = null;
  private params: unknown[] = [];

  from(table: string): this {
    this.table = table;
    return this;
  }

  select(...columns: string[]): this {
    this.columns = columns;
    return this;
  }

  where(condition: string, ...values: unknown[]): this {
    this.conditions.push(condition);
    this.params.push(...values);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.order = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  build(): Query {
    if (!this.table) throw new Error('   Debes especificar una tabla con .from()');

    const parts: string[] = [
      `SELECT ${this.columns.join(', ')}`,
      `FROM ${this.table}`,
    ];

    if (this.conditions.length > 0) {
      parts.push(`WHERE ${this.conditions.join(' AND ')}`);
    }
    if (this.order) parts.push(this.order);
    if (this.limitValue !== null) parts.push(`LIMIT ${this.limitValue}`);

    return { sql: parts.join(' '), params: this.params };
  }
}

console.log('═══════════════════════════════════════════');
console.log('           BUILDER — Query Builder          ');
console.log('═══════════════════════════════════════════\n');

const query1 = new QueryBuilder()
  .from('orders')
  .select('id', 'customer_id', 'total', 'status', 'created_at')
  .where('status = ?', 'pending')
  .where('total > ?', 100)
  .where('created_at > ?', '2024-01-01')
  .orderBy('created_at', 'DESC')
  .limit(25)
  .build();

console.log('   Query 1 (con múltiples condiciones):');
console.log(`   SQL:    ${query1.sql}`);
console.log(`   Params: [${query1.params.map(p => JSON.stringify(p)).join(', ')}]`);
console.log();

const query2 = new QueryBuilder()
  .from('users')
  .select('email', 'role')
  .where('active = ?', true)
  .orderBy('email')
  .build();

console.log('   Query 2 (simple):');
console.log(`   SQL:    ${query2.sql}`);
console.log(`   Params: [${query2.params.map(p => JSON.stringify(p)).join(', ')}]`);
console.log();

console.log('[TEST] Query sin tabla definida...');
try {
  new QueryBuilder().select('id').build();
} catch (e: any) {
  console.log(`   Error esperado: ${e.message}`);
}
