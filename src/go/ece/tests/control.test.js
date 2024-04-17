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

    it('loop variable can be updated in loop scope', () => {
        expect(evaluateSequence(`
        var f func() int32
        for i := 0; i < 10; i++ {
            f = func() int32 {
                return i
            }
            i++
            fmt.Println(i)
        }
        fmt.Println(f())
        `)).toBe("1\n3\n5\n7\n9\n9\n");
    })

    it('loop variable can be updated in loop scope (wt. continue)', () => {
        expect(evaluateSequence(`
        var f func() int32
        for i := 0; i < 10; i++ {
            f = func() int32 {
                return i
            }
            i++
            fmt.Println(i)
            continue
            fmt.Println("unreachable")
        }
        fmt.Println(f())
        `)).toBe("1\n3\n5\n7\n9\n9\n");
    })

    it("continue without a loop variable", () => {
        expect(evaluateSequence(`
        var i int32
        var f func() int32
        for i = 0; i < 10; i++ {
            if i == 0 {
                f = func() int32 {
                    return i
                }
            }
            i++
            continue
            fmt.Println("unreachable")
        }
        fmt.Println(f())
        `)).toBe("10\n")
    })
})
