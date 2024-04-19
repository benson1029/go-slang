import { Heap } from "../../../heap";
import { auto_cast } from "../../../heap/types/auto_cast";
import { ComplexFunction } from "../../../heap/types/complex/function";
import { ContextScheduler } from "../../../heap/types/context/scheduler";
import { ContextThread } from "../../../heap/types/context/thread";
import { ControlGoCallI } from "../../../heap/types/control/go_call_i";
import { ControlGoCallStmt } from "../../../heap/types/control/go_call_stmt";
import { TAG_COMPLEX_method } from "../../../heap/types/tags";
import { UserStruct } from "../../../heap/types/user/struct";

function evaluate_go_call_stmt(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const C = thread.control();
  const cmd_object_go = auto_cast(heap, cmd) as ControlGoCallStmt;
  const cmd_object = cmd_object_go.get_body_address();

  const function_object = cmd_object.get_func_address();

  const call_i_cmd = heap.allocate_any({
    tag: "go_call_i",
    num_args: cmd_object.get_number_of_args(),
  });

  C.push(call_i_cmd);
  heap.free_object(call_i_cmd);

  for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
    const arg = cmd_object.get_arg_address(i);
    C.push(arg.address);
  }

  C.push(function_object.address);
  scheduler.enqueue(thread);
}

function evaluate_go_call_i(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlGoCallI;

  // The spawned thread runs the goroutine.
  const call_i_cmd = heap.allocate_any({
    tag: "call_i",
    num_args: cmd_object.get_number_of_args(),
  });
  const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });
  const forked_thread = thread.fork();
  forked_thread.control().clear();
  forked_thread.control().push(pop_i_cmd);
  forked_thread.control().push(call_i_cmd);
  scheduler.enqueue(forked_thread);
  forked_thread.free();
  heap.free_object(call_i_cmd);
  heap.free_object(pop_i_cmd);

  // The original thread pops the arguments and the function object.
  {
    // Pop arguments from the stash
    let args = [];
    for (let i = 0; i < cmd_object.get_number_of_args(); i++) {
      args.push(thread.stash().pop());
    }
    const function_object = auto_cast(
      heap,
      thread.stash().pop()
    ) as ComplexFunction;
    const deferred_free = () => {
      function_object.free();
      for (let arg of args) {
        heap.free_object(arg);
      }
    };
    deferred_free();
    if (function_object.get_tag() === TAG_COMPLEX_method) {
      const self = auto_cast(heap, thread.stash().pop()) as UserStruct;
      self.free();
    }
    scheduler.enqueue(thread);
  }
}

export { evaluate_go_call_stmt, evaluate_go_call_i };
