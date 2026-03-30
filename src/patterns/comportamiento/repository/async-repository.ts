// src/patterns/comportamiento/repository/async-repository.ts

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  name: string;
  password: string;
  createdAt: Date;
  authenticate(password: string): boolean;
  can(action: string): boolean;
}

interface AsyncUserRepository {
  save(user: Omit<User, 'id' | 'createdAt' | 'authenticate' | 'can'>): Promise<User>;
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByRole(role: User['role']): Promise<User[]>;
  delete(id: string): Promise<boolean>;
}

function createUser(data: Omit<User, 'authenticate' | 'can'>): User {
  return {
    ...data,
    authenticate: (password: string) => data.password === password,
    can: (action: string) => {
      if (data.role === 'admin') return true;
      if (data.role === 'manager') return ['read', 'write'].includes(action);
      return action === 'read';
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class AsyncInMemoryUserRepository implements AsyncUserRepository {
  private store: Map<string, User> = new Map();

  async save(data: Omit<User, 'id' | 'createdAt' | 'authenticate' | 'can'>): Promise<User> {
    await delay(30); // simula latencia de escritura
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new Error(` Email "${data.email}" ya registrado`);
    }
    const id = `u-${Date.now()}`;
    const user = createUser({ ...data, id, createdAt: new Date() });
    this.store.set(user.id, user);
    return createUser({ ...user });
  }

  async findById(id: string): Promise<User | undefined> {
    await delay(20);
    const user = this.store.get(id);
    return user ? createUser({ ...user }) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    await delay(20);
    const user = [...this.store.values()].find((u) => u.email === email);
    return user ? createUser({ ...user }) : undefined;
  }

  async findByRole(role: User['role']): Promise<User[]> {
    await delay(25);
    return [...this.store.values()]
      .filter((u) => u.role === role)
      .map((u) => createUser({ ...u }));
  }

  async delete(id: string): Promise<boolean> {
    await delay(15);
    return this.store.delete(id);
  }
}

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════');
  console.log('       REPOSITORY — Async Repository           ');
  console.log('══════════════════════════════════════════════\n');

  const repo = new AsyncInMemoryUserRepository();

  console.log('── Guardar usuarios (async/await) ─────────────────────');
  const alice = await repo.save({ name: 'Alice López',  email: 'alice@empresa.com', password: 'pass123', role: 'admin' });
  console.log(`[ASYNC-REPO]  Guardado: ${alice.name} | createdAt: ${alice.createdAt.toISOString()}`);

  const bob = await repo.save({ name: 'Bob Martínez', email: 'bob@empresa.com', password: 'pass123', role: 'user' });
  console.log(`[ASYNC-REPO]  Guardado: ${bob.name} | createdAt: ${bob.createdAt.toISOString()}`);

  await repo.save({ name: 'Carol Jiménez', email: 'carol@empresa.com', password: 'pass123', role: 'manager' });
  console.log(`[ASYNC-REPO]  Guardado: Carol Jiménez`);

  console.log('\n── Buscar por ID ──────────────────────────────────────');
  const found = await repo.findById('u-1');
  console.log(`[ASYNC-REPO]  findById("u-1"): ${found?.name ?? 'no encontrado'}`);

  const notFound = await repo.findById('u-999');
  console.log(`[ASYNC-REPO]  findById("u-999"): ${notFound ?? 'no encontrado'}`);

  console.log('\n── Buscar por email ───────────────────────────────────');
  const byEmail = await repo.findByEmail('bob@empresa.com');
  console.log(`[ASYNC-REPO]  findByEmail: ${byEmail?.name} [${byEmail?.role}]`);

  console.log('\n── Buscar por rol ─────────────────────────────────────');
  const users = await repo.findByRole('user');
  console.log(`[ASYNC-REPO]  Usuarios con rol "user": ${users.map((u) => u.name).join(', ')}`);

  console.log('\n── Email duplicado ────────────────────────────────────');
  try {
    await repo.save({ name: 'Duplicado', email: 'alice@empresa.com', password: 'pass123', role: 'user' });
  } catch (e: any) {
    console.log(`[ASYNC-REPO] ${e.message}`);
  }

  console.log('\n── Eliminar ───────────────────────────────────────────');
  const del = await repo.delete('u-2');
  console.log(`[ASYNC-REPO]  delete("u-2"): ${del}`);
  const afterDelete = await repo.findById('u-2');
  console.log(`[ASYNC-REPO]  findById("u-2") tras borrar: ${afterDelete ?? 'no encontrado'}`);
}

main().catch((err) => console.error('Error:', err));
