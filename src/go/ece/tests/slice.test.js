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
    return (new ECE(heapSize, parsed_program)).evaluate(!isRecursive).output;
}

describe("Slice", () => {
    it("can be created", () => {
        const functions = `
        func main() {
            var s []int32
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("0 0 []\n");
    })

    it("can be created with make (1 argument)", () => {
        const functions = `
        func main() {
            s := make([]int32, 3)
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("3 3 [0 0 0]\n");
    })

    it("can be created with make (2 arguments)", () => {
        const functions = `
        func main() {
            s := make([]int32, 3, 5)
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("3 5 [0 0 0]\n");
    })

    it("can be created with constructor", () => {
        const functions = `
        func main() {
            s := []int32{1, 2, 3}
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("3 3 [1 2 3]\n");
    })

    it("can be created with constructor (empty)", () => {
        const functions = `
        func main() {
            s := []int32{}
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("0 0 []\n");
    })

    it("can be sliced from an array", () => {
        const functions = `
        func main() {
            a := [5]int32{1, 2, 3, 4, 5}
            s := a[1:3]
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("2 4 [2 3]\n");
    })

    it("can be sliced from a slice", () => {
        const functions = `
        func main() {
            s1 := []int32{1, 2, 3, 4, 5}
            s2 := s1[1:3]
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("2 4 [2 3]\n");
    })

    it("can be sliced from a slice (full slice)", () => {
        const functions = `
        func main() {
            s1 := []int32{1, 2, 3, 4, 5}
            s2 := s1[:]
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("5 5 [1 2 3 4 5]\n");
    })

    it("can be sliced from a slice (full slice with cap)", () => {
        const functions = `
        func main() {
            s1 := []int32{1, 2, 3, 4, 5}
            s2 := s1[:3]
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("3 5 [1 2 3]\n");
    })

    it("can be sliced from a slice (full slice with offset)", () => {
        const functions = `
        func main() {
            s1 := []int32{1, 2, 3, 4, 5}
            s2 := s1[3:]
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("2 2 [4 5]\n");
    })

    it("supports append when there is enough capacity", () => {
        const functions = `
        func main() {
            s := make([]int32, 3, 5)
            s = append(s, 4)
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("4 5 [0 0 0 4]\n");
    })

    it("supports append when there is not enough capacity", () => {
        const functions = `
        func main() {
            s := make([]int32, 3, 3)
            s = append(s, 4)
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("4 6 [0 0 0 4]\n");
    })

    it("supports append when the slice is empty", () => {
        const functions = `
        func main() {
            s := []int32{}
            s = append(s, 4)
            fmt.Println(len(s), cap(s), s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("1 1 [4]\n");
    })

    it("reference remains the same after append with enough capacity", () => {
        const functions = `
        func main() {
            s := make([]int32, 3, 5)
            s2 := s
            s = append(s, 4)
            s[0] = 5
            fmt.Println(len(s), cap(s), s)
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("4 5 [5 0 0 4]\n3 5 [5 0 0]\n");
    })

    it("reference changes after append without enough capacity", () => {
        const functions = `
        func main() {
            s := make([]int32, 3, 3)
            s2 := s
            s = append(s, 4)
            s[0] = 5
            fmt.Println(len(s), cap(s), s)
            fmt.Println(len(s2), cap(s2), s2)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("4 6 [5 0 0 4]\n3 3 [0 0 0]\n");
    })

    it("support slicing on left side of assignment (array slice)", () => {
        const functions = `
        func main() {
            a := [5]int32{1, 2, 3, 4, 5}
            a[1:3][0] = 6
            fmt.Println(a)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("[1 6 3 4 5]\n");
    })

    it("support slicing on left side of assignment (slice slice)", () => {
        const functions = `
        func main() {
            s := []int32{1, 2, 3, 4, 5}
            s[1:3][0] = 6
            fmt.Println(s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("[1 6 3 4 5]\n");
    })

    it("support slicing on left side of assignment (slice slice with cap)", () => {
        const functions = `
        func main() {
            s := []int32{1, 2, 3, 4, 5}
            s[:3][0] = 6
            fmt.Println(s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("[6 2 3 4 5]\n");
    })

    it("support slicing on left side of assignment (slice slice with offset)", () => {
        const functions = `
        func main() {
            s := []int32{1, 2, 3, 4, 5}
            s[3:][0] = 6
            fmt.Println(s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("[1 2 3 6 5]\n");
    })

    it("support slicing on left side of assignment (full slice of slice)", () => {
        const functions = `
        func main() {
            s := []int32{1, 2, 3, 4, 5}
            s[:][0] = 6
            fmt.Println(s)
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("[6 2 3 4 5]\n");
    })
})