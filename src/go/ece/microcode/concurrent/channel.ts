import { Heap } from "../../../heap";
import { auto_cast } from "../../../heap/types/auto_cast";
import { ContextScheduler } from "../../../heap/types/context/scheduler";
import { ContextThread } from "../../../heap/types/context/thread";
import { ControlChanSend } from "../../../heap/types/control/chan_send";
import { ControlChanSendI } from "../../../heap/types/control/chan_send_i";
import { PrimitiveNil } from "../../../heap/types/primitive/nil";
import { UserChannel } from "../../../heap/types/user/channel";
import { UserVariable } from "../../../heap/types/user/variable";

function evaluate_chan_send(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlChanSend;
  const name = cmd_object.get_name_address();
  const value = cmd_object.get_value_address();

  const chan_send_i = ControlChanSendI.allocate(heap);
  thread.control().push(chan_send_i);
  heap.free_object(chan_send_i);

  thread.control().push(name.address);
  thread.control().push(value.address);

  scheduler.enqueue(thread);
}

function evaluate_chan_send_i(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const name = auto_cast(heap, thread.stash().pop()) as UserVariable;
  const value = auto_cast(heap, thread.stash().pop());

  console.log(name.stringify())

  if (name.get_value().is_nil()) {
    throw new Error("evaluate_chan_send_i: nil channel");
  }

  // Note: send() is responsible for enqueueing the thread.
  (name.get_value() as UserChannel).send(
    thread,
    scheduler,
    value,
    PrimitiveNil.allocate_default(heap)
  );

  name.free();
  value.free();
}

export { evaluate_chan_send, evaluate_chan_send_i };
