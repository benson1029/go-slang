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

describe('Channel', () => {
    it("can send and receive a message in an unbuffered channel", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            go func() {
                ch <- 42
            }()
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("sending a message blocks until the message is received", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            go func() {
                ch <- 42
                fmt.Println("sent")
            }()
            for i := 0; i < 100; i++ {
                // busy waiting
            }
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\nsent\n");
    })

    it("receiving a message blocks until the message is sent", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            go func() {
                fmt.Println(<-ch)
            }()
            for i := 0; i < 100; i++ {
                // busy waiting
            }
            ch <- 42
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("deadlock when sending to an unbuffered channel without a receiver", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            ch <- 42
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("unbuffered channel with multiple senders and receivers", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            go func() {
                ch <- 42
            }()
            go func() {
                ch <- 43
            }()
            fmt.Println(<-ch)
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n43\n");
    })

    it("can send and receive a message in a buffered channel", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            ch <- 42
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("sending a message to a buffered channel does not block", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            ch <- 42
            fmt.Println("sent")
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("sent\n");
    })

    it("receiving a message from a buffered channel does not block", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            ch <- 42
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("deadlock when sending to a full buffered channel", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            ch <- 42
            ch <- 43
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("deadlock when receiving from an empty buffered channel", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            fmt.Println(<-ch)
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })

    it("buffered channel with multiple senders and receivers", () => {
        const functions = `
        func main() {
            ch := make(chan int32, 1)
            go func() {
                ch <- 42
            }()
            go func() {
                ch <- 43
            }()
            fmt.Println(<-ch)
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n43\n");
    })

    it("can pass a channel as an argument", () => {
        const functions = `
        func f(ch chan int32) {
            ch <- 42
        }

        func main() {
            ch := make(chan int32)
            go f(ch)
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("can return a channel from a function", () => {
        const functions = `
        func f() chan int32 {
            ch := make(chan int32, 1)
            ch <- 42
            return ch
        }

        func main() {
            ch := f()
            fmt.Println(<-ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("can include a channel in a struct", () => {
        const functions = `
        type S struct {
            ch chan int32
        }

        func main() {
            var s S
            s.ch = make(chan int32, 1)
            s.ch <- 42
            fmt.Println(<-s.ch)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("42\n");
    })

    it("can evaluate channel receive statements", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            go func() {
                ch <- 42
            }()
            <-ch
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("");
    })

    it("can evaluate channel receive statements (blocked)", () => {
        const functions = `
        func main() {
            ch := make(chan int32)
            <-ch
        }
        `
        expect(() => evaluateFunctions(functions)).toThrow();
    })
})