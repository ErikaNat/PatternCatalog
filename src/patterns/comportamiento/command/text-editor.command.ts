// src/patterns/comportamiento/command/text-editor.command.ts

interface Command {
  execute(): void;
  undo(): void;
  readonly description: string;
}

class TextEditor {
  private content: string = '';

  insert(text: string, position: number): void {
    this.content =
      this.content.slice(0, position) + text + this.content.slice(position);
  }

  delete(position: number, length: number): void {
    this.content =
      this.content.slice(0, position) + this.content.slice(position + length);
  }

  format(start: number, end: number, tag: string): void {
    const target = this.content.slice(start, end);
    const formatted = `[${tag}]${target}[/${tag}]`;
    this.content =
      this.content.slice(0, start) + formatted + this.content.slice(end);
  }

  getContent(): string { return this.content; }

  print(label: string): void {
    console.log(`  [EDITOR] ${label}: "${this.content}"`);
  }
}

class InsertTextCommand implements Command {
  readonly description: string;
  constructor(
    private readonly editor: TextEditor,
    private readonly text: string,
    private readonly position: number
  ) {
    this.description = `Insertar "${text}" en pos ${position}`;
  }
  execute(): void {
    this.editor.insert(this.text, this.position);
    console.log(`  [CMD]    ${this.description}`);
  }
  undo(): void {
    this.editor.delete(this.position, this.text.length);
    console.log(`  [CMD]     Deshecho: ${this.description}`);
  }
}

class DeleteTextCommand implements Command {
  readonly description: string;
  private deletedText: string = '';

  constructor(
    private readonly editor: TextEditor,
    private readonly position: number,
    private readonly length: number
  ) {
    this.description = `Borrar ${length} caracteres desde pos ${position}`;
  }
  execute(): void {
    this.deletedText = this.editor.getContent().slice(this.position, this.position + this.length);
    this.editor.delete(this.position, this.length);
    console.log(`  [CMD]    ${this.description} (eliminado: "${this.deletedText}")`);
  }
  undo(): void {
    this.editor.insert(this.deletedText, this.position);
    console.log(`  [CMD]     Deshecho: restaurado "${this.deletedText}"`);
  }
}

class FormatCommand implements Command {
  readonly description: string;
  private formattedLength: number = 0;
  private originalText: string = '';

  constructor(
    private readonly editor: TextEditor,
    private readonly start: number,
    private readonly end: number,
    private readonly tag: string
  ) {
    this.description = `Formatear pos ${start}-${end} con [${tag}]`;
  }
  execute(): void {
    this.originalText = this.editor.getContent().slice(this.start, this.end);
    this.editor.format(this.start, this.end, this.tag);
    this.formattedLength = `[${this.tag}]${this.originalText}[/${this.tag}]`.length;
    console.log(`  [CMD]    ${this.description}`);
  }
  undo(): void {
    this.editor.delete(this.start, this.formattedLength);
    this.editor.insert(this.originalText, this.start);
    console.log(`  [CMD]     Deshecho: ${this.description}`);
  }
}

class CommandHistory {
  private stack: Command[] = [];
  private redoStack: Command[] = [];

  execute(cmd: Command): void {
    cmd.execute();
    this.stack.push(cmd);
    this.redoStack = [];
  }

  undo(): void {
    const cmd = this.stack.pop();
    if (!cmd) { console.log('  [HISTORY]     Nada que deshacer'); return; }
    cmd.undo();
    this.redoStack.push(cmd);
  }
}

console.log('══════════════════════════════════════════════');
console.log('       COMMAND — Text Editor                   ');
console.log('══════════════════════════════════════════════\n');

const editor  = new TextEditor();
const cmdHist = new CommandHistory();

console.log('── Paso 1: Insertar texto ─────────────────────────────');
cmdHist.execute(new InsertTextCommand(editor, 'Hola mundo', 0));
editor.print('Contenido');

console.log('\n── Paso 2: Insertar más texto ─────────────────────────');
cmdHist.execute(new InsertTextCommand(editor, ' TypeScript', 10));
editor.print('Contenido');

console.log('\n── Paso 3: Formatear "mundo" en negrita ───────────────');
cmdHist.execute(new FormatCommand(editor, 5, 10, 'bold'));
editor.print('Contenido');

console.log('\n── Paso 4: Borrar " TypeScript" ───────────────────────');
cmdHist.execute(new DeleteTextCommand(editor, editor.getContent().indexOf(' TypeScript'), 11));
editor.print('Contenido');

console.log('\n── Deshacer ×1 (restaurar borrado) ────────────────────');
cmdHist.undo();
editor.print('Contenido');

console.log('\n── Deshacer ×1 (quitar formato bold) ──────────────────');
cmdHist.undo();
editor.print('Contenido');
