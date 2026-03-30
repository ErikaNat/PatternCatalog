// src/patterns/comportamiento/valueobject/money-value-object.ts

class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string) {
    if (amount < 0) throw new Error(`   El monto no puede ser negativo: ${amount}`);
    if (!currency || currency.length !== 3) throw new Error(`   Moneda inválida: "${currency}"`);
    this._amount   = Math.round(amount * 100) / 100; // redondeo a 2 decimales
    this._currency = currency.toUpperCase();
  }

  get amount(): number   { return this._amount; }
  get currency(): string { return this._currency; }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`   No se pueden operar monedas distintas: ${this._currency} y ${other._currency}`);
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) throw new Error(`   Resta resultaría en monto negativo`);
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) throw new Error(`   Factor de multiplicación no puede ser negativo`);
    return new Money(this._amount * factor, this._currency);
  }

  equals(other: Money): boolean {
    return this._currency === other._currency && this._amount === other._amount;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}

interface InvoiceItem {
  description: string;
  unitPrice: Money;
  quantity: number;
}

class Invoice {
  private items: InvoiceItem[] = [];
  readonly currency: string;

  constructor(currency: string) {
    this.currency = currency.toUpperCase();
  }

  addItem(description: string, unitPrice: Money, quantity: number): this {
    if (unitPrice.currency !== this.currency) {
      throw new Error(`   La moneda del item (${unitPrice.currency}) no coincide con la factura (${this.currency})`);
    }
    this.items.push({ description, unitPrice, quantity });
    return this;
  }

  subtotal(): Money {
    return this.items.reduce(
      (acc, item) => acc.add(item.unitPrice.multiply(item.quantity)),
      new Money(0, this.currency)
    );
  }

  applyDiscount(percent: number): Money {
    if (percent < 0 || percent > 100) throw new Error(`   Descuento inválido: ${percent}%`);
    return this.subtotal().multiply(1 - percent / 100);
  }

  print(): void {
    console.log(`  ${'Descripción'.padEnd(25)} ${'Precio'.padEnd(12)} ${'Qty'.padEnd(5)} Subtotal`);
    console.log(`  ${'─'.repeat(60)}`);
    for (const item of this.items) {
      const sub = item.unitPrice.multiply(item.quantity);
      console.log(`  ${item.description.padEnd(25)} ${item.unitPrice.toString().padEnd(12)} ${String(item.quantity).padEnd(5)} ${sub}`);
    }
  }
}

console.log('══════════════════════════════════════════════');
console.log('       VALUE OBJECT — Money                    ');
console.log('══════════════════════════════════════════════\n');

const price1 = new Money(100.00, 'USD');
const price2 = new Money(49.99, 'USD');
const price3 = new Money(200.00, 'EUR');

console.log('── Operaciones básicas ────────────────────────────────');
console.log(`   ${price1} + ${price2} = ${price1.add(price2)}`);
console.log(`   ${price1} - ${price2} = ${price1.subtract(price2)}`);
console.log(`   ${price2} × 3        = ${price2.multiply(3)}`);

console.log('\n── Igualdad por valor ─────────────────────────────────');
const a = new Money(50, 'USD');
const b = new Money(50, 'USD');
const c = new Money(75, 'USD');
console.log(`   Money(50, USD).equals(Money(50, USD)) → ${a.equals(b)}`);
console.log(`   Money(50, USD).equals(Money(75, USD)) → ${a.equals(c)}`);

console.log('\n── Error: monedas distintas ────────────────────────────');
try {
  price1.add(price3);
} catch (e: any) { console.log(e.message); }

console.log('\n── Factura con descuento ──────────────────────────────');
const invoice = new Invoice('USD');
invoice
  .addItem('Laptop Pro 15"',       new Money(1200.00, 'USD'), 2)
  .addItem('Mouse Inalámbrico',    new Money(25.50, 'USD'),   4)
  .addItem('Monitor 27" 4K',       new Money(350.00, 'USD'),  1);

invoice.print();
const sub      = invoice.subtotal();
const discount = 15; // 15%
const total    = invoice.applyDiscount(discount);
const saved    = sub.subtract(total);

console.log(`\n  Subtotal  : ${sub}`);
console.log(`  Descuento : ${discount}% = -${saved}`);
console.log(`  TOTAL     : ${total}`);
