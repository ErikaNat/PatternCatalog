// src/patterns/comportamiento/repository/in-memory.repository.ts

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  name: string;
  password: string;
  createdAt: Date;
  authenticate: (password: string) => boolean;
  can: (action: string) => boolean;
}

interface UserRepository {
  save(user: User): User;
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  findByRole(role: User['role']): User[];
  delete(id: string): boolean;
  count(): number;
}

class InMemoryUserRepository implements UserRepository {
  private store: Map<string, User> = new Map();

  save(user: User): User {
    if (this.findByEmail(user.email) && this.findByEmail(user.email)?.id !== user.id) {
      throw new Error(` El email "${user.email}" ya está registrado`);
    }
    this.store.set(user.id, { ...user });
    return { ...user };
  }

  findById(id: string): User | undefined {
    return this.store.has(id) ? { ...this.store.get(id)! } : undefined;
  }

  findByEmail(email: string): User | undefined {
    const user = [...this.store.values()].find((u) => u.email === email);
    return user ? { ...user } : undefined;
  }

  findByRole(role: User['role']): User[] {
    return [...this.store.values()].filter((u) => u.role === role).map((u) => ({ ...u }));
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  count(): number { return this.store.size; }
}

class UserService {
  constructor(private readonly repo: UserRepository) {}

  register(id: string, name: string, email: string, role: User['role']): User {
    const user = this.repo.save({ id, name, email, role, createdAt: new Date(), password: '', authenticate: () => false, can: () => false });
    console.log(`[USER-SVC]  Registrado: ${user.name} <${user.email}> [${user.role}]`);
    return user;
  }

  getProfile(id: string): void {
    const user = this.repo.findById(id);
    if (user) {
      console.log(`[USER-SVC]  Perfil: ${JSON.stringify(user)}`);
    } else {
      console.log(`[USER-SVC]  Usuario con id "${id}" no encontrado`);
    }
  }

  listByRole(role: User['role']): void {
    const users = this.repo.findByRole(role);
    console.log(`[USER-SVC]  Usuarios con rol "${role}": ${users.length}`);
    users.forEach((u) => console.log(`  - ${u.name} <${u.email}>`));
  }
}

console.log('══════════════════════════════════════════════');
console.log('       REPOSITORY — In-Memory Repository       ');
console.log('══════════════════════════════════════════════\n');

const repo           = new InMemoryUserRepository();
const userService    = new UserService(repo);

console.log('── Registrar usuarios ─────────────────────────────────');
userService.register('u-1', 'Alice López',   'alice@empresa.com',   'admin');
userService.register('u-2', 'Bob Martínez',  'bob@empresa.com',     'user');
userService.register('u-3', 'Carol Jiménez', 'carol@empresa.com',   'manager');
userService.register('u-4', 'Dave Pérez',    'dave@empresa.com',    'user');

console.log(`\n[REPO] Total usuarios: ${repo.count()}`);

console.log('\n── Buscar por ID ──────────────────────────────────────');
userService.getProfile('u-2');
userService.getProfile('u-99'); // no existe

console.log('\n── Buscar por rol ─────────────────────────────────────');
userService.listByRole('user');

console.log('\n── Email duplicado (debe lanzar error) ────────────────');
try {
  userService.register('u-5', 'Duplicado', 'alice@empresa.com', 'user');
} catch (e: any) {
  console.log(`[REPO] ${e.message}`);
}

console.log('\n── Eliminar usuario ───────────────────────────────────');
const deleted = repo.delete('u-4');
console.log(`[REPO]  Usuario u-4 eliminado: ${deleted}`);
console.log(`[REPO] Total usuarios: ${repo.count()}`);
