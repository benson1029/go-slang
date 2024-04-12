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
    const heapSize = 32768;
    const return_value = (new ECE(heapSize, parsed_program)).evaluate(true).output;
    const check_mark_and_sweep = (new ECE(heapSize, parsed_program)).evaluate(true, true).output;
    expect(return_value).toBe(check_mark_and_sweep);
    return return_value;
}

describe("Support boolean types", () => {
    it('can create a boolean', () => {
        const sequence = `
        var b bool
        b = true
        fmt.Println(b)
        `
        const result = evaluateSequence(sequence);
        expect(result).toBe("true\n");
    })

    it('can perform boolean operations', () => {
        const sequence = `
        var b bool
        b = true
        fmt.Println(!b)
        c := b && true
        fmt.Println(c)
        d := b || false
        fmt.Println(d)
        `
        const result = evaluateSequence(sequence);
        expect(result).toBe("false\ntrue\ntrue\n");
    })
})

describe("Support string types", () => {
    it('can create a string', () => {
        const sequence = `
        var s string
        s = "hello"
        fmt.Println(s)
        `
        const result = evaluateSequence(sequence);
        expect(result).toBe("hello\n");
    })

    it('can perform string operations', () => {
        const sequence = `
        var s string
        s = "hello"
        fmt.Println(s + " world")
        t := s + " world"
        fmt.Println(t)
        `
        const result = evaluateSequence(sequence);
        expect(result).toBe("hello world\nhello world\n");
    })
})