// src/patterns/comportamiento/state/order-flow.state.ts

interface OrderState {
  confirm(): void;
  pay(): void;
  ship(): void;
  deliver(): void;
  cancel(): void;
  readonly stateName: string;
}

class Order {
  private state: OrderState;
  readonly id: string;

  constructor(id: string) {
    this.id    = id;
    this.state = new DraftState(this);
    console.log(`[ORDER]    Orden "${id}" creada en estado: ${this.state.stateName}`);
  }

  setState(state: OrderState): void {
    console.log(`[ORDER]    Transición: ${this.state.stateName} → ${state.stateName}`);
    this.state = state;
  }

  getStateName(): string { return this.state.stateName; }

  confirm(): void { this.state.confirm(); }
  pay():     void { this.state.pay();     }
  ship():    void { this.state.ship();    }
  deliver(): void { this.state.deliver(); }
  cancel():  void { this.state.cancel();  }
}

class DraftState implements OrderState {
  readonly stateName = 'Borrador';
  constructor(private readonly order: Order) {}

  confirm(): void { this.order.setState(new ConfirmedState(this.order)); }
  pay():     void { console.log('  [STATE]    No se puede pagar un borrador sin confirmar'); }
  ship():    void { console.log('  [STATE]    No se puede enviar un borrador'); }
  deliver(): void { console.log('  [STATE]    No se puede entregar un borrador'); }
  cancel():  void { this.order.setState(new CancelledState(this.order)); }
}

class ConfirmedState implements OrderState {
  readonly stateName = 'Confirmado';
  constructor(private readonly order: Order) {}

  confirm(): void { console.log('  [STATE]     La orden ya está confirmada'); }
  pay():     void { this.order.setState(new PaidState(this.order)); }
  ship():    void { console.log('  [STATE]    Debe pagarse antes de enviarse'); }
  deliver(): void { console.log('  [STATE]    Debe pagarse y enviarse primero'); }
  cancel():  void { this.order.setState(new CancelledState(this.order)); }
}

class PaidState implements OrderState {
  readonly stateName = 'Pagado';
  constructor(private readonly order: Order) {}

  confirm(): void { console.log('  [STATE]     La orden ya está pagada'); }
  pay():     void { console.log('  [STATE]     La orden ya fue pagada'); }
  ship():    void { this.order.setState(new ShippedState(this.order)); }
  deliver(): void { console.log('  [STATE]    Debe enviarse antes de entregarse'); }
  cancel():  void { console.log('  [STATE]    No se puede cancelar una orden ya pagada'); }
}

class ShippedState implements OrderState {
  readonly stateName = 'Enviado';
  constructor(private readonly order: Order) {}

  confirm(): void { console.log('  [STATE]     La orden ya fue enviada'); }
  pay():     void { console.log('  [STATE]     La orden ya fue pagada y enviada'); }
  ship():    void { console.log('  [STATE]     La orden ya está en camino'); }
  deliver(): void { this.order.setState(new DeliveredState(this.order)); }
  cancel():  void { console.log('  [STATE]    No se puede cancelar una orden en tránsito'); }
}

class DeliveredState implements OrderState {
  readonly stateName = 'Entregado';
  constructor(private readonly _order: Order) {}

  confirm(): void { console.log('  [STATE]     Orden finalizada'); }
  pay():     void { console.log('  [STATE]     Orden finalizada'); }
  ship():    void { console.log('  [STATE]     Orden ya entregada'); }
  deliver(): void { console.log('  [STATE]     La orden ya fue entregada'); }
  cancel():  void { console.log('  [STATE]    No se puede cancelar una orden ya entregada'); }
}

class CancelledState implements OrderState {
  readonly stateName = 'Cancelado';
  constructor(private readonly _order: Order) {}

  confirm(): void { console.log('  [STATE]    La orden fue cancelada'); }
  pay():     void { console.log('  [STATE]    La orden fue cancelada'); }
  ship():    void { console.log('  [STATE]    La orden fue cancelada'); }
  deliver(): void { console.log('  [STATE]    La orden fue cancelada'); }
  cancel():  void { console.log('  [STATE]     La orden ya está cancelada'); }
}

console.log('══════════════════════════════════════════════');
console.log('       STATE — Order Flow                      ');
console.log('══════════════════════════════════════════════\n');

console.log('── Flujo feliz: Draft → Confirmed → Paid → Shipped → Delivered ─');
const order1 = new Order('ORD-001');
order1.confirm();
order1.pay();
order1.ship();
order1.deliver();
order1.cancel(); // inválido en estado Delivered
console.log(`\n  Estado final: ${order1.getStateName()}`);

console.log('\n── Flujo con cancelación desde Confirmed ───────────────');
const order2 = new Order('ORD-002');
order2.confirm();
order2.pay();    // simula error: intentar pagar sin confirmar (ya confirmado)
order2.cancel(); // inválido: ya pagado
order2.ship();
order2.cancel(); // inválido: en tránsito
console.log(`\n  Estado final: ${order2.getStateName()}`);

console.log('\n── Cancelación desde Borrador ──────────────────────────');
const order3 = new Order('ORD-003');
order3.pay();    // inválido
order3.cancel();
console.log(`  Estado final: ${order3.getStateName()}`);
