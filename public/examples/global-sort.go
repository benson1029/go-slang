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