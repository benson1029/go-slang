import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateSequence(sequence) {
    const program = `
    package main
    
    import "fmt"
    
    func main() {
        ${sequence}
    }
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(true);
}

describe("Fixed size array", () => {
    it('declare and initialize fixed size array', () => {
        const program = `
        var a [5]int32
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[0 0 0 0 0]\n");
    })

    it('change value of fixed size array', () => {
        const program = `
        var a [5]int32
        a[0] = 1
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[1 0 0 0 0]\n");
    })

    it('access fixed size array', () => {
        const program = `
        var a [5]int32
        a[0] = 1
        fmt.Println(a[0])
        `
        expect(evaluateSequence(program)).toBe("1\n");
    })

    it('access fixed size array out of bounds', () => {
        const program = `
        var a [5]int32
        a[5] = 1
        fmt.Println(a[5])
        `
        expect(() => evaluateSequence(program)).toThrow();
    })

    it('can compute fibonacci sequence', () => {
        const program = `
        var a [10]int32
        a[0] = 0
        a[1] = 1
        for i := 2; i < 10; i++ {
            a[i] = a[i-1] + a[i-2]
        }
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[0 1 1 2 3 5 8 13 21 34]\n");
    })
})