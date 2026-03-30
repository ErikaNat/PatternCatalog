// src/patterns/comportamiento/observer/stock.observer.ts

interface StockObserver {
  update(symbol: string, price: number, previousPrice: number): void;
}

// ── StockMarket (sujeto observable) ──────────────────────────────────────────
class StockMarket {
  private observers: StockObserver[] = [];
  private prices: Map<string, number> = new Map();

  subscribe(observer: StockObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: StockObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  updatePrice(symbol: string, newPrice: number): void {
    const previous = this.prices.get(symbol) ?? newPrice;
    this.prices.set(symbol, newPrice);
    const change = ((newPrice - previous) / previous * 100).toFixed(2);
    const arrow = newPrice >= previous ? 'Positive' : 'Negative';
    console.log(`[MARKET] ${arrow} ${symbol}: $${previous.toFixed(2)} → $${newPrice.toFixed(2)} (${change}%)`);
    this.observers.forEach((o) => o.update(symbol, newPrice, previous));
  }
}

// ── Observers ─────────────────────────────────────────────────────────────────
class AlertObserver implements StockObserver {
  constructor(
    private readonly symbol: string,
    private readonly threshold: number
  ) {}

  update(symbol: string, price: number, previousPrice: number): void {
    if (symbol !== this.symbol) return;
    const change = Math.abs(price - previousPrice) / previousPrice * 100;
    if (change >= this.threshold) {
      const dir = price > previousPrice ? 'subida' : 'bajada';
      console.log(`  [ALERT]    ALERTA en ${symbol}: ${dir} del ${change.toFixed(2)}% supera umbral de ${this.threshold}%`);
    }
  }
}

class PortfolioObserver implements StockObserver {
  private holdings: Map<string, number>;
  private currentValues: Map<string, number> = new Map();

  constructor(holdings: Record<string, number>) {
    this.holdings = new Map(Object.entries(holdings));
  }

  update(symbol: string, price: number): void {
    if (!this.holdings.has(symbol)) return;
    const shares = this.holdings.get(symbol)!;
    const value = shares * price;
    this.currentValues.set(symbol, value);
    const total = Array.from(this.currentValues.values()).reduce((a, b) => a + b, 0);
    console.log(`  [PORTFOLIO]    ${symbol}: ${shares} acc × $${price.toFixed(2)} = $${value.toFixed(2)} | Total portafolio: $${total.toFixed(2)}`);
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('       OBSERVER — Stock Market                 ');
console.log('══════════════════════════════════════════════\n');

const market = new StockMarket();

const alertObserver = new AlertObserver('AAPL', 3);   // alerta si cambia >3%
const portfolio = new PortfolioObserver({ AAPL: 10, MSFT: 5 });

market.subscribe(alertObserver);
market.subscribe(portfolio);

console.log('── Cambio 1: AAPL sube levemente ──────────────────');
market.updatePrice('AAPL', 150.00);
console.log();

console.log('── Cambio 2: AAPL cae fuerte (debe activar alerta) ─');
market.updatePrice('AAPL', 143.00); // ~4.67% de caída
console.log();

console.log('── Cambio 3: MSFT sube (sin alerta, portafolio actualiza) ─');
market.updatePrice('MSFT', 380.00);
