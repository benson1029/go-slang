package main

import "fmt"

func main() {
    var f func() int32;
    for i := 1; i <= 10; i++ {
        f = func() int32 { return i; }
        i++
        fmt.Println(i)
    } // output: 2, 4, 6, 8, 10
    fmt.Println(f()) // output: 10
}