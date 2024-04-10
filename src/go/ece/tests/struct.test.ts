import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateFunctions(functions) {
    const program = `
    package main
    
    import "fmt"
    
    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(true).output;
}

describe("Structs", () => {
    it('can create a struct', () => {
        const functions = `
        type S struct {
            x int32
        }

        func main() {
            var s S
            s.x = 1
            fmt.Println(s.x)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('can create a struct with array fields', () => {
        const functions = `
        type S struct {
            x [2]int32
        }

        func main() {
            var s S
            s.x[0] = 1
            s.x[1] = 2
            fmt.Println(s.x[0])
            fmt.Println(s.x[1])
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n2\n");
    })

    it('can create a struct with a struct field', () => {
        const functions = `
        type S struct {
            x int32
        }

        type T struct {
            s S
        }

        func main() {
            var t T
            t.s.x = 1
            fmt.Println(t.s.x)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('can create a struct with an array of struct field', () => {
        const functions = `
        type S struct {
            x int32
        }

        type T struct {
            s [2]S
        }

        func main() {
            var t T
            t.s[0].x = 1
            t.s[1].x = 2
            fmt.Println(t.s[0].x)
            fmt.Println(t.s[1].x)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n2\n");
    })

    it('can support struct with methods', () => {
        const functions = `
        type S struct {
            x int32
        }

        func (s S) f() {
            fmt.Println(s.x)
        }

        func main() {
            var s S
            s.x = 1
            s.f()
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('can support struct with methods with parameters', () => {
        const functions = `
        type S struct {
            x int32
        }

        func (s S) f(a int32) {
            fmt.Println(s.x + a)
        }

        func main() {
            var s S
            s.x = 1
            s.f(2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("3\n");
    })

    it('can support struct with methods with return values', () => {
        const functions = `
        type S struct {
            x int32
        }

        func (s S) f() int32 {
            return s.x
        }

        func main() {
            var s S
            s.x = 1
            fmt.Println(s.f())
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n");
    })

    it('can support struct with methods that modify the struct', () => {
        const functions = `
        type S struct {
            x int32
        }

        func (s S) f() {
            s.x = 2
        }

        func main() {
            var s S
            s.x = 1
            s.f()
            fmt.Println(s.x)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("2\n");
    })

    it("supports constructor", () => {
        const functions = `
        type S struct {
            x int32
            y float32
        }

        func main() {
            var s = S{1, 2.5}
            fmt.Println(s.x)
            fmt.Println(s.y)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n2.5\n");
    })

    it("supports nested constructor", () => {
        const functions = `
        type S struct {
            x int32
            y float32
        }

        type T struct {
            s S
        }

        func main() {
            var t = T{S{1, 2.5}}
            fmt.Println(t.s.x)
            fmt.Println(t.s.y)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1\n2.5\n");
    })
})