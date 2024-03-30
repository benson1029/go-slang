---
sidebar_position: 2
---

# Sequential Constructs

## Variables and Expressions

### Data Types

The supported data types are shown in the following table:

| Data Type | Description |
| --- | --- |
| `int32` | 32-bit signed integer |
| `float32` | 32-bit floating point number |
| `bool` | Boolean value |
| `string` | String value |

### Variable Declaration and Assignment

Variables are declared using the `var` keyword or the `:=` operator. The syntax is as follows:

```go
var w = 5
var x int32
var y float32 = 5
z := 5
```

Assignment is done using the `=` operator. The syntax is as follows:

```go
x = 5
```

### Operators

The following operators are supported, in order of decreasing precedence:

| Operator | Description | Associativity |
| --- | --- | --- |
| `++` `--` | Postfix | Left to right |
| `+ - !` | Unary | Right to left |
| `* / %` | Multiplicative | Left to right |
| `+ -` | Additive | Left to right |
| `< <= > >=` | Relational | Left to right |
| `== !=` | Equality | Left to right |
| `&&` | Logical AND | Left to right |
| `\|\|` | Logical OR | Left to right |


## Control Flow

### If-Else

The syntax for the `if-else` construct is as follows:

```go
if condition {
    // code
} else {
    // code
}
```

### For Loop

The syntax for the `for` loop is as follows:

```go
for i := 0; i < 5; i++ {
    // code
}
```

The `init` and `post` statements can be empty, in such case the `for` loop can be used as a `while` loop.

```go
for ; i < 5; {
    // code
}
```

Break and continue statements are supported.

```go
for i := 0; i < 5; i++ {
    if i == 3 {
        continue
    }
    if i == 4 {
        break
    }
    fmt.Println(i)
}
```

## Functions

The syntax for a function definition is as follows:

```go
func add(a int32, b int32) int32 {
    return a + b
}
```

Alternatively, one can use the `func` keyword to define a lambda expression.

```go
add := func(a int32, b int32) int32 {
    return a + b
}
```

Function calls can either be sequential or concurrent, using the `go` keyword.

```go
add(1, 2) // Sequential
go add(1, 2) // Concurrent
```

### Built-in Functions

The following built-in functions are supported:

- Default: `len`
- `fmt`: `Println`, `Print`
