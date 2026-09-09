export const LIGHTVM_OPCODES = [
    'val', 'set', 'push', 'get', 'dup', 'swap', 'shrink', 'truncate',
    'add', 'sub', 'mul', 'div', 'mod', 'neg', 'inc', 'dec',
    'gt', 'lt', 'ge', 'le', 'eq', 'neq', 'shl', 'shr', 'rol', 'ror',
    'and', 'or', 'xor', 'not', 'pow', 'powi', 'powf', 'sin', 'cos', 'tan',
    'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'atan2', 'asinh',
    'acosh', 'atanh', 'sqrt', 'cbrt', 'ln', 'log2', 'log10', 'exp',
    'print', 'println', 'stdin', 'stdout', 'stdoutln', 'clear_screen', 'break', 'nop',
    'jump', 'if_false', 'func', 'call', 'return', 'stop',
    'make_obj', 'make_array', 'access', 'access_index', 'length', 'typeof',
    'concat', 'import', 'export', 'set_prop', 'instantiate', 'inspect_obj',
    'inspect_array', 'to_short', 'to_integer', 'to_long', 'to_octa',
    'to_half', 'to_float', 'to_double', 'to_string',
] as const;

export const LIGHTVM_PRIMITIVE_TYPES = [
    'sht', 'int', 'lng', 'oct', 'hlf', 'flt', 'dbl', 'str',
    'i16', 'i32', 'i64', 'i128', 'f16', 'f32', 'f64',
] as const;

export type LightVMOpcode = typeof LIGHTVM_OPCODES[number];
export type LightVMPrimitiveType = typeof LIGHTVM_PRIMITIVE_TYPES[number];
const opcodeSet = new Set<string>(LIGHTVM_OPCODES);
const primitiveTypeSet = new Set<string>(LIGHTVM_PRIMITIVE_TYPES);

export function isLightVMOpcode(token: string): token is LightVMOpcode { return opcodeSet.has(token); }
export function isLightVMPrimitiveType(token: string): token is LightVMPrimitiveType { return primitiveTypeSet.has(token); }

export function isInsideCommentOrString(line: string, character: number): boolean {
    let quote: '"' | "'" | undefined;
    let escaped = false;
    for (let index = 0; index < Math.min(character, line.length); index += 1) {
        const current = line[index];
        if (quote) {
            if (escaped) { escaped = false; }
            else if (current === '\\') { escaped = true; }
            else if (current === quote) { quote = undefined; }
        } else if (current === '"' || current === "'") { quote = current; }
        else if (current === ';' && line[index + 1] === ';') { return true; }
    }
    return quote !== undefined;
}

export interface OpcodeOccurrence {
    opcode: LightVMOpcode;
    start: number;
    end: number;
    instructionPointer: number;
}

export function findOpcodeOccurrences(text: string): OpcodeOccurrence[] {
    const occurrences: OpcodeOccurrence[] = [];
    const tokenPattern = /[A-Za-z_][A-Za-z0-9_]*/y;
    let quote: '"' | "'" | undefined;
    let escaped = false;
    let inComment = false;
    let instructionPointer = 0;
    for (let index = 0; index < text.length;) {
        const current = text[index];
        if (inComment) {
            if (current === '\n' || current === '\r') { inComment = false; }
            index += 1; continue;
        }
        if (quote) {
            if (escaped) { escaped = false; }
            else if (current === '\\') { escaped = true; }
            else if (current === quote) { quote = undefined; }
            index += 1; continue;
        }
        if (current === ';' && text[index + 1] === ';') { inComment = true; index += 2; continue; }
        if (current === '"' || current === "'") { quote = current; index += 1; continue; }
        tokenPattern.lastIndex = index;
        const match = tokenPattern.exec(text);
        if (match) {
            if (isLightVMOpcode(match[0])) {
                occurrences.push({ opcode: match[0], start: index, end: tokenPattern.lastIndex, instructionPointer });
                instructionPointer += 1;
            }
            index = tokenPattern.lastIndex;
        } else { index += 1; }
    }
    return occurrences;
}
