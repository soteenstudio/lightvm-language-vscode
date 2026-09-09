import * as vscode from 'vscode';
import { findOpcodeOccurrences, isInsideCommentOrString, LIGHTVM_OPCODES, LIGHTVM_PRIMITIVE_TYPES } from './language';

export { LIGHTVM_OPCODES, LIGHTVM_PRIMITIVE_TYPES } from './language';
const languageSelector: vscode.DocumentSelector = { language: 'lightvm' };

export function activate(context: vscode.ExtensionContext): void {
    const completionProvider = vscode.languages.registerCompletionItemProvider(languageSelector, {
        provideCompletionItems(document, position) {
            if (isInsideCommentOrString(document.lineAt(position.line).text, position.character)) { return []; }
            const opcodes = LIGHTVM_OPCODES.map((opcode) => {
                const item = new vscode.CompletionItem(opcode, vscode.CompletionItemKind.Keyword);
                item.detail = 'LightVM opcode';
                item.documentation = new vscode.MarkdownString(`LightVM v0.1.0-alpha.9 \`${opcode}\` opcode.`);
                return item;
            });
            const types = LIGHTVM_PRIMITIVE_TYPES.map((type) => {
                const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
                item.detail = 'LightVM primitive type';
                item.documentation = new vscode.MarkdownString(`LightVM v0.1.0-alpha.9 primitive type \`${type}\`.`);
                return item;
            });
            return [...opcodes, ...types];
        },
    });

    let enabled = false;
    const changed = new vscode.EventEmitter<void>();
    const inlayProvider = vscode.languages.registerInlayHintsProvider(languageSelector, {
        onDidChangeInlayHints: changed.event,
        provideInlayHints(document, range) {
            if (!enabled) { return []; }
            return findOpcodeOccurrences(document.getText()).flatMap((occurrence) => {
                const position = document.positionAt(occurrence.end);
                if (!range.contains(position)) { return []; }
                const hint = new vscode.InlayHint(position, `[IP ${occurrence.instructionPointer}]`, vscode.InlayHintKind.Parameter);
                hint.paddingLeft = true;
                return [hint];
            });
        },
    });
    const command = vscode.commands.registerCommand('lightvm.showInstructionPointers', () => {
        enabled = !enabled;
        changed.fire();
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.languageId === 'lightvm') {
                void vscode.commands.executeCommand('editor.action.inlayHints.refresh', editor.document.uri);
            }
        }
    });
    context.subscriptions.push(completionProvider, changed, inlayProvider, command);
}

export function deactivate(): void {}
