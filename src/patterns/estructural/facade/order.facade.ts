// src/patterns/estructural/facade/order.facade.ts


class InventoryService {
  private stock: Record<string, number> = { 'SKU-001': 10, 'SKU-002': 0, 'SKU-003': 5 };

  checkStock(productId: string, quantity: number): boolean {
    return (this.stock[productId] ?? 0) >= quantity;
  }

  reserve(productId: string, quantity: number): void {
    this.stock[productId] -= quantity;
  }
}

class PaymentService {
  charge(customerId: string, amount: number): string {
    return `TX-${Date.now()}`;
  }
}

class ShippingService {
  scheduleShipment(orderId: string): string {
    return `TRACK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

class EmailService {
  sendConfirmation(email: string, trackingId: string): void {
    console.log(`  [EMAIL] Confirmación enviada a ${email}`);
  }

  sendFailureNotice(email: string, reason: string): void {
    console.log(`  [EMAIL] Fallo notificado: ${reason}`);
  }
}

interface OrderData {
  orderId: string;
  customerId: string;
  customerEmail: string;
  productId: string;
  quantity: number;
  amount: number;
}

interface OrderResult {
  success: boolean;
  message: string;
  trackingId?: string;
  transactionId?: string;
}

class OrderFacade {
  private inventory = new InventoryService();
  private payment = new PaymentService();
  private shipping = new ShippingService();
  private email = new EmailService();

  placeOrder(data: OrderData): OrderResult {
    if (!this.inventory.checkStock(data.productId, data.quantity)) {
      const reason = `Sin stock para ${data.productId}`;
      this.email.sendFailureNotice(data.customerEmail, reason);
      return { success: false, message: reason };
    }

    this.inventory.reserve(data.productId, data.quantity);
    
    const txId = this.payment.charge(data.customerId, data.amount);
    
    const trackingId = this.shipping.scheduleShipment(data.orderId);
    
    this.email.sendConfirmation(data.customerEmail, trackingId);

    return { success: true, message: 'Orden completada', trackingId, transactionId: txId };
  }
}

console.log('═══════════════════════════════════════════');
console.log('            FACADE — Order Facade           ');
console.log('═══════════════════════════════════════════\n');

const orderFacade = new OrderFacade();

console.log('Caso 1: Orden exitosa (stock disponible)');
const r1 = orderFacade.placeOrder({
  orderId: 'ORD-1001', customerId: 'USR-42', customerEmail: 'cliente@test.com',
  productId: 'SKU-001', quantity: 2, amount: 100,
});
console.log(` ${r1.message} | Tracking: ${r1.trackingId}\n`);

console.log('Caso 2: Orden fallida (sin stock)');
const r2 = orderFacade.placeOrder({
  orderId: 'ORD-1002', customerId: 'USR-99', customerEmail: 'otro@test.com',
  productId: 'SKU-002', quantity: 1, amount: 50,
});
console.log(` ${r2.message}`);
