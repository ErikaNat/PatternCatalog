// src/patterns/estructural/facade/order.facade.ts

// Subsistemas internos complejos

// Servicio que maneja el inventario de productos
class InventoryService {
  // Stock disponible de cada producto
  private stock: Record<string, number> = { 'SKU-001': 10, 'SKU-002': 0, 'SKU-003': 5 };

  // Verifica si hay stock disponible
  checkStock(productId: string, quantity: number): boolean {
    return (this.stock[productId] ?? 0) >= quantity;
  }

  // Reserva un producto (reduce el stock)
  reserve(productId: string, quantity: number): void {
    this.stock[productId] -= quantity;
  }
}

// Servicio que procesa pagos
class PaymentService {
  // Simula el cobro y devuelve un ID de transaccion
  charge(customerId: string, amount: number): string {
    return `TX-${Date.now()}`;
  }
}

// Servicio que maneja envios
class ShippingService {
  // Programa el envio y devuelve numero de seguimiento
  scheduleShipment(orderId: string): string {
    return `TRACK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

// Servicio que envia emails
class EmailService {
  // Envia confirmacion de compra
  sendConfirmation(email: string, trackingId: string): void {
    console.log(`  [EMAIL] Confirmación enviada a ${email}`);
  }

  // Envia notificacion de error
  sendFailureNotice(email: string, reason: string): void {
    console.log(`  [EMAIL] Fallo notificado: ${reason}`);
  }
}

// Datos que recibe la fachada para procesar orden
interface OrderData {
  orderId: string;
  customerId: string;
  customerEmail: string;
  productId: string;
  quantity: number;
  amount: number;
}

// Resultado que devuelve la fachada
interface OrderResult {
  success: boolean;
  message: string;
  trackingId?: string;
  transactionId?: string;
}

// Fachada que coordina todos los subsistemas internos
class OrderFacade {
  // Instancias privadas de los subsistemas
  private inventory = new InventoryService();
  private payment = new PaymentService();
  private shipping = new ShippingService();
  private email = new EmailService();

  // Metodo unico que el cliente debe llamar para procesar una orden
  placeOrder(data: OrderData): OrderResult {
    // Paso 1: Verifica que hay stock disponible
    if (!this.inventory.checkStock(data.productId, data.quantity)) {
      const reason = `Sin stock para ${data.productId}`;
      // Si no hay stock, notifica al cliente
      this.email.sendFailureNotice(data.customerEmail, reason);
      return { success: false, message: reason };
    }

    // Paso 2: Reserva el inventario
    this.inventory.reserve(data.productId, data.quantity);
    
    // Paso 3: Cobra el dinero
    const txId = this.payment.charge(data.customerId, data.amount);
    
    // Paso 4: Programa el envio
    const trackingId = this.shipping.scheduleShipment(data.orderId);
    
    // Paso 5: Notifica al cliente
    this.email.sendConfirmation(data.customerEmail, trackingId);

    // Devuelve resultado exitoso
    return { success: true, message: 'Orden completada', trackingId, transactionId: txId };
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('            FACADE — Order Facade           ');
console.log('═══════════════════════════════════════════\n');

const orderFacade = new OrderFacade();

console.log('Caso 1: Orden exitosa (stock disponible)');
const r1 = orderFacade.placeOrder({
  orderId: 'ORD-1001', customerId: 'USR-42', customerEmail: 'cliente@test.com',
  productId: 'SKU-001', quantity: 2, amount: 100,
});
console.log(`✓ ${r1.message} | Tracking: ${r1.trackingId}\n`);

console.log('Caso 2: Orden fallida (sin stock)');
const r2 = orderFacade.placeOrder({
  orderId: 'ORD-1002', customerId: 'USR-99', customerEmail: 'otro@test.com',
  productId: 'SKU-002', quantity: 1, amount: 50,
});
console.log(`✗ ${r2.message}`);
