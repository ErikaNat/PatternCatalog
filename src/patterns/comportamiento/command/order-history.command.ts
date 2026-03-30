// src/patterns/comportamiento/command/order-history.command.ts

interface Command {
  execute(): void;
  undo(): void;
  readonly description: string;
}

interface SimpleOrder {
  id: string;
  product: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'shipped';
}

class OrderStore {
  private orders: Map<string, SimpleOrder> = new Map();

  addOrder(order: SimpleOrder): void {
    this.orders.set(order.id, { ...order });
  }

  removeOrder(id: string): void {
    this.orders.delete(id);
  }

  updateStatus(id: string, status: SimpleOrder['status']): void {
    const order = this.orders.get(id);
    if (order) order.status = status;
  }

  getOrder(id: string): SimpleOrder | undefined {
    return this.orders.get(id);
  }

  printAll(): void {
    if (this.orders.size === 0) {
      console.log('  [STORE] (vacío)');
      return;
    }
    this.orders.forEach((o) =>
      console.log(`  [STORE] ${o.id} | ${o.product} x${o.quantity} | estado: ${o.status}`)
    );
  }
}

class CreateOrderCommand implements Command {
  readonly description: string;
  constructor(private readonly store: OrderStore, private readonly order: SimpleOrder) {
    this.description = `Crear orden ${order.id} (${order.product})`;
  }
  execute(): void {
    this.store.addOrder(this.order);
    console.log(`  [CMD]  Ejecutado: ${this.description}`);
  }
  undo(): void {
    this.store.removeOrder(this.order.id);
    console.log(`  [CMD] ↩  Deshecho: ${this.description}`);
  }
}

class CancelOrderCommand implements Command {
  readonly description: string;
  private previousStatus: SimpleOrder['status'] | null = null;

  constructor(private readonly store: OrderStore, private readonly orderId: string) {
    this.description = `Cancelar orden ${orderId}`;
  }
  execute(): void {
    const order = this.store.getOrder(this.orderId);
    if (order) {
      this.previousStatus = order.status;
      this.store.updateStatus(this.orderId, 'cancelled');
      console.log(`  [CMD]  Ejecutado: ${this.description}`);
    }
  }
  undo(): void {
    if (this.previousStatus) {
      this.store.updateStatus(this.orderId, this.previousStatus);
      console.log(`  [CMD] ↩  Deshecho: ${this.description} → restaurado a "${this.previousStatus}"`);
    }
  }
}

class UpdateStatusCommand implements Command {
  readonly description: string;
  private previousStatus: SimpleOrder['status'] | null = null;

  constructor(
    private readonly store: OrderStore,
    private readonly orderId: string,
    private readonly newStatus: SimpleOrder['status']
  ) {
    this.description = `Actualizar ${orderId} → "${newStatus}"`;
  }
  execute(): void {
    const order = this.store.getOrder(this.orderId);
    if (order) {
      this.previousStatus = order.status;
      this.store.updateStatus(this.orderId, this.newStatus);
      console.log(`  [CMD]  Ejecutado: ${this.description}`);
    }
  }
  undo(): void {
    if (this.previousStatus) {
      this.store.updateStatus(this.orderId, this.previousStatus);
      console.log(`  [CMD] ↩  Deshecho: ${this.description} → restaurado a "${this.previousStatus}"`);
    }
  }
}

class OrderCommandHistory {
  private history: Command[] = [];
  private undone:  Command[] = [];

  executeCommand(cmd: Command): void {
    cmd.execute();
    this.history.push(cmd);
    this.undone = []; // limpiar pila de redo al ejecutar nuevo comando
  }

  undo(): void {
    const cmd = this.history.pop();
    if (!cmd) { console.log('  [HISTORY] ️  Nada que deshacer'); return; }
    cmd.undo();
    this.undone.push(cmd);
  }

  redo(): void {
    const cmd = this.undone.pop();
    if (!cmd) { console.log('  [HISTORY] ️  Nada que rehacer'); return; }
    cmd.execute();
    this.history.push(cmd);
  }
}

console.log('══════════════════════════════════════════════');
console.log('       COMMAND — Order History                 ');
console.log('══════════════════════════════════════════════\n');

const store           = new OrderStore();
const commandHistory = new OrderCommandHistory();

console.log('── Ejecutar 3 comandos ────────────────────────────────');
commandHistory.executeCommand(new CreateOrderCommand(store, { id: 'ORD-1', product: 'Laptop', quantity: 1, status: 'pending' }));
commandHistory.executeCommand(new UpdateStatusCommand(store, 'ORD-1', 'confirmed'));
commandHistory.executeCommand(new CreateOrderCommand(store, { id: 'ORD-2', product: 'Mouse', quantity: 2, status: 'pending' }));
console.log('\n  Estado actual:');
store.printAll();

console.log('\n── Deshacer 2 veces ───────────────────────────────────');
commandHistory.undo();
commandHistory.undo();
console.log('\n  Estado tras deshacer:');
store.printAll();

console.log('\n── Rehacer 1 vez ──────────────────────────────────────');
commandHistory.redo();
console.log('\n  Estado final:');
store.printAll();
