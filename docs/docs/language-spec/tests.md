---
sidebar_position: 10
---

# Sample Programs for Manual Testing

This page contains a list of sample programs that can be used as a starting point to manually try out the language implementation.

## Sequential Constructs

### Hello World

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    fmt.Println("Hello, World!")
}
```

### Fibonacci

```go
package main

import "fmt"

func fibonacci(n int32) int32 {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    n := 10
    fmt.Println(fibonacci(n)) // Prints 55
}
```

### Pascal Triangle

```go
package main

import "fmt"

func main() {
    var triangle [10][10]int32
    n := 10
    for i := 0; i < n; i++ {
        triangle[i][0] = 1
        triangle[i][i] = 1
        for j := 1; j < i; j++ {
            triangle[i][j] = triangle[i-1][j-1] + triangle[i-1][j]
        }
    }
    fmt.Println(triangle)
}
```

### Array Sum using Reduce

```go
package main

import "fmt"

func main() {
    var arr [10]int32
    for i := 0; i < 10; i++ {
        arr[i] = i
    }
    f := func(a int32, b int32) int32 {
        return a + b
    }
    answer := reduce(arr, f, 0)
    fmt.Println(answer()) // Prints 45
}

func reduce(arr [10]int32, combiner func(int32, int32) int32, init int32) func() int32 {
    return func() int32 {
        sum := init
        for i := 0; i < 10; i++ {
            sum = combiner(sum, arr[i])
        }
        return sum
    }
}
```

### Global Variables Sorting

```go
package main

import "fmt"

var x int32 = f() + 1

func f() int32 {
    // var z int32 = x + 1 // This will cause a cyclic dependency error.
    return y
}

var y int32 = 10

func main() {
    // The declaration order after sorting will be y, f, x, main.
    fmt.Println(x) // Prints 11
}
```

### Points and Lines

```go
package main

import "fmt"

type Line struct {
    start Point
    end Point
}

type Shape struct {
    lines [10]Line
}

type Point struct {
    x float32
    y float32
}

func (p Point) squareDistance(q Point) float32 {
    return (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y)
}

func (l Line) length() float32 {
    return l.start.squareDistance(l.end)
}

func (s Shape) perimeter() float32 {
    var sum float32
    for i := 0; i < 10; i++ {
        sum = sum + s.lines[i].length()
    }
    return sum
}

func main() {
    var p1 Point
    p1.x = 1.0
    p1.y = 2.0

    var p2 Point
    p2.x = 3.0
    p2.y = 4.0

    fmt.Println(p1.squareDistance(p2)) // Prints 8.0

    var l1 Line
    l1.start = p1
    l1.end = p2

    fmt.Println(l1.length()) // Prints 8.0

    var s Shape
    s.lines[0] = l1

    fmt.Println(s.perimeter()) // Prints 8.0
}
```




