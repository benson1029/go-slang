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
            for i := 0; i < 100; i++ {}
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
            for i := 0; i < 30; i++ {}
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

    it("tryLock should return false if the mutex is locked", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            fmt.Println(m.TryLock())
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("false\n");
    })

    it("tryLock should return true if the mutex is unlocked", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            fmt.Println(m.TryLock())
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("true\n");
    })

    it("tryLock should return true if the mutex is locked and then unlocked", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            m.Lock()
            m.Unlock()
            fmt.Println(m.TryLock())
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("true\n");
    })

    it("tryLock should enforce mutual exclusion", () => {
        const functions = `
        var m sync.Mutex

        func main() {
            cnt := 0
            go func() {
                for i := 0; i < 50; i++ {
                    for ; !m.TryLock(); {}
                    cnt++
                    m.Unlock()
                }
            }()
            go func() {
                for i := 0; i < 50; i++ {
                    for ; !m.TryLock(); {}
                    cnt++
                    m.Unlock()
                }
            }()
            for i := 0; i < 500; i++ {
                // busy waiting
            }
            fmt.Println(cnt)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("100\n");
    })
})