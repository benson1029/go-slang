import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateFunctions(functions, isRecursive = false) {
    const program = `
    package main
    
    import "fmt"
    
    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 32768;
    const return_value = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive).output;
    const check_mark_and_sweep = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive, true).output;
    expect(return_value).toBe(check_mark_and_sweep);
    return return_value;
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
            for i := 0; i < 10; i++ {}
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
            for i := 0; i < 10; i++ {}
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
            for i := 0; i < 30; i++ {}
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
    
    it('main thread can terminate early', () => {
        const functions = `
        func f() func() int32 {
            fmt.Println("hi");
            return func () int32 {
                for i := 0; i < 10; i++ {}
                fmt.Println("inner");
                return 5;
            }
        }

        func main() {
            go f()()
            fmt.Println("bye")
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("hi\nbye\n");
    })
    
    it('should evaluate call argument before spawning goroutine', () => {
        const functions = `
        func f(x int32) int32 {
            return x
        }
        
        func g() int32 {
            for i := 0; i < 100; i++ {}
            fmt.Println("evaluating g")
            return 5
        }
        
        func main() {
            go f(g())
            fmt.Println("bye")
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("evaluating g\nbye\n");
    })

    it('should evaluate goroutine for struct method', () => {
        const functions = `
        type S struct {}
        
        func (s S) foo() {}
        
        func main() {
          go S{}.foo();
          for i := 0; i < 30; i++ {}
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })
})