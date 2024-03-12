import { parse } from '../parser/go';
import { scan_global_declarations } from "./globalScan";

describe('scan_global_declarations', () => {
    it('should perform topological sort on global declarations', () => {
        const program = parse(`
            package main

            var w = z + 1;
            var x = 1;
            var y = x + 1;
            var d = c + 1;
            var b = a + 1;
            var z = y + 1;
            var a = w + 1;
            var g = f + 1;
            var f = e + 1;
            var c = b + 1;
            var e = d + 1;
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['x', 'y', 'z', 'w', 'a', 'b', 'c', 'd', 'e', 'f', 'g']);
    })

    it('should throw an error when cyclic dependency is detected', () => {
        const program = parse(`
            package main

            var a = b + 1;
            var b = a + 1;
        `);
        expect(() => scan_global_declarations(program)).toThrowError('cyclic dependency in global declarations');
    })

    it('should throw an error is self-referencing is detected', () => {
        const program = parse(`
            package main

            var a = a + 1;
        `);
        expect(() => scan_global_declarations(program)).toThrowError('cyclic dependency in global declarations');
    })

    it('should handle global function declarations', () => {
        const program = parse(`
            package main

            func main() {
                println("Hello, World!");
            }
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['main']);
    })

    it('should handle function dependencies', () => {
        const program = parse(`
            package main

            var x = f() + 1;
            var y = x + 1;

            func f() int32 {
                return 1;
            }
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['f', 'x', 'y']);
    })

    it('should ignore recursive function dependencies', () => {
        const program = parse(`
            package main

            var x = f() + 1;
            var y = x + 1;

            func f() int32 {
                return f();
            }
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['f', 'x', 'y']);
    })

    it('should scan expressions in function calls', () => {
        const program = parse(`
            package main

            var x = f(1) + 1;
            var y = x + 1;

            func f(a int32) int32 {
                return a;
            }
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['f', 'x', 'y']);
    })

    it('should scan expressions in function calls and its arguments', () => {
        const program = parse(`
            package main

            var x = f(1 + y, 2) + 1;
            var y = f(1, 2) + 1;

            func f(a int32, b int32) int32 {
                return a + b;
            }
        `);
        const refs = scan_global_declarations(program);
        expect(refs).toEqual(['f', 'y', 'x']);
    })
})
