import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateFunctions(functions, isRecursive = false) {
    const program = `
    package main
    
    import "fmt"
    
    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(!isRecursive).output;
}

describe("Goroutines", () => {
    it('can start a goroutine', () => {
        const functions = `
        func main() {
            go f()
        }
        
        func f() {
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it('can start a goroutine with an expression', () => {
        const functions = `
        func main() {
            go f(1)
        }
        
        func f(a int32) {
            fmt.Println(a)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('can start a goroutine with a variable', () => {
        const functions = `
        func main() {
            x := 1
            go f(x)
        }
        
        func f(a int32) {
            fmt.Println(a)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('go routines run concurrently', () => {
        // assuming fair scheduler using round-robin
        const functions = `
        func main() {
            go f(1)
            go f(2)
        }
        
        func f(a int32) {
            for i := 0; i < 5; i++ {
                fmt.Println(a)
            }
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n2\n1\n2\n1\n2\n1\n2\n1\n2\n");
    })
})