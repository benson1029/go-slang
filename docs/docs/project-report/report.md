# CS4215 Project Report

**Title**: Explicit-control evaluator (ECE) for Go

**Team Members**: Rama Aryasuta Pangestu (A0236444E), Yeung Man Tsung (A0255829N)

**Repository URL**: [https://github.com/benson1029/go-slang](https://github.com/benson1029/go-slang)

**Live Demo**: [https://benson1029.github.io/go-slang/](https://benson1029.github.io/go-slang/)

This report can be viewed online on [https://benson1029.github.io/go-slang/docs/project-report/report](https://benson1029.github.io/go-slang/docs/project-report/report).

## Table of Contents

- [Project Objectives](#project-objectives)
- [Language Processing Steps](#language-processing-steps)
- [ECE Specification](#ece-specification)
  - [Instruction Set](#instruction-set)
  - [State Representation](#state-representation)
  - [Inference Rules for Selected Parts](#inference-rules-for-selected-parts)
- [Project Source](#project-source)
- [Test Cases](#test-cases)

## Project Objectives

We implement an explicit-control evaluator (ECE) for the following subset of the Go programming language:

- Sequential constructs: Variable declarations and assignments, expressions, control flow (`if`, `for`), functions, and complex types (strings, structs, arrays, slices).
- Concurrent constructs: Goroutines, mutex, wait groups, channels, and `select` statements.

Additionally, we implement a low-level memory management system with both reference counting and mark-and-sweep garbage collection. All data structures, including control stack, heap, and environments, are stored in a single array buffer. We also implement a visualizer for the ECE machine.

All objectives are met in the final implementation. However, the following language features are not in scope:

- Sequential constructs: `switch` statements, `defer` statements, and `panic` and `recover` functions. Anonymous structs, indexing and slicing of strings, pointers, maps and tuples are also not implemented.
- Concurrent constructs: Closing of channels is not implemented.

The exact subset of the Go programming language that we support, along with some examples, can be found in the [language specification](/language-spec/quick-start) page.

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
| `FOR_I` | Iterative statement | `condition` (rvalue expression), `update` (statement), `body` (block), `loopVar` (name or null) | `condition` (boolean) |
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

#### Goroutines and Channels

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

The state of the ECE machine is the scheduler $S = T_{i_1} \ldotp T_{i_2} \ldotp \ldots$, where $T_{i_1}, T_{i_2}, \ldots$ are the threads in the scheduler (unblocked). Each thread $T_i$ is a tuple $(C, S, E)$, where $C$ is the control stack, $S$ is the stash, and $E$ is the environment.

The control stack and the stash are represented as the concatenation of its elements $x_1 \ldotp x_2 \ldotp x_3 \ldotp \ldots \ldotp x_k$. The environment is a tuple $(\Delta_N, \Delta_S)$, where $\Delta_N$ and $\Delta_S$ are the name and struct frames, respectively. We define $\Delta[x \leftarrow v]$ as the environment frame $\Delta$ with the variable $x$ bound to the value $v$, $\varnothing \ldotp \Delta$ as the environment frame $\Delta$ with a new empty child frame, and $\Delta(x)$ be the value bound to the variable $x$ in the environment frame $\Delta$.

We define the transition function $\rightrightarrows_S$ that maps the current scheduler $S$ to the scheduler $S'$ after evaluation, i.e. $S \rightrightarrows_S S'$.

### Inference Rules for Selected Parts

We define inference rules for selected instructions of our ECE machine.

#### For Loop

A for loop statement is defined in BNF as follows:

```
ForStmt = "for" WhiteSpace InitStmt ";" Expression ";" UpdStmt Block
InitStmt = Assignment | VarDecl
UpdStmt = Assignment | PostfixStmt
```

When the `FOR` instruction is executed, the `init` part is executed first, followed by the `condition` part. Next, the `FOR_I` instruction will checks for the result of evaluting the condition and determine the next steps. As `FOR_I` needs to know the loop variable, it is also determined and passed to the `FOR_I` instruction. The `FOR` instruction also needs to create a new environment frame for the loop variable (if any).

This is shown in the following inference rules:

$\begin{matrix}
\texttt{init} = \texttt{VAR} \ x \ E \\ \hline
(\texttt{FOR} \ \texttt{init} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ \ldotp C, S, (\Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \\
\rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{init} \ldotp \texttt{condition} \ldotp \texttt{FOR\_I} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ x  \ldotp \texttt{EXIT\_SCOPE\_I} \ldotp C, S, (\varnothing \ldotp \Delta_N, \Delta_S))
\end{matrix}$

$\begin{matrix}
\texttt{init} \neq \texttt{VAR} \ x \ E \\ \hline
(\texttt{FOR} \ \texttt{init} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ \ldotp C, S, (\Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \\
\rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{init} \ldotp \texttt{condition} \ldotp \texttt{FOR\_I} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ \texttt{nil}  \ldotp \texttt{EXIT\_SCOPE\_I} \ldotp C, S, (\varnothing \ldotp \Delta_N, \Delta_S)) 
\end{matrix}$

When the `FOR_I` instruction is executed, it takes the topmost value in the stash as the result of the condition. If the condition is true, the `body` is executed, followed by the `update` part, the `condition` part, and the `FOR_I` instruction again. If the condition is false, the loop is exited.

If there is a loop variable, a new environment frame is created for an iteration-scope copy of the loop variable. This copy should be copied back to the loop-scope variable at the end of the iteration.

Additionally, there is a `MARKER_I` instruction after the `body` to handle `CONTINUE` instructions. We cannot use `FOR_I` as the marker since the copying of the loop variable must be done after a `CONTINUE`.

This is shown in the following inference rules:

$\begin{matrix}
I = \texttt{FOR\_I} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ \texttt{loopVar} \qquad \texttt{loopVar} = \texttt{nil} \\ \hline
(I \ \ldotp C, \texttt{true} \ldotp S, (\Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \\
\rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (I \ldotp \texttt{condition} \ldotp \texttt{update} \ldotp \texttt{MARKER\_I} \ldotp \texttt{body} \ldotp C, S, (\Delta_N, \Delta_S))
\end{matrix}$

$\begin{matrix}
I = \texttt{FOR\_I} \ \texttt{condition} \ \texttt{update} \ \texttt{body} \ \texttt{loopVar} \qquad \texttt{loopVar} = x \neq \texttt{nil} \\ \hline
(I \ \ldotp C, \texttt{true} \ldotp S, (\Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \\
\rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (I \ldotp \texttt{condition} \ldotp \texttt{update} \ldotp \texttt{ASSIGN\_I} \ldotp \texttt{NAME\_ADDRESS} \ x \ldotp \texttt{EXIT\_SCOPE\_I} \ldotp \texttt{NAME} \ x \ldotp \\ \texttt{MARKER\_I} \ldotp \texttt{body} \ldotp C, S, (\Delta_N, \varnothing[x \leftarrow \Delta_S(x)] \ldotp \Delta_S))
\end{matrix}$

:::info

$\varnothing[x \leftarrow \Delta_S(x)] \ldotp \Delta_S$ is the environment frame $\Delta_S$ with a new child frame containing a copy of the variable $x$. After the loop body is executed, the `NAME` instruction retrieves the value of the loop variable from the iteration-scope copy, the `NAME_ADDRESS` instruction (after `EXIT_SCOPE_I`) retrieves the address of the loop variable in the loop-scope frame, and the `ASSIGN_I` instruction assigns the value of the loop variable to the loop-scope frame.

:::

The evaluation of a `MARKER_I` instruction does not produce side effects:

$\begin{matrix}
\hline
(\texttt{MARKER\_I} \ \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (C, S, E)
\end{matrix}$

A `BREAK` instruction will create a `BREAK_I` instruction in the control stack, which pops from the control stack until it pops out the `FOR_I` instruction. On the other hand, a `CONTINUE` instruction will create a `CONTINUE_I` instruction in the control stack, which pops from the control stack until it pops out the `MARKER_I` instruction. All instructions except `EXIT_SCOPE_I` will be ignored during the popping process.

This is shown in the following inference rules:

$\begin{matrix}
\hline
(\texttt{BREAK} \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{BREAK\_I} \ldotp C, S, E)
\end{matrix}$

$\begin{matrix}
I = \texttt{FOR\_I} \\ \hline
(\texttt{BREAK\_I} \ldotp I \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (C, S, E)
\end{matrix}$

$\begin{matrix}
I = \texttt{EXIT\_SCOPE\_I} \\ \hline
(\texttt{BREAK\_I} \ldotp I \ldotp C, S, (F \ldotp \Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{BREAK\_I} \ldotp C, S, (\Delta_N, \Delta_S))
\end{matrix}$

$\begin{matrix}
I \neq \texttt{FOR\_I} \qquad I \neq \texttt{EXIT\_SCOPE\_I} \\ \hline
(\texttt{BREAK\_I} \ldotp I \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{BREAK\_I} \ldotp C, S, E)
\end{matrix}$

$\begin{matrix}
\hline
(\texttt{CONTINUE} \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{CONTINUE\_I} \ldotp C, S, E)
\end{matrix}$

$\begin{matrix}
I = \texttt{MARKER\_I} \\ \hline
(\texttt{CONTINUE\_I} \ldotp I \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (I \ldotp C, S, E) 
\end{matrix}$

$\begin{matrix}
I = \texttt{EXIT\_SCOPE\_I} \\ \hline
(\texttt{CONTINUE\_I} \ldotp I \ldotp C, S, (F \ldotp \Delta_N, \Delta_S)) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{CONTINUE\_I} \ldotp C, S, (\Delta_N, \Delta_S))
\end{matrix}$

$\begin{matrix}
I \neq \texttt{MARKER\_I} \qquad I \neq \texttt{EXIT\_SCOPE\_I} \\ \hline
(\texttt{CONTINUE\_I} \ldotp I \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (\texttt{CONTINUE\_I} \ldotp C, S, E)
\end{matrix}$


#### Go Function Call

A go function call is defined in BNF as follows:

```
GoStmt = "go" FunctionCall
```

When the `GO_CALL_STMT` instruction is executed, a new goroutine is created with the function call. The control stack of the new goroutine contains only the `CALL` instruction $I$, while the stash and environment are copied from the current goroutine.

This is shown in the following inference rules:

$\begin{matrix}
\hline
(\texttt{GO\_CALL\_STMT} \ I \ldotp C, S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp \ldots \ldotp (C, S, E) \ldotp (I, S, E)
\end{matrix}$

#### Mutex Lock and Unlock

Mutex is implemented as a struct, which contains a special heap object as its member. We define a mutex as a tuple $(s, Q)$ where $s$ is the state of the mutex (`true` if locked and `false` if unlocked) and $Q$ is its wait queue (a list of threads, similar to the scheduler).

When `Lock()` is called on a mutex, the mutex is locked and the thread is pushed into the scheduler if it is unlocked. Otherwise, the current thread is added to the wait queue of the mutex.

$\begin{matrix}
M = (\texttt{false}, Q) \\ \hline
(\texttt{CALL\_I} \ 0 \ldotp C, \texttt{sync.MutexLock (builtin)} \ldotp M \ldotp S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp T_{i_3} \ldotp \ldots \ldotp (C, S, E)
\end{matrix}$

where $M$ is replaced with $(\texttt{true}, Q)$.

$\begin{matrix}
M = (\texttt{true}, Q) \\ \hline
(\texttt{CALL\_I} \ 0 \ldotp C, \texttt{sync.MutexLock (builtin)} \ldotp M \ldotp S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp T_{i_3} \ldotp \ldots
\end{matrix}$

where $M$ is replaced with $(\texttt{true}, Q \ldotp (C, S, E))$.

When `Unlock()` is called on a mutex, the mutex is unlocked and the first thread in the wait queue is popped and pushed into the scheduler (if any). It throws an error if the mutex is already unlocked.

$\begin{matrix}
M = (\texttt{true}, T_H \ldotp Q) \\ \hline
(\texttt{CALL\_I} \ 0 \ldotp C, \texttt{sync.MutexUnlock (builtin)} \ldotp M \ldotp S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp T_{i_3} \ldotp \ldots \ldotp (C, S, E) \ldotp T_H
\end{matrix}$

where $M$ is replaced with $(\texttt{false}, Q)$.

$\begin{matrix}
M = (\texttt{true}, \varnothing) \\ \hline
(\texttt{CALL\_I} \ 0 \ldotp C, \texttt{sync.MutexUnlock (builtin)} \ldotp M \ldotp S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S T_{i_2} \ldotp T_{i_3} \ldotp \ldots \ldotp (C, S, E)
\end{matrix}$

where $M$ is replaced with $(\texttt{false}, \varnothing)$.

$\begin{matrix}
M = (\texttt{false}, Q) \\ \hline
(\texttt{CALL\_I} \ 0 \ldotp C, \texttt{sync.MutexUnlock (builtin)} \ldotp M \ldotp S, E) \ldotp T_{i_2} \ldotp \ldots \rightrightarrows_S \varepsilon
\end{matrix}$

where $\varepsilon$ is the error state.

The implementation of channels uses the same idea, except that there is one waiting queue for sending and one waiting queue for receiving. Also, they use specialized instructions `CHAN_SEND_I` and `CHAN_RECEIVE_I` rather than using built-in functions.


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
