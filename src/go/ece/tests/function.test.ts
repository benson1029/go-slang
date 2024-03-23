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
    return (new ECE(heapSize, parsed_program)).evaluate(true);
}

function evaluateFunctions(functions, isRecursive = false) {
    const program = `
    package main
    
    import "fmt"
    
    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 1048576;
    return (new ECE(heapSize, parsed_program)).evaluate(!isRecursive);
}

describe("Builtin function fmt.Println works", () => {
    test(
        "Can call fmt.Println",
        () => {
            const sequence = `
            fmt.Println("Hello, World!")
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("Hello, World!\n");
        }
    ),

    test(
        "Can call fmt.Println with multiple arguments",
        () => {
            const sequence = `
            fmt.Println("Hello,", "World!")
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("Hello, World!\n");
        }
    ),

    test(
        "Can call fmt.Println with a variable",
        () => {
            const sequence = `
            x := 6
            fmt.Println(x)
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("6\n");
        }
    )
})

describe("Can declare functions within main body", () => {
    test(
        "Can declare a function",
        () => {
            const sequence = `
            f := func () {}
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type",
        () => {
            const sequence = `
            f := func () int32 {}
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type and a body",
        () => {
            const sequence = `
            f := func () int32 { return 0 }
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type, a body and a call",
        () => {
            const sequence = `
            f := func () int32 { return 0 }
            fmt.Println(f())
            `
            const result = evaluateSequence(sequence);
            expect(result).toBe("0\n");
        }
    )
})

describe("Can declare functions outside main body", () => {
    test(
        "Can declare a function",
        () => {
            const functions = `
            func f() {}
            func main() {}
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type",
        () => {
            const functions = `
            func f() int32 {}
            func main() {}
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type and a body",
        () => {
            const functions = `
            func f() int32 { return 0 }
            func main() {}
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a return type, a body and a call",
        () => {
            const functions = `
            func f() int32 { return 0 }
            func main() {
                fmt.Println(f())
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("0\n");
        }
    )
})

describe("Can declare functions with parameters", () => {
    test(
        "Can declare a function with a parameter",
        () => {
            const functions = `
            func f(x int32) {}
            func main() {}
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with a parameter and a call",
        () => {
            const functions = `
            func f(x int32) {
                fmt.Println(x)
            }
            func main() {
                f(1234)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n");
        }
    ),

    test(
        "Can declare a function with multiple parameters",
        () => {
            const functions = `
            func f(x int32, y int32) {}
            func main() {}
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("");
        }
    ),

    test(
        "Can declare a function with multiple parameters and a call",
        () => {
            const functions = `
            func f(x int32, y int32) {
                fmt.Println(x)
                fmt.Println(y)
            }
            func main() {
                f(1234, 5678)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n5678\n");
        }
    )
})

describe("Functions can use variables from the environment", () => {
    test(
        "Can use a variable from the environment",
        () => {
            const functions = `
            x := 1234
            func f() {
                fmt.Println(x)
            }
            func main() {
                f()
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n");
        }
    ),

    test(
        "Can use a variable from the environment in a nested function",
        () => {
            const functions = `
            x := 1234
            func f() {
                fmt.Println(x)
            }
            func g() {
                f()
            }
            func main() {
                g()
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n");
        }
    ),

    test(
        "Can override a variable from the environment",
        () => {
            const functions = `
            x := 1234
            func f() {
                fmt.Println(x)
                x := 5678
                fmt.Println(x)
            }
            func main() {
                f()
                fmt.Println(x)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n5678\n1234\n");
        }
    ),

    test(
        "Can assign a variable from the environment",
        () => {
            const functions = `
            x := 1234
            func f() {
                fmt.Println(x)
                x = 5678
                fmt.Println(x)
            }
            func main() {
                f()
                fmt.Println(x)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n5678\n5678\n");
        }
    ),

    test(
        "Only declared variables at the time of function declaration are captured",
        () => {
            const functions = `
            x := 1234
            func f() func() {
                fmt.Println(x)
                g := func() {
                    fmt.Println(x)
                    x := 9012
                    fmt.Println(x)
                }
                x := 5678
                fmt.Println(x)
                return g
            }
            func main() {
                g := f()
                fmt.Println(x)
                g()
                fmt.Println(x)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n5678\n1234\n1234\n9012\n1234\n");
        }
    ),

    test(
        "Only declared variables at the innermost scope are captured",
        () => {
            const functions = `
            x := 1234
            func f() func() {
                fmt.Println(x)
                x := 5678
                g := func() {
                    fmt.Println(x)
                    x := 9012
                    fmt.Println(x)
                }
                fmt.Println(x)
                return g
            }
            func main() {
                g := f()
                fmt.Println(x)
                g()
                fmt.Println(x)
            }
            `
            const result = evaluateFunctions(functions);
            expect(result).toBe("1234\n5678\n1234\n5678\n9012\n1234\n");
        }
    )
})

describe("Functions can be recursive", () => {
    test(
        "Can compute factorial",
        () => {
            const functions = `
            func factorial(n int32) int32 {
                if n == 0 {
                    return 1
                }
                return n * factorial(n - 1)
            }
            func main() {
                fmt.Println(factorial(5))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("120\n");
        }
    ),

    test(
        "Can compute fibonacci",
        () => {
            const functions = `
            func fibonacci(n int32) int32 {
                if n == 0 {
                    return 0
                }
                if n == 1 {
                    return 1
                }
                return fibonacci(n - 1) + fibonacci(n - 2)
            }
            func main() {
                fmt.Println(fibonacci(10))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("55\n");
        }
    ),

    test(
        "Can have two recursive functions calling each other",
        () => {
            const functions = `
            func is_even(n int32) bool {
                if n == 0 {
                    return true
                }
                return is_odd(n - 1)
            }
            func is_odd(n int32) bool {
                if n == 0 {
                    return false
                }
                return is_even(n - 1)
            }
            func main() {
                fmt.Println(is_even(10))
                fmt.Println(is_odd(10))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("true\nfalse\n");
        }
    ),

    test(
        "recursive functions can modify global variables",
        // Source: HKOI 2020/21 Heat Event Senior Q20
        () => {
            const functions = `
            a := 0
            b := 0
            func f(x int32) int32 {
                if x <= 1 {
                    return 1
                } else {
                    a = f(x - 1)
                    b = f(x - 2)
                    return a + b
                }
            }
            func main() {
                fmt.Println(f(5))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("5\n");
        }
    )
})

describe("Supports higher-order functions", () => {
    test(
        "Can pass a function as an argument",
        () => {
            const functions = `
            func apply(f func(int32) int32, x int32) int32 {
                return f(x)
            }
            func square(x int32) int32 {
                return x * x
            }
            func main() {
                fmt.Println(apply(square, 5))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("25\n");
        }
    ),

    test(
        "Can return a function",
        () => {
            const functions = `
            func make_adder(x int32) func(int32) int32 {
                return func(y int32) int32 {
                    return x + y
                }
            }
            func main() {
                add5 := make_adder(5)
                fmt.Println(add5(10))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("15\n");
        }
    ),

    test(
        "Can return a function that captures an environment variable",
        () => {
            const functions = `
            func make_adder(x int32) func(int32) int32 {
                return func(y int32) int32 {
                    return x + y
                }
            }
            func main() {
                add5 := make_adder(5)
                fmt.Println(add5(10))
                add10 := make_adder(10)
                fmt.Println(add10(5))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("15\n15\n");
        }
    ),

    test(
        "Can return a function that captures an environment variable and modifies it",
        () => {
            const functions = `
            x := 5
            func make_adder() func(int32) int32 {
                return func(y int32) int32 {
                    x = x + y
                    return x
                }
            }
            func main() {
                add := make_adder()
                fmt.Println(add(10))
                fmt.Println(add(5))
            }
            `
            const result = evaluateFunctions(functions, true);
            expect(result).toBe("15\n20\n");
        }
    )
})