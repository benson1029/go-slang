---
sidebar_position: 4
---

# Channel Implementation

A channel with buffer size $k$ is essentially
```go
type Channel struct {
  buffer Queue // at most size k
  mutex Mutex
  waitingSend Queue
  waitingRecv Queue
}
```

We have an auxiliary atomic function `ReleaseAndBlock`
```go
func ReleaseAndBlock(thread Thread, waitingQueue []Queue, mutex []Mutex) {
  waker := Waker(thread)

  for i := 0; i < len(waitingQueue); i++ {
    waitingQueue[i].Push(waker)
  }
  for i := 0; i < len(mutex); i++ {
    mutex[i].Unlock(thread)
  }

  thread.Block()
}
```

When a thread $t$ wants to send to a channel,
```go
value := ...
c.mutex.Lock()
if c.buffer.Size() < k {
  c.buffer.Push(value)
  if c.waitingRecv.Size() > 0 {
    newThread := c.waitingRecv.Pop()
    new_value = c.buffer.Pop()
    newThread.Stash().Push(new_value)
    newThread.Unblock()
  }
  c.mutex.Unlock()
} else {
  // buffer is full, wait
  t.Stash().Push(value)
  ReleaseAndBlock(t, []Queue{c.waitingSend}, []Mutex{c.mutex})
}
```

When a thread $t$ wants to receive from a channel,
```go
c.mutex.Lock()
if (c.buffer.Size() > 0) {
  value := c.buffer.Pop()
  if c.waitingSend.Size() > 0 {
    newThread := c.waitingSend.Pop()
    new_value := newThread.Stash().Pop()
    c.buffer.Push(new_value)
    newThread.Unblock()
  }
  c.mutex.Unlock()
} else {
  // buffer is empty, wait
  ReleaseAndBlock(t, []Queue{c.waitingRecv}, []Mutex{c.mutex})
  // after unblocked, there is a value in stash
  value := t.Stash().Pop()
}
```
