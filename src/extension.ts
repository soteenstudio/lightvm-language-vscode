import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension LightVM udah aktif!');

    // Daftar sugesti yang mau dimunculin
    const opcodes = ['PUSH', 'POP', 'LOAD', 'STORE', 'MOV', 'LEA'];
    const registers = ['eax', 'ebx', 'ecx', 'edx', 'esp', 'ebp', 'rsp', 'rbp'];

    // Daftarkan provider completion untuk bahasa 'lightvm'
    const provider = vscode.languages.registerCompletionItemProvider('lightvm', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            
            // Bikin list sugesti untuk Opcode
            const opcodeItems = opcodes.map(op => {
                const item = new vscode.CompletionItem(op, vscode.CompletionItemKind.Keyword);
                item.detail = 'LightVM Opcode';
                item.documentation = new vscode.MarkdownString(`Perintah dasar untuk **${op}**`);
                return item;
            });

            // Bikin list sugesti untuk Register
            const registerItems = registers.map(reg => {
                const item = new vscode.CompletionItem(reg, vscode.CompletionItemKind.Variable);
                item.detail = 'LightVM Register';
                return item;
            });

            // Gabungin semua sugesti
            return [...opcodeItems, ...registerItems];
        }
    }, '.'); // Optional: Karakter pemicu tambahan kalau dibutuhin

    context.subscriptions.push(provider);
}

export function deactivate() {}