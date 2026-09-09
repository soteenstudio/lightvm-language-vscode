import * as assert from 'assert';
import { findOpcodeOccurrences, isInsideCommentOrString, isLightVMOpcode, isLightVMPrimitiveType, LIGHTVM_OPCODES } from '../language';

suite('LightVM token classification', () => {
    test('recognizes the complete opcode inventory', () => {
        assert.strictEqual(LIGHTVM_OPCODES.length, 87);
        assert.ok(isLightVMOpcode('add'));
        assert.ok(isLightVMOpcode('to_string'));
        assert.ok(!isLightVMOpcode('PUSH'));
        assert.ok(!isLightVMOpcode('address'));
    });

    test('recognizes canonical primitive types and aliases', () => {
        for (const type of ['sht', 'int', 'lng', 'oct', 'hlf', 'flt', 'dbl', 'str', 'i16', 'i32', 'i64', 'i128', 'f16', 'f32', 'f64']) {
            assert.ok(isLightVMPrimitiveType(type), type);
        }
        assert.ok(!isLightVMPrimitiveType('integer'));
    });

    test('honors keyword boundaries and ignores comments and strings', () => {
        const source = 'push push_value "add"\n;; sub\nprintln \'mul\\\' div\' get';
        assert.deepStrictEqual(findOpcodeOccurrences(source).map(({ opcode }) => opcode), ['push', 'println', 'get']);
    });

    test('detects completion positions inside comments and quoted strings', () => {
        assert.ok(isInsideCommentOrString('push ;; add', 11));
        assert.ok(isInsideCommentOrString('push "add here"', 10));
        assert.ok(!isInsideCommentOrString('push "add here" get', 19));
        assert.ok(isInsideCommentOrString("push 'escaped \\\' quote'", 18));
    });

    test('indexes instruction pointers from zero in document order', () => {
        const occurrences = findOpcodeOccurrences('push 1\nadd int\n;; sub\nreturn');
        assert.deepStrictEqual(occurrences.map(({ opcode, instructionPointer }) => [opcode, instructionPointer]), [
            ['push', 0], ['add', 1], ['return', 2],
        ]);
    });
});
