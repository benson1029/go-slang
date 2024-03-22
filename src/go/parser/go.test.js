import { parse, SyntaxError } from './go';

test(
    'parser should parse syntactically correct go code',
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            fmt.Println("Hello, World!")
        }`;
        const result = await parse(code);
        expect(result).toMatchObject({
            tag: "program",
            package: "main",
            imports: ["fmt"],
            body: [
                {
                    tag: "function",
                    name: "main",
                    params: [],
                    returnType: null,
                    body: {
                        tag: "block",
                        body: {
                            tag: "sequence",
                            body: [
                                {
                                    tag: "call",
                                    func: {
                                        tag: "name",
                                        name: "fmt.Println"
                                    },
                                    args: [
                                        {
                                            tag: "literal",
                                            type: "string",
                                            value: "Hello, World!"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        });
    }
)

test(
    'parser should throw an error for syntactically incorrect go code',
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            fmt.Println("Hello, World!"
        }`;
        expect(() => parse(code)).toThrow(SyntaxError);
    }
)

test(
    "parser supports import statements",
    async () => {
        const code = `package main

        import "fmt"
        import "math/rand"
        import (
            "time"
            "math"
        )

        func main() {
            fmt.Println("Hello, World!")
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing variable declarations",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            w := 1
            var x int32 = 2
            var y = 3
            var z int32
            fmt.Println(x)
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing for loops",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            for i := 0; i < 10; i = i + 1 {
                fmt.Println(i)
            }
            for ; true; {
                fmt.Println("infinite loop")
            }
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing if statements",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            if true {
                fmt.Println("true")
            } else {
                fmt.Println("false")
            }
            x := 1;
            if x < 0 {
                fmt.Println("negative")
            }
            if x > 0 {
                fmt.Println("positive")
            } else if x == 0 {
                fmt.Println("zero")
            }
            if x < 0 {
                fmt.Println("negative")
            } else if x > 0 {
                fmt.Println("positive")
            } else {
                fmt.Println("zero")
            }
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing function declarations",
    async () => {
        const code = `package main

        import "fmt"

        func print(x int32) {
            fmt.Println(x)
        }

        func main() {
            print(add(1, 2))
        }

        func add(x int32, y int32) int32 {
            return x + y
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing anonymous functions",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            func(x int32) {
                fmt.Println(x)
            }(1)
            func() {
                fmt.Println("anonymous")
            }()
            x := 4 * func(x int32, y int32) int32 {
                return x + y
            }(1, 2) + 3
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports go routines",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            go fmt.Println("Hello, World!")
            go func() {
                fmt.Println("Hello, World!")
            }()
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports literals of int, float32, string and bool",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            fmt.Println(1)
            fmt.Println(1.0)
            fmt.Println("hello")
            fmt.Println(true)
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing expressions",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            fmt.Println(1 + 2)
            fmt.Println(1 - 2)
            fmt.Println(1 * 2)
            fmt.Println(1 / 2)
            fmt.Println(1 % 2)
            fmt.Println(true && false)
            fmt.Println(true || false)
            fmt.Println(!true)
            fmt.Println(1 < 2)
            fmt.Println(1 > 2)
            fmt.Println(1 <= 2)
            fmt.Println(1 >= 2)
            fmt.Println(1 == 2)
            fmt.Println(1 != 2)
            x := 1
            x++
            x--
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing arrays",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            var x [5]int32
            fmt.Println(x)
            y := [5]int32{1, 2, 3, 4, 5}
            fmt.Println(y)
            fmt.Println(y[0])
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports parsing slices",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            var x []int32
            fmt.Println(x)
            y := []int32{1, 2, 3, 4, 5}
            fmt.Println(y)
            fmt.Println(y[0])
            fmt.Println(y[1:3])
            fmt.Println(y[:3][0])
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports multi-dimensional arrays",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            var x [5][5]int32
            fmt.Println(x)
            y := [2][5]int32{{1, 2, 3, 4, 5}, {6, 7, 8, 9, 10}}
            fmt.Println(y)
            fmt.Println(y[0])
            fmt.Println(y[0][0])
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)

test(
    "parser supports comments",
    async () => {
        const code = `package main

        import "fmt"

        func main() {
            // single line comment
            fmt.Println("Hello, World!") // single line comment
            /**
              * multi-line comment
              */
            /**/
            /*************/
            /************/
            /***********/
            ///// odd number of slashes
        }`;
        const result = await parse(code);
        expect(result).toBeInstanceOf(Object);
    }
)
