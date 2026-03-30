// src/patterns/estructural/proxy/access-control.proxy.ts

type AccessRole = 'ADMIN' | 'EDITOR' | 'USER';

interface DocumentService {
  read(docId: string): string;
  write(docId: string, content: string): void;
  delete(docId: string): void;
}

class RealDocumentService implements DocumentService {
  private docs: Map<string, string> = new Map([
    ['doc-1', 'Contenido del documento 1'],
    ['doc-2', 'Contenido del documento 2'],
  ]);

  read(docId: string): string {
    const content = this.docs.get(docId) ?? 'Documento no encontrado';
    console.log(`[DOC-SVC]    read("${docId}") → "${content}"`);
    return content;
  }

  write(docId: string, content: string): void {
    this.docs.set(docId, content);
    console.log(`[DOC-SVC]     write("${docId}") → guardado`);
  }

  delete(docId: string): void {
    this.docs.delete(docId);
    console.log(`[DOC-SVC]     delete("${docId}") → eliminado`);
  }
}

const PERMISSIONS: Record<string, AccessRole[]> = {
  read:   ['ADMIN', 'EDITOR', 'USER'] as unknown as AccessRole[],
  write:  ['ADMIN', 'EDITOR'] as unknown as AccessRole[],
  delete: ['ADMIN'] as unknown as AccessRole[],
};

class AccessControlProxy implements DocumentService {
  constructor(
    private readonly real: DocumentService,
    private readonly userRole: AccessRole
  ) {}

  private checkAccess(operation: string): boolean {
    const allowed = PERMISSIONS[operation]?.includes(this.userRole) ?? false;
    if (!allowed) {
      console.log(`[PROXY]    Acceso DENEGADO — rol "${this.userRole}" no puede ejecutar "${operation}"`);
    } else {
      console.log(`[PROXY]    Acceso PERMITIDO — rol "${this.userRole}" ejecuta "${operation}"`);
    }
    return allowed;
  }

  read(docId: string): string {
    if (!this.checkAccess('read')) return '';
    return this.real.read(docId);
  }

  write(docId: string, content: string): void {
    if (!this.checkAccess('write')) return;
    this.real.write(docId, content);
  }

  delete(docId: string): void {
    if (!this.checkAccess('delete')) return;
    this.real.delete(docId);
  }
}

console.log('═══════════════════════════════════════════');
console.log('     PROXY — Access Control Proxy           ');
console.log('═══════════════════════════════════════════\n');

const realDoc = new RealDocumentService();

console.log('── Usuario: ADMIN ────────────────────────────────────');
const adminProxy: DocumentService = new AccessControlProxy(realDoc, 'ADMIN');
adminProxy.read('doc-1');
adminProxy.write('doc-1', 'Contenido actualizado por admin');
adminProxy.delete('doc-2');
console.log();

console.log('── Usuario: EDITOR ───────────────────────────────────');
const editorProxy: DocumentService = new AccessControlProxy(realDoc, 'EDITOR');
editorProxy.read('doc-1');
editorProxy.write('doc-1', 'Edición del editor');
editorProxy.delete('doc-1'); // denegado
console.log();

console.log('── Usuario: USER ─────────────────────────────────────');
const userProxy: DocumentService = new AccessControlProxy(realDoc, 'USER');
userProxy.read('doc-1');
userProxy.write('doc-1', 'Intento fallido'); // denegado
userProxy.delete('doc-1');                    // denegado
