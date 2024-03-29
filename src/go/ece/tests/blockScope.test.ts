import { parse } from '../../parser/go';
import { ECE } from '../ece';

function checkSequence(sequence: string, hasError: boolean = false): void {
    const program = `
    package main
    
    import "fmt"
    
    func main() {
        ${sequence};
    }
    `
    const parsed_program = parse(program);
    const heapSize = 8196;

    if (hasError) {
        expect(() => (new ECE(heapSize, parsed_program)).evaluate(true)).toThrow();
    } else {
        const result = (new ECE(heapSize, parsed_program)).evaluate(true);
        expect(result).toBe("");
    }
}

describe("Block scope", () => {
    test(
        "Can start a block",
        () => {
            const sequence = `
            {}
            `
            checkSequence(sequence);
        }
    )

    test(
        "Can start a block with a declaration",
        () => {
            const sequence = `
            {
                x := 0
            }
            `
            checkSequence(sequence);
        }
    )

    test(
        "Can start a block with two declarations",
        () => {
            const sequence = `
            {
                x := 0
                y := x
            }
            `
            checkSequence(sequence);
        }
    )

    test(
        "Cannot repeat a declaration in the same block",
        () => {
            const sequence = `
            {
                x := 0
                var x int32
            }
            `
            checkSequence(sequence, true);
        }
    )

    test(
        "Can start nested blocks with the same name",
        () => {
            const sequence = `
            {
                x := 0
                {
                    x := 1
                }
            }
            `
            checkSequence(sequence);
        }
    )

    test(
        "Can reference variable from inner block",
        () => {
            const sequence = `
            {
                x := 0
                {
                    y := x
                }
            }
            `
            checkSequence(sequence);
        }
    )

    test(
        "Cannot reference variable from outer block",
        () => {
            const sequence = `
            {
                x := 0
                {
                    z := y
                }
                y := z
            }
            `
            checkSequence(sequence, true);
        }
    )

    test(
        "Can reference variable from outer block after inner block",
        () => {
            const sequence = `
            {
                x := 0
                {
                    y := x
                }
                z := x
            }
            `
            checkSequence(sequence);
        }
    )
})