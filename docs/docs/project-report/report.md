---
sidebar_position: 1
---

# CS4215 Project Report

**Title**: Explicit-control evaluator (ECE) for Go

**Team Members**: Rama Aryasuta Pangestu (A0236444E), Yeung Man Tsung (A0255829N)

**Repository URL**: [https://github.com/benson1029/go-slang](https://github.com/benson1029/go-slang)

**Live Demo**: [https://benson1029.github.io/go-slang/](https://benson1029.github.io/go-slang/)

This report can be viewed online on [https://benson1029.github.io/go-slang/docs/project-report/report](https://benson1029.github.io/go-slang/docs/project-report/report).

## Table of Contents

- [Language Processing Steps](#language-processing-steps)
- [ECE Specification](#ece-specification)
  - [Instruction Set](#instruction-set)
  - [State Representation](#state-representation)
  - [Inference Rules for Some Parts](#inference-rules-for-some-parts)
- [Project Source](#project-source)
- [Test Cases](#test-cases)

## Language Processing Steps

Externally, this ECE machine is an interpreter for Go written in JavaScript, which is then run in a JavaScript interpreter (the browser). This is shown using the following T-diagram:

![T-diagram](/img/t-diagram.png)

Internally, the Go program is first parsed into an abstract syntax tree (AST) using a parser, generated with peg.js using our own syntax definition. The AST is then preprocessed by a preprocessor, which annotates the global scope declarations with their necessary captures and then sorts the global scope declarations such that their dependencies are satisified. The preprocessed AST is then passed to a loader, which loads the entire program into the heap and initializing the Control stack in the ECE machine. The ECE machine then executes the instructions in the Control stack.

```mermaid
flowchart LR
    goprogram[Go Program] -- Parser --> ast["Abstract Syntax Tree (AST)"] -- Preprocessor --> preprocessed["Preprocessed AST"] -- Loader --> heap["Heap"] -- ECE Machine --> output["Output"]
```

## ECE Specification

### Instruction Set

The following tables show the instruction set of the ECE machine.

#### Helper Instructions

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `PUSH_I` | Pushes a value into the stash | `value` (value) | None |
| `POP_I` | Pops a value from the stash | None | `value` (value) |

#### Expressions

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `BINARY` | Performs a binary operation (includes logical operations) | `operator` (string), `left_operand` (rvalue expression), `right_operand` (rvalue expression) | None |
| `BINARY_I` | Performs a binary operation | `operator` (string) | None | `left_operand` (value), `right_operand` (value) |
| `LOGICAL_IMM_I` | Performs a logical operation with only the left operand in the stash | `operator` (string), `right_operand` (rvalue expression) | `left_operand` (value) |
| `LOGICAL_I` | Performs a logical operation with only the right operand in the stash | `operator` (string) | `right_operand` (value) |
| `UNARY` | Performs a unary operation | `operator` (string), `operand` (rvalue expression) | None |
| `UNARY_I` | Performs a unary operation | `operator` (string) | None | `operand` (value) |
| `LITERAL` | Pushes a literal value into the stash | `type` (string), `value` (value) | None |

#### Variables

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `ASSIGN` | Assigns a value to a variable | `name` (lvalue expression), `value` (rvalue expression) | None |
| `ASSIGN_I` | Assigns a value to a variable | None | `name` (address), `value` (value) |
| `VAR` | Declares a variable with an initial value | `name` (string), `value` (rvalue expression) | None |
| `VAR_I` | Declares a variable with an initial value | `name` (string) | `value` (value) |
| `NAME` | Accesses the value of a variable | `name` (string) | None |
| `NAME_ADDRESS` | Accesses the address of a variable | `name` (string) | None |

#### Control Flow

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `SEQUENCE` | Executes a sequence of instructions | `body` (linked list of instructions) | None |
| `BLOCK` | Starts a scope, i.e. pushes a new environment frame | `body` (sequence) | None |
| `EXIT_SCOPE_I` | Exits the current scope, i.e. pops the environment frame | None | None |
| `IF` | Conditional statement | `condition` (rvalue expression), `then_body` (block), `else_body` (block) | None |
| `IF_I` | Conditional statement | `then_body` (block), `else_body` (block) | `condition` (boolean) |
| `FOR` | Iterative statement | `init` (statement), `condition` (rvalue expression), `update` (statement), `body` (block) | None |
| `FOR_I` | Iterative statement | `condition` (rvalue expression), `update` (statement), `body` (block) | `condition` (boolean) |
| `MARKER_I` | Marker to signify the end of the loop body | None | None |
| `BREAK` | Breaks out of the loop | None | None |
| `CONTINUE` | Continues to the next iteration of the loop | None | None |

#### Functions

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `FUNCTION` | Declares a function | `name` (string), `param_names` (array of strings), `capture_names` (array of strings), `body` (block) | None |
| `CALL` | Calls a function | `function` (rvalue expression), `args` (array of rvalue expressions) | None |
| `CALL_I` | Calls a function | `num_args` (int) | `function` (value), `args` (array of values) |
| `CALL_STMT` | Calls a function and discards the return value | `body` (a `CALL` instruction) | None |
| `RETURN` | Returns a value from a function | `value` (rvalue expression) | None |
| `RETURN_I` | Returns a value from a function | None | `value` (value) |
| `RESTORE_ENV_I` | Restores the environment frame before the function call | `frame` (environment frame) | None |

#### Constructors

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `DEFAULT_MAKE` | Pushes the default value of a type into the stash | `type` (string), `args` (array of any) | None |
| `MAKE` | Constructs a value of a type according to the `make` function call | `type` (string), `args` (array of rvalue expressions) | None |
| `MAKE_I` | Constructs a value of a type according to the `make` function call | `type` (string), `num_args` (int) | `args` (array of values) |
| `CONSTRUCTOR` | Constructs a value of a type according to the initializer list `{...}` | `type` (string), `args` (array of rvalue expressions) | None |
| `CONSTRUCTOR_I` | Constructs a value of a type according to the initializer list `{...}` | `type` (string), `num_args` (int) | `args` (array of values) |


#### Arrays

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `INDEX` | Accesses the value of an array element | `array` (rvalue expression), `index` (rvalue expression) | None |
| `INDEX_I` | Accesses the value of an array element | None | `array` (value), `index` (value) |
| `INDEX_ADDRESS` | Accesses the address of an array element | `array` (rvalue expression), `index` (rvalue expression) | None |
| `INDEX_ADDRESS_I` | Accesses the address of an array element | None | `array` (address), `index` (value) |

#### Structs

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `STRUCT` | Declares a struct | `name` (string), `fields` (array of names and types) | None |
| `METHOD` | Declares a method for a struct | `struct_name` (string, name of the struct), `name` (string), `self_name` (string), `param_names` (array of strings), `capture_names` (array of strings), `body` (block) | None |
| `MEMBER` | Accesses the value of a struct member | `object` (rvalue expression), `member` (string) | None |
| `MEMBER_I` | Accesses the value of a struct member | None | `object` (value), `member` (string) |
| `MEMBER_ADDRESS` | Accesses the address of a struct member | `object` (rvalue expression), `member` (string) | None |
| `MEMBER_ADDRESS_I` | Accesses the address of a struct member | None | `object` (address), `member` (string) |
| `METHOD_MEMBER` | Accesses the value of a method member, and pushes the current object into the stash (for the method call to use) | `object` (rvalue expression), `member` (string) , `struct` (string, name of the struct, annotated during type checking) | None |

#### Slices

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `SLICE` | Slices an array | `array` (rvalue expression), `start` (rvalue expression), `end` (rvalue expression) | None |
| `SLICE_I` | Slices an array | None | `array` (value), `start` (value), `end` (value) |
| `SLICE_ADDRESS` | Slices an array | `array` (rvalue expression), `start` (rvalue expression), `end` (rvalue expression) | None |
| `SLICE_ADDRESS_I` | Slices an array | None | `array` (address), `start` (value), `end` (value) |

### Goroutines and Channels

| Instruction | Description | Parameters | Stash |
| --- | --- | --- | --- |
| `GO_CALL_STMT` | Calls a function in a new goroutine | `body` (a `CALL` instruction) | None |
| `CHAN_RECEIVE` | Receives a value from a channel | `channel` (rvalue expression) | None |
| `CHAN_RECEIVE_I` | Receives a value from a channel | None | `channel` (address) |
| `CHAN_RECEIVE_STMT` | Receives a value from a channel and discards it | `body` (a `CHAN_RECEIVE` instruction) | None |
| `CHAN_SEND` | Sends a value to a channel | `channel` (rvalue expression), `value` (rvalue expression) | None |
| `CHAN_SEND_I` | Sends a value to a channel | None | `channel` (address), `value` (value) |
| `SELECT` | Selects a case from a list of cases | `cases` (array of cases) | None |
| `SELECT_I` | Selects a case from a list of cases, with the expressions already evaluated | `select` (a `SELECT` instruction) | The evaluated expressions for all cases |
| `CASE_SEND` | A case for sending to a channel | `channel` (rvalue expression), `value` (rvalue expression), `body` (sequence) | None |
| `CASE_RECEIVE` | A case for receiving from a channel | `channel` (rvalue expression), `assign` (null or lvalue expression), `body` (sequence) | None |
| `CASE_DEFAULT` | A default case | `body` (sequence) | None |

### State Representation

TODO

### Inference Rules for Some Parts

Inference rule sample:

$\begin{matrix}
\Delta'' = \Delta' [x_1 \leftarrow v_1] \cdots [x_n \leftarrow v_n] \\ \hline
(v_n \ldotp \ldots \ldotp v_1 \ldotp \texttt{CLOSURE} \ (x_1, \ldots, x_n) \ p \ \Delta' \ldotp s, \texttt{APPLY} \ n \ldotp c, \Delta) \rightrightarrows_S (s, p \ldotp \texttt{MARK} \ldotp \texttt{ENV} \ \Delta \ldotp c, \Delta'')
\end{matrix}$


## Project Source

Our project source code is available on GitHub at [benson1029/go-slang](https://github.com/benson1029/go-slang). It is a standalone React application that can be run locally, or deployed to GitHub Pages on [https://benson1029.github.io/go-slang/](https://benson1029.github.io/go-slang/).

To run the project locally, you need to have Node.js and npm installed. After that, you can run the application locally by running the following commands:

```bash
git clone https://github.com/benson1029/go-slang.git
cd go-slang
npm install
npm start
```

Then, open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Test Cases

Unit tests for the parser and preprocessor (specially, the module for sorting global declarations) are available in [`src/go/parser/go.test.js`](https://github.com/benson1029/go-slang/blob/main/src/go/parser/go.test.js) and [`src/go/ece/loader/globalSort.test.ts`](https://github.com/benson1029/go-slang/blob/main/src/go/ece/loader/globalSort.test.ts). Integration tests for the ECE machine are available under the directory [`src/go/ece/tests`](https://github.com/benson1029/go-slang/tree/main/src/go/ece/tests), which cover all language constructs that are supported by the ECE machine.

For most test cases that does not involve recursive calls, we additionally check whether all objects in the heap are freed after the program execution. This confirms that our reference counting garbage collector is working correctly. Recursive calls will create cyclic data structures in the heap, thus we do not check for unfreed objects in these cases.

The purpose of each test is documented in the source code.

To run the tests, you can run the following command:

```bash
npm test
```
