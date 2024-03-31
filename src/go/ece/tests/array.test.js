import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateSequence(sequence, checkAllFree = true) {
    const program = `
    package main
    
    import "fmt"
    
    func main() {
        ${sequence}
    }
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(checkAllFree);
}

function evaluateProgram(program, checkAllFree = true) {
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(checkAllFree);
}

describe("Fixed size array", () => {
    it('declare and initialize fixed size array', () => {
        const program = `
        var a [5]int32
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[0 0 0 0 0]\n");
    })

    it('change value of fixed size array', () => {
        const program = `
        var a [5]int32
        a[0] = 1
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[1 0 0 0 0]\n");
    })

    it('access fixed size array', () => {
        const program = `
        var a [5]int32
        a[0] = 1
        fmt.Println(a[0])
        `
        expect(evaluateSequence(program)).toBe("1\n");
    })

    it('access fixed size array out of bounds', () => {
        const program = `
        var a [5]int32
        a[5] = 1
        fmt.Println(a[5])
        `
        expect(() => evaluateSequence(program)).toThrow();
    })

    it('can compute fibonacci sequence', () => {
        const program = `
        var a [10]int32
        a[0] = 0
        a[1] = 1
        for i := 2; i < 10; i++ {
            a[i] = a[i-1] + a[i-2]
        }
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[0 1 1 2 3 5 8 13 21 34]\n");
    })

    it('can have multi-dimensional array', () => {
        const program = `
        var a [2][2]int32
        a[0][0] = 1
        a[0][1] = 2
        a[1][0] = 3
        a[1][1] = 4
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[[1 2] [3 4]]\n");
    })

    it('can compute pascal triangle', () => {
        const program = `
        var a [5][5]int32
        for i := 0; i < 5; i++ {
            a[i][0] = 1
            a[i][i] = 1
        }
        for i := 2; i < 5; i++ {
            for j := 1; j < i; j++ {
                a[i][j] = a[i-1][j-1] + a[i-1][j]
            }
        }
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[[1 0 0 0 0] [1 1 0 0 0] [1 2 1 0 0] [1 3 3 1 0] [1 4 6 4 1]]\n");
    })

    it('can construct one-dimensional array with constructor', () => {
        const program = `
        a := [5]int32{1, 2, 3, 4, 5}
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[1 2 3 4 5]\n");
    })

    it('can construct multi-dimensional array with constructor', () => {
        const program = `
        a := [2][2]int32{{1, 2}, {3, 4}}
        fmt.Println(a)
        `
        expect(evaluateSequence(program)).toBe("[[1 2] [3 4]]\n");
    })

    it('can pass array as function argument', () => {
        const program = `
        package main

        import "fmt"

        func printArray(a [5]int32) {
            fmt.Println(a)
        }

        func main() {
            a := [5]int32{1, 2, 3, 4, 5}
            printArray(a)
        }
        `
        expect(evaluateProgram(program)).toBe("[1 2 3 4 5]\n");
    })

    it('can return array from function', () => {
        const program = `
        package main

        import "fmt"

        func returnArray() [5]int32 {
            return [5]int32{1, 2, 3, 4, 5}
        }

        func main() {
            a := returnArray()
            fmt.Println(a)
        }
        `
        expect(evaluateProgram(program)).toBe("[1 2 3 4 5]\n");
    })
})