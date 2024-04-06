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
