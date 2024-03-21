import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateExpression(expression) {
    const program = `
    package main
    
    import "fmt"
    
    func main() {
        fmt.Println(${expression});
    }
    `
    const parsed_program = parse(program);
    const heapSize = 8196;
    return (new ECE(heapSize, parsed_program)).evaluate();
}

describe('Evaluating expressions', () => {
    it('should support + -', () => {
        expect(evaluateExpression('1 + 2')).toBe("3\n");
        expect(evaluateExpression('1 - 2')).toBe("-1\n");
    }),

    it('should support operator precedence', () => {
        expect(evaluateExpression('1 + 2 * 3')).toBe("7\n");
    }),

    it('should support parentheses', () => {
        expect(evaluateExpression('(1 + 2) * 3')).toBe("9\n");
    }),

    it('should support * / %', () => {
        expect(evaluateExpression('2 * 3')).toBe("6\n");
        expect(evaluateExpression('7 / 3')).toBe("2\n");
        expect(evaluateExpression('7 % 3')).toBe("1\n");
    }),

    it('should support unary operators', () => {
        expect(evaluateExpression('-3')).toBe("-3\n");
        expect(evaluateExpression('+3')).toBe("3\n");
    }),

    it('should support comparisons', () => {
        expect(evaluateExpression('1 < 2')).toBe("true\n");
        expect(evaluateExpression('1 > 2')).toBe("false\n");
        expect(evaluateExpression('1 <= 2')).toBe("true\n");
        expect(evaluateExpression('1 >= 2')).toBe("false\n");
        expect(evaluateExpression('1 == 2')).toBe("false\n");
        expect(evaluateExpression('1 != 2')).toBe("true\n");
    }),

    it('should support logical operators', () => {
        expect(evaluateExpression('true && false')).toBe("false\n");
        expect(evaluateExpression('true || false')).toBe("true\n");
        expect(evaluateExpression('!true')).toBe("false\n");
    }),

    it('should support floating point operations', () => {
        expect(evaluateExpression('1 / 2')).toBe("0\n");
        expect(evaluateExpression('1.0 / 2')).toBe("0.5\n");
        expect(evaluateExpression('1 / 2.0')).toBe("0.5\n");
        expect(evaluateExpression('1.0 / 2.0')).toBe("0.5\n");
    }),

    it('should support complex expressions', () => {
        expect(evaluateExpression('1 + 2 * 3 == 7 && 1 < 2')).toBe("true\n");
        expect(evaluateExpression('1 + 2 * 3 != 9 || 1 > 2 && 3 - 5 < -8')).toBe("true\n");
    })
})
