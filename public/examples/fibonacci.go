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