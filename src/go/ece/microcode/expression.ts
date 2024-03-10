import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';

function evaluate_literal(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    const address = heap.allocate_number(cmd.value);
    S.push(address);
    return E;
}

function unary_operator(operator: string, operand: any): any {
    switch (operator) {
        case '!':
            return operand === false ? true : false;
        case '+':
            return operand;
        case '-':
            return -operand;
        default:
            throw new Error(`Unknown unary operator: ${operator}`);
    }
}

function evaluate_unary(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    C.push({ tag: "unary_i", operator: cmd.operator });
    C.push(cmd.operand);
}

function evaluate_unary_i(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    const operand = S.pop();
    const result = unary_operator(cmd.operator, operand);
    const address = heap.allocate_number(result);
    S.push(address);
    return E;
}

function binary_operator(operator: string, left: any, right: any): any {
    switch (operator) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            return left / right;
        case '%':
            return left % right;
        case '<=':
            return left <= right;
        case '<':
            return left < right;
        case '>=':
            return left >= right;
        case '>':
            return left > right;
        case '==':
            return left === right;
        case '!=':
            return left !== right;
        case '&&':
            return left && right;
        case '||':
            return left || right;
        default:
            throw new Error(`Unknown binary operator: ${operator}`);
    }
}

function evaluate_binary(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    C.push({ tag: "binary_i", operator: cmd.operator });
    C.push(cmd.leftOperand);
    C.push(cmd.rightOperand);
}

function evaluate_binary_i(cmd: any, heap: Heap, C: Control, S: Stash, E: Env) {
    const left = S.pop();
    const right = S.pop();
    const result = binary_operator(cmd.operator, left, right);
    const address = heap.allocate_number(result);
    S.push(address);
    return E;
}

export {
    evaluate_literal,
    evaluate_unary,
    evaluate_unary_i,
    evaluate_binary,
    evaluate_binary_i,
};
