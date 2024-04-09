---
sidebar_position: 4
---

# Concurrent Constructs

## Wait Groups

The `sync` package provides the `WaitGroup` type for synchronizing goroutines. The syntax for declaring a `WaitGroup` is as follows:

```go
var wg sync.WaitGroup
```

The `Add` method is used to increment the counter of the `WaitGroup`.

```go
wg.Add(1)
```

The `Done` method is used to decrement the counter of the `WaitGroup`.

```go
wg.Done()
```

The `Wait` method is used to block until the counter of the `WaitGroup` becomes zero.

```go
wg.Wait()
```

The following example demonstrates the use of a `WaitGroup` to synchronize goroutines.

```go
package main

import (
    "fmt"
    "sync"
)

func worker(id int32, wg sync.WaitGroup) {
    fmt.Println("Worker", id, "starting")
    wg.Done()
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, wg)
    }
    wg.Wait()
    fmt.Println("All workers done")
}
```

## Mutex

The `sync` package also provides the `Mutex` type for synchronizing access to shared variables. The syntax for declaring a mutex is as follows:

```go
var m sync.Mutex
```

The `Lock` and `Unlock` methods are used to lock and unlock the mutex, respectively.

```go
m.Lock()
// code
m.Unlock()
```

The `TryLock` method is used to try to lock the mutex without blocking.

```go
if m.TryLock() {
    // code
    m.Unlock()
}
```

The following example demonstrates the use of a mutex to synchronize access to a shared variable.

- Before synchronization:
    
    ```go
    package main

    import (
        "fmt"
        "sync"
    )

    var count int32
    var wg sync.WaitGroup

    func increment() {
        for i := 0; i < 100; i++ {
            count++
        }
        wg.Done()
    }

    func main() {
        wg.Add(2)
        go increment()
        go increment()
        wg.Wait()
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
```