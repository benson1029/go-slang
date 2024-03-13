import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateExpression(expression) {
    const program = `
    package main
    
    import "fmt"
    
    func main() {
        ${expression};
    }
    `
    const parsed_program = parse(program);
    const heapSize = 8196;
    return (new ECE(heapSize, parsed_program)).evaluate();
}

describe('Evaluating expressions', () => {
    it('should support + -', () => {
        expect(evaluateExpression('1 + 2')).toBe(3);
        expect(evaluateExpression('1 - 2')).toBe(-1);
    }),

    it('should support operator precedence', () => {
        expect(evaluateExpression('1 + 2 * 3')).toBe(7);
    }),

    it('should support parentheses', () => {
        expect(evaluateExpression('(1 + 2) * 3')).toBe(9);
    }),

    it('should support * / %', () => {
        expect(evaluateExpression('2 * 3')).toBe(6);
        expect(evaluateExpression('7 / 3')).toBe(2);
        expect(evaluateExpression('7 % 3')).toBe(1);
    }),

    it('should support unary operators', () => {
        expect(evaluateExpression('-3')).toBe(-3);
        expect(evaluateExpression('+3')).toBe(3);
    }),

    it('should support comparisons', () => {
        expect(evaluateExpression('1 < 2')).toBe(true);
        expect(evaluateExpression('1 > 2')).toBe(false);
        expect(evaluateExpression('1 <= 2')).toBe(true);
        expect(evaluateExpression('1 >= 2')).toBe(false);
        expect(evaluateExpression('1 == 2')).toBe(false);
        expect(evaluateExpression('1 != 2')).toBe(true);
    }),

    it('should support logical operators', () => {
        expect(evaluateExpression('true && false')).toBe(false);
        expect(evaluateExpression('true || false')).toBe(true);
        expect(evaluateExpression('!true')).toBe(false);
    }),

    it('should support floating point operations', () => {
        expect(evaluateExpression('1 / 2')).toBe(0);
        expect(evaluateExpression('1.0 / 2')).toBe(0.5);
        expect(evaluateExpression('1 / 2.0')).toBe(0.5);
        expect(evaluateExpression('1.0 / 2.0')).toBe(0.5);
    }),

    it('should support complex expressions', () => {
        expect(evaluateExpression('1 + 2 * 3 == 7 && 1 < 2')).toBe(true);
        expect(evaluateExpression('1 + 2 * 3 != 9 || 1 > 2 && 3 - 5 < -8')).toBe(true);
    })
})
