---
sidebar_position: 3
---

# Data Structures

## Arrays

Arrays are fixed-size collections of elements of the same type. The syntax for declaring an array is as follows:

```go
var arr [5]int32
```

This initializes an array of 5 integers with the default value of 0. You can also initialize an array with values:

```go
arr := [5]int32{1, 2, 3, 4, 5}
```

Arrays can be accessed using the index operator:

```go
fmt.Println(arr[0]) // 1
```

The length of an array can be obtained using the `len` function:

```go
fmt.Println(len(arr)) // 5
```

## Slices

Slices are dynamic arrays that can grow or shrink in size.

The syntax for declaring a slice is as follows:

1. Declaring an empty slice:

   ```go
   var slice []int32
   ```

2. Declaring a slice with values:

   ```go
    slice := []int32{1, 2, 3, 4, 5}
    ```

3. Declaring a slice with a specific length and capacity:

   ```go
   slice := make([]int32, 5, 10)
   ```

   This initializes a slice of integers with a length of 5 and a capacity of 10.

4. Declaring a slice with a specific length:

   ```go
   slice := make([]int32, 5)
   ```

   This initializes a slice of integers with a length of 5 and a capacity of 5.

5. Slice of an array or another slice:

   ```go
   arr := [5]int32{1, 2, 3, 4, 5}
   slice := arr[1:4]
   ```

   This initializes a slice of integers with the elements of the array `arr` from index 1 to 4.  
   The slice has length 3 and capacity 4.

Slices can be accessed using the index operator:

```go
fmt.Println(slice[0]) // 1
```

The length of a slice can be obtained using the `len` function:

```go
fmt.Println(len(slice)) // 5
```

The capacity of a slice can be obtained using the `cap` function:

```go
fmt.Println(cap(slice)) // 5
```

Slices can be appended to using the `append` function:

```go
slice = append(slice, 6)
```

## Structs

Structs are user-defined types that can hold multiple fields of different types. The syntax for declaring a struct is as follows:

```go
type Person struct {
    Name string
    Age  int32
}
```

This initializes a struct with two fields: `Name` of type `string` and `Age` of type `int32`. You can create an instance of a struct as follows:

```go
person := Person{"Alice", 30}
```

You can access the fields of a struct using the dot operator:

```go
fmt.Println(person.Name) // Alice
fmt.Println(person.Age)  // 30
```

Structs can have methods associated with them:

```go
func (p Person) greet() {
    fmt.Println("Hello, my name is", p.Name)
}
```
