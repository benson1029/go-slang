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