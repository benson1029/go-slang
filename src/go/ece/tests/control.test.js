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
    return (new ECE(heapSize, parsed_program)).evaluate(true).output;
}

describe('Evaluating control structures', () => {
    it('should support if statements', () => {
        expect(evaluateSequence(`
        if true {
            fmt.Println("true")
        }
        `)).toBe("true\n");

        expect(evaluateSequence(`
        if false {
            fmt.Println("true")
        }
        `)).toBe("");

        expect(evaluateSequence(`
        if 1 < 2 {
            fmt.Println("true")
        }
        `)).toBe("true\n");

        expect(evaluateSequence(`
        if 1 > 2 {
            fmt.Println("true")
        }
        `)).toBe("");

        expect(evaluateSequence(`
        if 1 == 2 {
            fmt.Println("true")
        } else {
            fmt.Println("false")
        }
        `)).toBe("false\n");

        expect(evaluateSequence(`
        if 1 != 2 {
            fmt.Println("true")
        } else {
            fmt.Println("false")
        }
        `)).toBe("true\n");

        expect(evaluateSequence(`
        if (1 < 2) && (2 < 3) {
            fmt.Println("true")
        }
        `)).toBe("true\n");

        expect(evaluateSequence(`
        if (1 < 2) && (2 > 3) {
            fmt.Println("true")
        } else if (1 < 2) {
            fmt.Println("false")
        }
        `)).toBe("false\n");

        expect(evaluateSequence(`
        if (1 > 2) {
            fmt.Println("a")
        } else if (1 < 2) {
            fmt.Println("b")
        } else {
            fmt.Println("c")
        }
        `)).toBe("b\n");

        expect(evaluateSequence(`
        if (1 > 2) {
            fmt.Println("a")
        } else if (1 > 2) {
            fmt.Println("b")
        } else {
            fmt.Println("c")
        }
        `)).toBe("c\n");

        expect(evaluateSequence(`
        if (1 > 2) {
            fmt.Println("a")
        } else if (1 > 2) {
            fmt.Println("b")
        }
        `)).toBe("");

        expect(evaluateSequence(`
        if (1 < 2) {
            if (2 < 3) {
                fmt.Println("true")
            }
        }
        `)).toBe("true\n");

        expect(evaluateSequence(`
        if (1 < 2) {
            if (2 > 3) {
                fmt.Println("true")
            } else {
                fmt.Println("false")
            }
        }
        `)).toBe("false\n");
    }),

    it('should support for loops', () => {
        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            fmt.Println(i)
        }
        `)).toBe("0\n1\n2\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            if i == 1 {
                continue
            }
            fmt.Println(i)
        }
        `)).toBe("0\n2\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            if i == 1 {
                break
            }
            fmt.Println(i)
        }
        `)).toBe("0\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            if i == 1 {
                return
            }
            fmt.Println(i)
        }
        `)).toBe("0\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            if i == 1 {
                break
            }
            fmt.Println(i)
        }
        `)).toBe("0\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            if i == 1 {
                return
            }
            fmt.Println(i)
        }
        `)).toBe("0\n");

        expect(evaluateSequence(`
        i := 0
        for ; i < 3; i++ {
            fmt.Println(i)
        }
        `)).toBe("0\n1\n2\n");

        expect(evaluateSequence(`
        i := 0
        for ; i < 3; {
            fmt.Println(i)
            i++
        }
        `)).toBe("0\n1\n2\n");

        expect(evaluateSequence(`
        i := 0
        for ; true; {
            if i == 3 {
                break
            }
            fmt.Println(i)
            i++
        }
        `)).toBe("0\n1\n2\n");

        expect(evaluateSequence(`
        i := 0
        for ; true; {
            if i == 3 {
                break
            }
            fmt.Println(i)
            i++
        }
        `)).toBe("0\n1\n2\n");
    }),

    it('should support nested for loops', () => {
        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            for j := 0; j < 3; j++ {
                fmt.Println(i, j)
            }
        }
        `)).toBe("0 0\n0 1\n0 2\n1 0\n1 1\n1 2\n2 0\n2 1\n2 2\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            for j := 0; j < 3; j++ {
                if j == 1 {
                    break
                }
                fmt.Println(i, j)
            }
        }
        `)).toBe("0 0\n1 0\n2 0\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            for j := 0; j < 3; j++ {
                if j == 1 {
                    continue
                }
                fmt.Println(i, j)
            }
        }
        `)).toBe("0 0\n0 2\n1 0\n1 2\n2 0\n2 2\n");

        expect(evaluateSequence(`
        for i := 0; i < 3; i++ {
            for j := 0; j < 3; j++ {
                if j == 1 {
                    return
                }
                fmt.Println(i, j)
            }
        }
        `)).toBe("0 0\n");
    })

    it('lambda in for loop should capture global variables by reference', () => {
        expect(evaluateSequence(`
        var f func() int32
        var i int32
        for i = 0; i < 3; i++ {
            f = func() int32 {
                return i
            }
        }
        fmt.Println(f())
        `)).toBe("3\n");
    })

    // New patch in Go 1.22
    // See https://go.dev/blog/loopvar-preview
    it('lambda in for loop should capture loop variable in iteration scope', () => {
        expect(evaluateSequence(`
        var f func() int32
        for i := 0; i < 3; i++ {
            f = func() int32 {
                return i
            }
        }
        fmt.Println(f())
        `)).toBe("2\n");
    })
})
