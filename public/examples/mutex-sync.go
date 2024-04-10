package main

import (
    "fmt"
    "sync"
)

var count int32
var wg sync.WaitGroup
var m sync.Mutex

func increment() {
    for i := 0; i < 100; i++ {
        m.Lock()
        count++
        m.Unlock()
    }
    wg.Done()
}

func main() {
    wg.Add(2)
    go increment()
    go increment()
    wg.Wait()
    fmt.Println(count) // prints 200
}