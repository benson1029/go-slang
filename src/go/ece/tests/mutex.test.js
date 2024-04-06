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

describe("Mutex", () => {
    it("should be able to lock and unlock a mutex", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            m.Unlock()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it("should be able to lock and unlock a mutex in a goroutine", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            go func() {
                m.Lock()
                m.Unlock()
            }()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it("should not be able to lock a mutex twice", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            m.Lock()
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("should not be able to unlock a mutex without locking it", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Unlock()
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("should not be able to unlock a mutex twice", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            m.Unlock()
            m.Unlock()
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("should be able to lock a mutex after unlocking it", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            m.Unlock()
            m.Lock()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it("should enforce mutual exclusion", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            go func() {
                m.Lock()
                for i := 0; i < 5; i++ {
                    fmt.Println(i)
                }
                m.Unlock()
            }()
            go func() {
                m.Lock()
                for i := 5; i < 10; i++ {
                    fmt.Println(i)
                }
                m.Unlock()
            }()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n");
        
        // without mutex

        const functions2 = `
        var m sync.Mutex

        func main() {
            go func() {
                m.Lock()
                for i := 0; i < 5; i++ {
                    fmt.Println(i)
                }
                m.Unlock()
            }()
            go func() {
                for i := 5; i < 10; i++ {
                    fmt.Println(i)
                }
            }()
        }
        `
        const result2 = evaluateFunctions(functions2);
        expect(result2).toBe("5\n0\n6\n1\n7\n2\n8\n3\n9\n4\n");
    })

    it("should be able to pass a mutex as a parameter", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            lock(m)
        }

        func lock(m sync.Mutex) {
            m.Lock()
            m.Unlock()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it("should be able to declare a mutex inside a struct", () => {
        const functions = `
        type S struct {
            m sync.Mutex
        }

        func main() {
            var s S
            s.m.Lock()
            s.m.Unlock()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })
})