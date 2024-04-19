import { parse } from '../../parser/go';
import { ECE } from '../ece';

function evaluateFunctions(functions, isRecursive = false) {
    const program = `
    package main

    import "fmt"

    ${functions}
    `
    const parsed_program = parse(program);
    const heapSize = 32768;
    const return_value = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive).output;
    const check_mark_and_sweep = (new ECE(heapSize, parsed_program)).evaluate(!isRecursive, true).output;
    expect(return_value).toBe(check_mark_and_sweep);
    return return_value;
}

describe("Select", () => {
    it("should be able to select a case", () => {
        const functions = `
        func main() {
          a := make(chan chan int32, 1)
          cc := make(chan int32, 1)

          cc <- 1
          a <- cc

          for i := 0; i < 100; i++ {
            // busy waiting
          }

          var i int32
          select {
          case i = <-(<-a):
              fmt.Println("HI", i)
          }
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("HI 1\n");
    })

    it("should be able to select a default case", () => {
        const functions = `
        func main() {
          a := make(chan chan int32, 1)
          cc := make(chan int32, 1)

          a <- cc

          for i := 0; i < 100; i++ {
            // busy waiting
          }

          var i int32
          select {
          case i = <-(<-a):
              fmt.Println("HI", i)
          default:
              fmt.Println("default")
          }
        }
        `
        const result = evaluateFunctions(functions);
        expect(result).toBe("default\n");
    })

    it("should deadlock if cannot evaluate all values", () => {
      const functions = `
      func main() {
        a := make(chan chan int32, 1)
        cc := make(chan int32, 1)

        for i := 0; i < 100; i++ {
          // busy waiting
        }

        var i int32
        select {
        case i = <-(<-a):
            fmt.Println("HI", i)
        default:
            fmt.Println("default")
        }
      }
      `
      try {
        evaluateFunctions(functions);
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe("All goroutines are asleep - deadlock!");
      }
  })

  it("should handle channels in multiple cases", () => {
    const functions = `
    func main() {
      c := make(chan int32, 1)

      go func() {
        c <- 100
      }()

      for i := 0; i < 100; i++ {
        // busy waiting
      }

      cnt := 0
      for cnt := 0; cnt < 1; cnt++ {
        var i int32
        select {
        case <- c:
          continue
        case i = <-c:
          continue
        case c <- cnt:
          continue
        }
      }
    }
    `
    const result = evaluateFunctions(functions);
    expect(result).toBe("");
  })

  it("should handle channels in multiple cases with default", () => {
    const functions = `
    func main() {
      c := make(chan int32)
  
      for i := 0; i < 100; i++ {
        // busy waiting
      }

      for cnt := 0; cnt < 1; cnt++ {
        var i int32
        select {
        case <- c:
          continue
        case i = <-c:
          continue
        case c <- cnt:
          continue
        case c <- 100 * 101:
          continue
        default:
          fmt.Println("default")
        }
      }
    }
    `
    const result = evaluateFunctions(functions);
    expect(result).toBe("default\n");
  })

  it("should handle complex select", () => {
    const functions = `
    func main() {
      c := make(chan int32, 1)
      c2 := make(chan int32, 1)

      go func() {
        for i := 0; i < 10; i++ {
          c <- 100
        }
      }()

      go func() {
        for i := 0; i < 10; i++ {
          c2 <- 200
        }
      }()

      for i := 0; i < 100; i++ {
        // busy waiting
      }

      for cnt := 0; cnt < 20; cnt++ {
        var i int32
        select {
        case <- c:
          continue
        case <- c2:
          continue
        }
      }
    }
    `
    const result = evaluateFunctions(functions);
    expect(result).toBe("");
  })

  it("should handle select with break", () => {
    const functions = `
    func main() {
      c := make(chan int32)
      c2 := make(chan int32)

      go func() {
        c <- 100
      }()

      for i := 0; i < 100; i++ {
        // busy waiting
      }

      for cnt := 0; cnt < 20; cnt++ {
        var i int32
        select {
        case <- c:
          break
        case <- c2:
          continue
        }
      }
    }
    `
    const result = evaluateFunctions(functions);
    expect(result).toBe("");
  })
})