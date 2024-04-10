package main

import "fmt"

type Line struct {
    start Point
    end Point
}

type Shape struct {
    lines [10]Line
}

type Point struct {
    x float32
    y float32
}

func (p Point) squareDistance(q Point) float32 {
    return (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y)
}

func (l Line) length() float32 {
    return l.start.squareDistance(l.end)
}

func (s Shape) perimeter() float32 {
    var sum float32
    for i := 0; i < 10; i++ {
        sum = sum + s.lines[i].length()
    }
    return sum
}

func main() {
    var p1 Point
    p1.x = 1.0
    p1.y = 2.0

    var p2 Point
    p2.x = 3.0
    p2.y = 4.0

    fmt.Println(p1.squareDistance(p2)) // Prints 8.0

    var l1 Line
    l1.start = p1
    l1.end = p2

    fmt.Println(l1.length()) // Prints 8.0

    var s Shape
    s.lines[0] = l1

    fmt.Println(s.perimeter()) // Prints 8.0
}