---
sidebar_position: 1
---

# Channel Implementation

A channel with buffer size $k$ is essentially
```go
type Channel struct {
  buffer Queue  // at most size k
  waitingSend Queue
  waitingRecv Queue
}
```

When a thread $t$ wants to send to a channel,
```go
func send(t thread, value value_t) {
  if buffer.size() < k || waitingRecv.size() > 0 {
    buffer.enqueue(value)
    if waitingRecv.size() > 0 {
      newThread := waitingRecv.dequeue()
      newValue := buffer.dequeue()
      newThread.Stash().Push(newValue)
      scheduler.Wake(newThread)
    }
  } else {
    waitingSend.enqueue(t)
  }
}
```

When a thread $t$ wants to receive from a channel,
```go
func recv(t thread) {
  if waitingSend.size() > 0 {
    newThread := waitingSend.dequeue()
    newValue := newThread.sendValue
    buffer.enqueue(newValue)
    scheduler.Wake(newThread)
  }
  if buffer.size() > 0 {
    newValue := buffer.dequeue()
    t.Stash().Push(newValue)
  } else {
    waitingRecv.enqueue(t)
  }
}
```

```go
var mutex sync.Mutex
c1 := make(chan int32)
c2 := make(chan int32)

// some code...

select {
  case c1 <- 10:
    mutex.Lock()
    // critical section
    mutex.Unlock()
  case c2 <- 10:
    // some code...
}
```
