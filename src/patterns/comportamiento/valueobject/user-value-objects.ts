// src/patterns/comportamiento/valueobject/user-value-objects.ts

// ── Value Object: Email ───────────────────────────────────────────────────────
class Email {
  private readonly value: string;
  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(raw: string) {
    const normalized = raw.trim().toLowerCase();
    if (!Email.REGEX.test(normalized)) {
      throw new Error(`   Email inválido: "${raw}"`);
    }
    this.value = normalized;
  }

  toString(): string { return this.value; }

  equals(other: Email): boolean { return this.value === other.value; }
}

// ── Value Object: Password ────────────────────────────────────────────────────
class Password {
  private readonly hashed: string;

  constructor(plain: string) {
    if (plain.length < 8) {
      throw new Error(`   Contraseña muy corta: mínimo 8 caracteres`);
    }
    // Hash simplificado (en producción usarías bcrypt)
    this.hashed = Password.simpleHash(plain);
  }

  private static simpleHash(plain: string): string {
    let hash = 0;
    for (let i = 0; i < plain.length; i++) {
      hash = ((hash << 5) - hash) + plain.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  matches(plain: string): boolean {
    return this.hashed === Password.simpleHash(plain);
  }

  getHash(): string { return this.hashed; }
}

// ── Value Object: Role ────────────────────────────────────────────────────────
type RoleType = 'ADMIN' | 'MANAGER' | 'USER';

class Role {
  static readonly ADMIN:   Role = new Role('ADMIN');
  static readonly MANAGER: Role = new Role('MANAGER');
  static readonly USER:    Role = new Role('USER');

  private static readonly PERMISSIONS: Record<RoleType, string[]> = {
    ADMIN:   ['read', 'write', 'delete', 'manage_users', 'view_reports'],
    MANAGER: ['read', 'write', 'view_reports'],
    USER:    ['read'],
  };

  private constructor(private readonly value: RoleType) {}

  hasPermission(permission: string): boolean {
    return Role.PERMISSIONS[this.value].includes(permission);
  }

  toString(): string { return this.value; }

  equals(other: Role): boolean { return this.value === other.value; }
}

// ── Entidad: User (usa los 3 Value Objects) ───────────────────────────────────
class User {
  readonly id: string;
  readonly email: Email;
  readonly role: Role;
  private readonly password: Password;

  constructor(id: string, email: Email, password: Password, role: Role) {
    this.id       = id;
    this.email    = email;
    this.password = password;
    this.role     = role;
  }

  authenticate(plainPassword: string): boolean {
    return this.password.matches(plainPassword);
  }

  can(permission: string): boolean {
    return this.role.hasPermission(permission);
  }

  toString(): string {
    return `User(${this.id}, ${this.email}, ${this.role})`;
  }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════');
console.log('       VALUE OBJECT — User Value Objects       ');
console.log('══════════════════════════════════════════════\n');

console.log('── Email: validación y normalización ──────────────────');
const email1 = new Email('  Alice@Empresa.COM  ');
const email2 = new Email('alice@empresa.com');
console.log(`   Email creado: "${email1}"`);
console.log(`   email1.equals(email2) → ${email1.equals(email2)} (igualdad por valor)`);

console.log('\n── Email: caso inválido ────────────────────────────────');
try {
  new Email('no-es-un-email');
} catch (e: any) {
  console.log(e.message);
}

console.log('\n── Password: hash y verificación ──────────────────────');
const pwd = new Password('miPassword123');
console.log(`   Hash almacenado: ${pwd.getHash()}`);
console.log(`   matches("miPassword123")  → ${pwd.matches('miPassword123')}`);
console.log(`   matches("otraPassword")   → ${pwd.matches('otraPassword')}`);

console.log('\n── Password: caso inválido (< 8 chars) ─────────────────');
try {
  new Password('corta');
} catch (e: any) {
  console.log(e.message);
}

console.log('\n── Role: permisos por rol ──────────────────────────────');
const permissions = ['read', 'write', 'delete', 'manage_users'];
for (const role of [Role.ADMIN, Role.MANAGER, Role.USER]) {
  const perms = permissions.map((p) => `${p}:${role.hasPermission(p) ? '  ' : '  '}`).join(' | ');
  console.log(`  ${role}: ${perms}`);
}

console.log('\n── Entidad User completa ───────────────────────────────');
const user = new User('u-1', new Email('admin@empresa.com'), new Password('adminPass1'), Role.ADMIN);
console.log(`   ${user}`);
console.log(`   authenticate("adminPass1")  → ${user.authenticate('adminPass1')}`);
console.log(`   authenticate("wrong")       → ${user.authenticate('wrong')}`);
console.log(`   can("delete")               → ${user.can('delete')}`);
console.log(`   can("manage_users")         → ${user.can('manage_users')}`);
