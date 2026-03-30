// src/patterns/creacional/factory/notification-factory.ts

interface Notifier {
  send(recipient: string, message: string): void;
  readonly channel: string;
}

class EmailNotifier implements Notifier {
  readonly channel = 'Email';
  send(recipient: string, message: string): void {
    console.log(`[EMAIL]    Enviando a ${recipient}`);
    console.log(`        Asunto: Notificación del sistema`);
    console.log(`        Cuerpo: ${message}`);
  }
}

class SMSNotifier implements Notifier {
  readonly channel = 'SMS';
  send(recipient: string, message: string): void {
    console.log(`[SMS]    Enviando SMS a ${recipient}`);
    console.log(`      Texto: ${message.substring(0, 160)}`);
  }
}

class PushNotifier implements Notifier {
  readonly channel = 'Push';
  send(recipient: string, message: string): void {
    console.log(`[PUSH]    Enviando notificación push a device de ${recipient}`);
    console.log(`       Payload: { title: "Alerta", body: "${message}" }`);
  }
}

type NotifierType = 'email' | 'sms' | 'push';

class NotifierFactory {
  static create(type: NotifierType): Notifier {
    switch (type) {
      case 'email': return new EmailNotifier();
      case 'sms':   return new SMSNotifier();
      case 'push':  return new PushNotifier();
      default:
        throw new Error(`   Canal de notificación desconocido: ${type}`);
    }
  }
}

// ─── Demo ────────────────────────────────────────────────────────────────────
console.log('════════════════════════════════════════════');
console.log('     FACTORY METHOD — Notification Factory   ');
console.log('════════════════════════════════════════════\n');

const recipient = 'usuario@ejemplo.com / +591-70000000 / device_xyz';
const message = 'Tu pedido #4521 ha sido confirmado y está siendo procesado.';

const channels: NotifierType[] = ['email', 'sms', 'push'];

for (const channel of channels) {
  const notifier = NotifierFactory.create(channel);
  console.log(`   Canal: ${notifier.channel}`);
  notifier.send(recipient, message);
  console.log();
}

// Caso de error
console.log('[TEST] Probando canal inválido...');
try {
  NotifierFactory.create('telegram' as NotifierType);
} catch (e: any) {
  console.log(`   Error esperado: ${e.message}`);
}
