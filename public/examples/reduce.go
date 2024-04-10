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