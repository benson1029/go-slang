import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateFunctions(functions, isRecursive = false) {
    const program = `
    package main
    
    import (
        "fmt"
        "sync"
    )
    
    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(!isRecursive);
}

describe("WaitGroup", () => {
    it("can be used to wait for goroutines to finish", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(1)
            go func() {
                for i := 0; i < 1000; i++ {
                    // busy waiting
                }
                fmt.Println("Hello")
                wg.Done()
            }()
            wg.Wait()
            fmt.Println("World")
        }
        `
        const output = evaluateFunctions(functions);
        expect(output).toBe("Hello\nWorld\n");
    })

    it("can be used to wait for multiple goroutines to finish", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(2)
            go func() {
                for i := 0; i < 1000; i++ {
                    // busy waiting
                }
                fmt.Print("Hello, ")
                wg.Done()
            }()
            go func() {
                for i := 0; i < 1000; i++ {
                    // busy waiting
                }
                fmt.Print("World")
                wg.Done()
            }()
            wg.Wait()
            fmt.Println("!")
        }
        `
        const output = evaluateFunctions(functions);
        expect(output).toBe("Hello, World!\n");
    })

    it("blocks if Done() is never called", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(1)
            go func() {
                for i := 0; i < 1000; i++ {
                    // busy waiting
                }
                fmt.Println("Hello")
            }()
            wg.Wait()
            fmt.Println("World")
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })
})