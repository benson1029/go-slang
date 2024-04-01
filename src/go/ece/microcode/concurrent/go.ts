import { Heap } from "../../../heap";
import { auto_cast } from "../../../heap/types/auto_cast";
import { ContextScheduler } from "../../../heap/types/context/scheduler";
import { ContextThread } from "../../../heap/types/context/thread";
import { ControlGoCallStmt } from "../../../heap/types/control/go_call_stmt";

function evaluate_go_call_stmt(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlGoCallStmt;
  const forked_cmd = cmd_object.get_body_address();

  // The original thread does nothing.
  scheduler.enqueue(thread);

  // The new thread runs the goroutine.
  const forked_thread = thread.fork();
  forked_thread.control().clear();
  forked_thread.control().push(forked_cmd.address);
  scheduler.enqueue(forked_thread);
  forked_thread.free();
}

export { evaluate_go_call_stmt };
