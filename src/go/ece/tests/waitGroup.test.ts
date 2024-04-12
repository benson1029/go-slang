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
    const heapSize = 32768;
    const return_value = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive).output;
    const check_mark_and_sweep = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive, true).output;
    expect(return_value).toBe(check_mark_and_sweep);
    return return_value;
}

describe("WaitGroup", () => {
    it("can be used to wait for goroutines to finish", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(1)
            go func() {
                for i := 0; i < 100; i++ {
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
                for i := 0; i < 100; i++ {
                    // busy waiting
                }
                fmt.Print("Hello, ")
                wg.Done()
            }()
            go func() {
                for i := 0; i < 100; i++ {
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
                for i := 0; i < 100; i++ {
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

    it("throws if Done() is called more times than Add()", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(1)
            wg.Done()
            wg.Done()
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("throws if Add() is called with a negative number", () => {
        const functions = `
        func main() {
            var wg sync.WaitGroup
            wg.Add(-1)
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })
})