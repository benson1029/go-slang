import { parse } from '../../parser/go';
import { sort_global_declarations } from "./globalSort";
import { preprocess_program } from './preprocess';

function check_declaration_order(program: any, expected_order: string[]) {
    preprocess_program(program, []);
    sort_global_declarations(program, [], true);
    const decl_order = program.body.map((stmt: any) => stmt.name);
    expect(decl_order).toEqual(expected_order);
}

function check_cyclic_dependency(program: any) {
    preprocess_program(program, []);
    expect(() => sort_global_declarations(program, [], true)).toThrow();
}

function check_declaration_order_two_stage(program: any, expected_order: string[]) {
    preprocess_program(program, []);
    sort_global_declarations(program, [], true);
    preprocess_program(program, [], true);
    sort_global_declarations(program, [], false);

    const decl_order = program.body.map((stmt: any) => {
        if (stmt.tag === "struct") {
            return stmt.name.name;
        } else {
            return stmt.name;
        }
    });
    expect(decl_order).toEqual(expected_order);
}

function check_cyclic_dependency_two_stage(program: any) {
    expect(() => {
        preprocess_program(program, []);
        sort_global_declarations(program, [], true);
        preprocess_program(program, [], true);
        sort_global_declarations(program, [], false);
    }).toThrow();
}

describe('sort_global_declarations (first stage)', () => {
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
        check_declaration_order(program, ['x', 'y', 'z', 'w', 'a', 'b', 'c', 'd', 'e', 'f', 'g']);
    })

    it('should throw an error when cyclic dependency is detected', () => {
        const program = parse(`
            package main

            var a = b + 1;
            var b = a + 1;
        `);
        check_cyclic_dependency(program);
    })

    it('should throw an error is self-referencing is detected', () => {
        const program = parse(`
            package main

            var a = a + 1;
        `);
        check_cyclic_dependency(program);
    })

    it('should handle global function declarations', () => {
        const program = parse(`
            package main

            func main() {
                return;
            }
        `);
        check_declaration_order(program, ['main']);
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
        check_declaration_order(program, ['f', 'x', 'y']);
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
        check_declaration_order(program, ['f', 'x', 'y']);
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
        check_declaration_order(program, ['f', 'x', 'y']);
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
        check_declaration_order(program, ['f', 'y', 'x']);
    })

    it('should ignore recursion in function calls', () => {
        const program = parse(`
            package main

            var x = f(1) + 1;
            var y = x + 1;

            func f(a int32) int32 {
                return f(a);
            }
        `);
        check_declaration_order(program, ['f', 'x', 'y']);
    })

    it('should ignore two functions calling each other', () => {
        const program = parse(`
            package main

            var x = f(1) + 1;
            var y = x + 1;

            func f(a int32) int32 {
                return g(a);
            }

            func g(a int32) int32 {
                return f(a);
            }
        `);
        check_declaration_order(program, ['f', 'g', 'x', 'y']);
    })

    it('should include function calls in detecting cyclic dependencies', () => {
        const program = parse(`
            package main

            func f(a int32) int32 {
                if a == 0 {
                    return 5
                } else {
                    return g(a)
                }
            }

            func g(a int32) int32 {
                return f(a) + y
            }

            var y = f(1) + 1;
        `);
        check_cyclic_dependency(program);
    })
})

describe('sort global declarations (two-stage)', () => {
    it('should place struct declarations at the beginning', () => {
        const program = parse(`
            package main

            func main() {

            }

            type S struct {
                x int32
            }
        `);
        check_declaration_order_two_stage(program, ['S', 'main']);
    })

    it('should place struct method before it is used', () => {
        const program = parse(`
            package main

            func main() {
                var s S
                s.f()
            }

            type S struct {
                x int32
            }

            func (s S) f() {
                return
            }
        `);
        check_declaration_order_two_stage(program, ['S', 'f', 'main']);
    })

    it('should handle dependencies between structs', () => {
        const program = parse(`
            package main

            func main() {
                var t T
                t.f()
            }

            type T struct {
                s S
            }

            type S struct {
                x int32
            }

            func (t T) f() {
                return
            }
        `);
        check_declaration_order_two_stage(program, ['S', 'T', 'f', 'main']);
    })

    it('should handle cyclic dependencies between structs', () => {
        const program = parse(`
            package main

            func main() {
                var t T
                t.f()
            }

            type T struct {
                s S
            }

            type S struct {
                t T
            }

            func (t T) f() {
                return
            }
        `);
        check_cyclic_dependency_two_stage(program);
    })

    it('should handle cyclic dependencies involving a global variable', () => {
        const program = parse(`
            package main

            func returnAPair() Pair {
                var p Pair
                return p
            }

            type Pair struct {
                x int32
                y int32
            }

            func (p Pair) f() int32 {
                return p.x + a
            }

            var a = returnAPair().f()

            func main() {
                return
            }
        `);
        check_cyclic_dependency_two_stage(program);
    })
})