import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlUnary } from '../../heap/types/control/unary';
import { ControlUnaryI } from '../../heap/types/control/unary_i';
import { auto_cast } from '../../heap/types/auto_cast';
import { Primitive } from '../../heap/types/primitive';
import {
    TAGSTRING_PRIMITIVE_bool,
    TAGSTRING_PRIMITIVE_int32,
    TAGSTRING_PRIMITIVE_float32,
    TAG_COMPLEX_string,
    TAGSTRING_COMPLEX_string,
} from "../../heap/types/tags";
import { ControlBinary } from '../../heap/types/control/binary';
import { ControlBinaryI } from '../../heap/types/control/binary_i';
import { ControlLogicalImmI } from '../../heap/types/control/logical_imm_i';
import { ControlLogicalI } from '../../heap/types/control/logical_i';
import { ComplexString } from '../../heap/types/complex/string';

function evaluate_literal(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = auto_cast(heap, cmd);
    S.push(cmd_object.address);
}

function apply_unary_operator(operator: string, operand: Primitive): any {
    switch (operator) {
        case '!':
            if (operand.get_type() !== "bool") {
                throw new Error(`Expected bool, but got ${operand.get_type()}`);
            }
            return {
                tag: TAGSTRING_PRIMITIVE_bool,
                value: !operand.get_value(),
            };
        case '+':
            if (operand.get_type() === "int32") {
                return {
                    tag: TAGSTRING_PRIMITIVE_int32,
                    value: +operand.get_value(),
                };
            }
            if (operand.get_type() === "float32") {
                return {
                    tag: TAGSTRING_PRIMITIVE_float32,
                    value: +operand.get_value(),
                };
            }
            throw new Error(`Expected int32 or float32, but got ${operand.get_type()}`);
        case '-':
            if (operand.get_type() === "int32") {
                return {
                    tag: TAGSTRING_PRIMITIVE_int32,
                    value: -operand.get_value(),
                };
            }
            if (operand.get_type() === "float32") {
                return {
                    tag: TAGSTRING_PRIMITIVE_float32,
                    value: -operand.get_value(),
                };
            }
            throw new Error(`Expected int32 or float32, but got ${operand.get_type()}`);
        default:
            throw new Error(`Unknown unary operator: ${operator}`);
    }
}

function evaluate_unary(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlUnary(heap, cmd);
    const operator = cmd_object.get_operator_address();
    const operand = cmd_object.get_operand_address();
    const unary_i_addr = heap.allocate_any({ tag: "unary_i", operator: operator });
    C.push(unary_i_addr);
    heap.free_object(unary_i_addr);
    C.push(operand.address);
}

function evaluate_unary_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlUnaryI(heap, cmd);
    const operator = cmd_object.get_operator();
    const operand = auto_cast(heap, S.pop()) as unknown as Primitive;
    const result = apply_unary_operator(operator, operand);
    const address = heap.allocate_any(result);
    S.push(address);
    heap.free_object(address);
    operand.free();
}

function binary_operator(operator: string, left: Primitive, right: Primitive): any {
    switch (operator) {
        case '+':
            if (left.get_tag() === TAG_COMPLEX_string && right.get_tag() === TAG_COMPLEX_string) {
                return {
                    tag: TAGSTRING_COMPLEX_string,
                    value: (left as unknown as ComplexString).get_string() + (right as unknown as ComplexString).get_string(),
                };
            }
            // eslint-disable-next-line no-fallthrough
        case '-':
        case '*':
        case '/':
        case '%':
            if (left.get_type() !== "int32" && left.get_type() !== "float32") {
                throw new Error(`Expected int32 or float32, but got ${left.get_type()}`);
            }
            if (right.get_type() !== "int32" && right.get_type() !== "float32") {
                throw new Error(`Expected int32 or float32, but got ${right.get_type()}`);
            }
            if (operator === '/' && right.get_value() === 0) {
                throw new Error("Division by zero");
            }
            const value = operator === '+'
                          ? left.get_value() + right.get_value()
                          : operator === '-'
                          ? left.get_value() - right.get_value()
                          : operator === '*'
                          ? left.get_value() * right.get_value()
                          : operator === '/'
                          ? left.get_value() / right.get_value()
                          : operator === '%'
                          ? left.get_value() % right.get_value()
                          : undefined;
            if (left.get_type() === "int32" && right.get_type() === "int32") {
                return {
                    tag: TAGSTRING_PRIMITIVE_int32,
                    value: value,
                };
            }
            return {
                tag: TAGSTRING_PRIMITIVE_float32,
                value: value,
            };
        case '<=':
        case '<':
        case '>=':
        case '>':
            if (left.get_type() !== "int32" && left.get_type() !== "float32") {
                throw new Error(`Expected int32 or float32, but got ${left.get_type()}`);
            }
            if (right.get_type() !== "int32" && right.get_type() !== "float32") {
                throw new Error(`Expected int32 or float32, but got ${right.get_type()}`);
            }
            return {
                tag: TAGSTRING_PRIMITIVE_bool,
                value: operator === '<='
                       ? left.get_value() <= right.get_value()
                       : operator === '<'
                       ? left.get_value() < right.get_value()
                       : operator === '>='
                       ? left.get_value() >= right.get_value()
                       : operator === '>'
                       ? left.get_value() > right.get_value()
                       : undefined,
            };
        case '==':
        case '!=':
            return {
                tag: TAGSTRING_PRIMITIVE_bool,
                value: operator === '=='
                       ? left.get_value() === right.get_value()
                       : operator === '!='
                       ? left.get_value() !== right.get_value()
                       : undefined,
            };
        default:
            throw new Error(`Unknown binary operator: ${operator}`);
    }
}

function is_logical(operator: string): boolean {
    return operator === '&&' || operator === '||';
}

function logical_operator_left(operator: string, left: Primitive): any {
    if (left.get_type() !== "bool") {
        throw new Error(`Expected bool, but got ${left.get_type()}`);
    }
    if (operator === '&&' && left.get_value() === false) {
        return {
            tag: TAGSTRING_PRIMITIVE_bool,
            value: false,
        };
    }
    if (operator === '||' && left.get_value() === true) {
        return {
            tag: TAGSTRING_PRIMITIVE_bool,
            value: true,
        };
    }
    return null;
}

function logical_operator_right(operator: string, right: Primitive): any {
    if (right.get_type() !== "bool") {
        throw new Error(`Expected bool, but got ${right.get_type()}`);
    }
    return {
        tag: TAGSTRING_PRIMITIVE_bool,
        value: right.get_value(),
    };
}

function evaluate_binary(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlBinary(heap, cmd);
    const operator = cmd_object.get_operator_address();
    if (is_logical(operator.get_string())) {
        const left = cmd_object.get_left_operand_address();
        const right = cmd_object.get_right_operand_address();
        const logical_imm_i_addr = heap.allocate_any({ tag: "logical_imm_i", operator: operator.address, right: right.address });
        C.push(logical_imm_i_addr);
        heap.free_object(logical_imm_i_addr);
        C.push(left.address);
        return;
    }
    const left = cmd_object.get_left_operand_address();
    const right = cmd_object.get_right_operand_address();
    const binary_i_addr = heap.allocate_any({ tag: "binary_i", operator: operator });
    C.push(binary_i_addr);
    heap.free_object(binary_i_addr);
    C.push(left.address);
    C.push(right.address);
}

function evaluate_binary_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlBinaryI(heap, cmd);
    const operator = cmd_object.get_operator();
    const left = auto_cast(heap, S.pop()) as unknown as Primitive;
    const right = auto_cast(heap, S.pop()) as unknown as Primitive;
    const result = binary_operator(operator, left, right);
    const address = heap.allocate_any(result);
    S.push(address);
    heap.free_object(address);
    left.free();
    right.free();
}

function evaluate_logical_imm_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlLogicalImmI(heap, cmd);
    const operator = cmd_object.get_operator_address();
    const left = auto_cast(heap, S.pop()) as unknown as Primitive;
    const result = logical_operator_left(operator.get_string(), left);
    if (result != null) {
        const address = heap.allocate_any(result);
        S.push(address);
        heap.free_object(address);
    } else {
        const logical_i_cmd = heap.allocate_any({ tag: "logical_i", operator: operator.address });
        C.push(logical_i_cmd);
        heap.free_object(logical_i_cmd);
        const right = cmd_object.get_right_address();
        C.push(right.address);
    }
    left.free();
}

function evaluate_logical_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlLogicalI(heap, cmd);
    const operator = cmd_object.get_operator();
    const right = auto_cast(heap, S.pop()) as unknown as Primitive;
    const result = logical_operator_right(operator, right);
    const address = heap.allocate_any(result);
    S.push(address);
    heap.free_object(address);
    right.free();
}

export {
    evaluate_literal,
    evaluate_unary,
    evaluate_unary_i,
    evaluate_binary,
    evaluate_binary_i,
    evaluate_logical_imm_i,
    evaluate_logical_i,
};
