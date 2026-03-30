// src/patterns/comportamiento/strategy/discount.strategy.ts

// ── Interfaz de estrategia ────────────────────────────────────────────────────
interface DiscountStrategy {
  readonly name: string;
  calculate(price: number, quantity: number): number;
}

// ── Estrategias concretas ─────────────────────────────────────────────────────
class NoDiscount implements DiscountStrategy {
  readonly name = 'Sin descuento';
  calculate(price: number, quantity: number): number {
    return price * quantity;
  }
}

class SeasonalDiscount implements DiscountStrategy {
  readonly name = 'Descuento de temporada (20%)';
  constructor(private readonly rate: number = 0.20) {}
  calculate(price: number, quantity: number): number {
    return price * quantity * (1 - this.rate);
  }
}

class VolumeDiscount implements DiscountStrategy {
  readonly name = 'Descuento por volumen';
  calculate(price: number, quantity: number): number {
    let rate = 0;
    if (quantity >= 50)      rate = 0.30;
    else if (quantity >= 20) rate = 0.20;
    else if (quantity >= 10) rate = 0.10;
    else if (quantity >= 5)  rate = 0.05;
    const label = rate > 0 ? `${rate * 100}% por ${quantity} unidades` : 'sin descuento por volumen';
    console.log(`  [VOLUME] Rango aplicado: ${label}`);
    return price * quantity * (1 - rate);
  }
}

class VipDiscount implements DiscountStrategy {
  readonly name = 'Descuento VIP (35% + envío gratis)';
  calculate(price: number, quantity: number): number {
    const subtotal = price * quantity * 0.65;
    console.log(`  [VIP] Descuento del 35% aplicado + envío gratis incluido`);
    return subtotal;
  }
}

// ── Contexto: ShoppingCart ────────────────────────────────────────────────────
class ShoppingCart {
  private strategy: DiscountStrategy = new NoDiscount();

  setStrategy(strategy: DiscountStrategy): void {
    this.strategy = strategy;
    console.log(`[CART]    Estrategia activa: "${strategy.name}"`);
  }

  checkout(price: number, quantity: number): void {
    const subtotal = price * quantity;
    const total    = this.strategy.calculate(price, quantity);
    const saved    = subtotal - total;
    console.log(`  Precio unitario : $${price.toFixed(2)}`);
    console.log(`  Cantidad        : ${quantity}`);
    console.log(`  Subtotal        : $${subtotal.toFixed(2)}`);
    console.log(`  Total final     : $${total.toFixed(2)}`);
    if (saved > 0) console.log(`  Ahorro          : $${saved.toFixed(2)}`);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('       STRATEGY — Discount Strategies          ');
console.log('══════════════════════════════════════════════\n');

const cart = new ShoppingCart();
const PRICE = 25.00;

console.log('── Caso 1: Sin descuento ──────────────────────────────');
cart.setStrategy(new NoDiscount());
cart.checkout(PRICE, 3);
console.log();

console.log('── Caso 2: Descuento de temporada ─────────────────────');
cart.setStrategy(new SeasonalDiscount());
cart.checkout(PRICE, 3);
console.log();

console.log('── Caso 3: Descuento por volumen (25 unidades) ────────');
cart.setStrategy(new VolumeDiscount());
cart.checkout(PRICE, 25);
console.log();

console.log('── Caso 4: Descuento VIP ──────────────────────────────');
cart.setStrategy(new VipDiscount());
cart.checkout(PRICE, 3);
