// src/patterns/comportamiento/strategy/payment.strategy.ts

interface PaymentDetails {
  [key: string]: string | number;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

interface PaymentStrategy {
  readonly name: string;
  pay(amount: number, details: PaymentDetails): PaymentResult;
}

class CreditCardPayment implements PaymentStrategy {
  readonly name = 'Tarjeta de crédito';

  pay(amount: number, details: PaymentDetails): PaymentResult {
    console.log(`  [CREDIT-CARD]    Procesando cargo de $${amount.toFixed(2)}`);
    console.log(`  [CREDIT-CARD] Tarjeta: **** **** **** ${details['lastFour']}`);
    console.log(`  [CREDIT-CARD] Titular: ${details['holder']}`);
    const txId = `CC-${Date.now()}`;
    return { success: true, transactionId: txId, message: `Cargo exitoso. Auth code: AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}` };
  }
}

class BankTransferPayment implements PaymentStrategy {
  readonly name = 'Transferencia bancaria';

  pay(amount: number, details: PaymentDetails): PaymentResult {
    console.log(`  [BANK-TRANSFER]    Iniciando transferencia de $${amount.toFixed(2)}`);
    console.log(`  [BANK-TRANSFER] Desde cuenta: ${details['fromAccount']}`);
    console.log(`  [BANK-TRANSFER] Hacia cuenta: ${details['toAccount']}`);
    console.log(`  [BANK-TRANSFER] Banco destino: ${details['bankName']}`);
    const txId = `BT-${Date.now()}`;
    return { success: true, transactionId: txId, message: 'Transferencia programada. Acreditación en 24-48h.' };
  }
}

class CryptoPayment implements PaymentStrategy {
  readonly name = 'Pago con criptomoneda';

  pay(amount: number, details: PaymentDetails): PaymentResult {
    const crypto = details['currency'] as string;
    const rate   = details['rate'] as number;
    const cryptoAmount = (amount / rate).toFixed(8);
    console.log(`  [CRYPTO] ₿  Procesando pago en ${crypto}`);
    console.log(`  [CRYPTO] Monto USD  : $${amount.toFixed(2)}`);
    console.log(`  [CRYPTO] Tasa       : 1 ${crypto} = $${rate}`);
    console.log(`  [CRYPTO] Monto crypto: ${cryptoAmount} ${crypto}`);
    console.log(`  [CRYPTO] Wallet destino: ${details['wallet']}`);
    const txId = `CRYPTO-${Date.now()}`;
    return { success: true, transactionId: txId, message: `${cryptoAmount} ${crypto} enviados. Confirmaciones: 3/3` };
  }
}

class PaymentProcessor {
  private strategy: PaymentStrategy | null = null;

  setStrategy(strategy: PaymentStrategy): this {
    this.strategy = strategy;
    return this;
  }

  process(amount: number, details: PaymentDetails): void {
    if (!this.strategy) throw new Error('   No se ha definido una estrategia de pago');
    console.log(`[PROCESSOR]    Procesando pago de $${amount.toFixed(2)} con "${this.strategy.name}"`);
    const result = this.strategy.pay(amount, details);
    const icon   = result.success ? '  ' : '  ';
    console.log(`  ${icon} Resultado: ${result.message}`);
    console.log(`     TxID: ${result.transactionId}`);
  }
}

console.log('══════════════════════════════════════════════');
console.log('       STRATEGY — Payment Strategies           ');
console.log('══════════════════════════════════════════════\n');

const processor = new PaymentProcessor();

console.log('── Pago 1: Tarjeta de crédito ─────────────────────────');
processor.setStrategy(new CreditCardPayment()).process(299.99, {
  lastFour: '4242', holder: 'Alice López', cvv: '***', expiry: '12/26',
});
console.log();

console.log('── Pago 2: Transferencia bancaria ─────────────────────');
processor.setStrategy(new BankTransferPayment()).process(1500.00, {
  fromAccount: '1234-5678-90', toAccount: '0987-6543-21',
  bankName: 'Banco Nacional', reference: 'Orden #9821',
});
console.log();

console.log('── Pago 3: Criptomoneda (Bitcoin) ─────────────────────');
processor.setStrategy(new CryptoPayment()).process(500.00, {
  currency: 'BTC', rate: 65000,
  wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
});
