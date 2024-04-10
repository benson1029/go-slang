package main

import (
    "fmt"
    "sync"
)

var wg sync.WaitGroup

func producer(ch chan int32) {
    for i := 0; i < 5; i++ {
        // the producer gets blocked if there is no consumer
        ch <- i
    }
    fmt.Println("Producer done") // this does not get printed
    // making the channel buffered will allow the producer to continue
    // by changing the channel declaration to "ch := make(chan int32, 1)"
    wg.Done()
}

func consumer(ch chan int32) {
    for i := 0; i < 4; i++ {
        fmt.Println(<-ch)
    }
    fmt.Println("Consumer done")
    wg.Done()
}

func main() {
    wg.Add(2)
    ch := make(chan int32)
    go producer(ch)
    go consumer(ch)
    wg.Wait()
}