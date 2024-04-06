---
sidebar_position: 4
---

# Concurrent Constructs

## Mutex

The syntax for declaring a mutex is as follows:

```go
var m sync.Mutex
```

The `Lock` and `Unlock` methods are used to lock and unlock the mutex, respectively.

```go
m.Lock()
// code
m.Unlock()
```

The following example demonstrates the use of a mutex to synchronize access to a shared variable.

- Before synchronization:
    
    ```go
    package main

    import "fmt"

    var count int32

    func increment() {
        for i := 0; i < 100; i++ {
            count++
        }
    }

    func main() {
        go increment()
        go increment()
        for i := 0; i <= 1000; i++ {
            // busy wait
        }
        fmt.Println(count) // prints 100
    }
    ```

- After synchronization:

    ```go
    package main

    import (
        "fmt"
        "sync"
    )

    var count int32
    var m sync.Mutex

    func increment() {
        for i := 0; i < 100; i++ {
            m.Lock()
            count++
            m.Unlock()
        }
    }

    func main() {
        go increment()
        go increment()
        for i := 0; i <= 1000; i++ {
            // busy wait
        }
        fmt.Println(count) // prints 200
    }
    ```

## Channels

The syntax for declaring a channel is as follows:

```go
unbuffered := make(chan int32) // unbuffered channel
buffered := make(chan int32, 5) // buffered channel
```

The `send` and `receive` operations are used to send and receive data through a channel, respectively.

```go
unbuffered <- 5 // send
x := <-unbuffered // receive
```

The following example demonstrates the use of channels to synchronize goroutines.

```go
package main

import "fmt"

func producer(ch chan int32) {
    for i := 0; i < 5; i++ {
        // the producer gets blocked if there is no consumer
        ch <- i
    }
    fmt.Println("Producer done") // this does not get printed
    // making the channel buffered will allow the producer to continue
    // by changing the channel declaration to "ch := make(chan int32, 1)"
}

func consumer(ch chan int32) {
    for i := 0; i < 4; i++ {
        fmt.Println(<-ch)
    }
    fmt.Println("Consumer done")
}

func main() {
    ch := make(chan int32)
    go producer(ch)
    go consumer(ch)
    for i := 0; i <= 1000; i++ {
        // busy wait
    }
}
```