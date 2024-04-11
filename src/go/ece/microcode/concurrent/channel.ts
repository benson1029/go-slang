import { Heap } from "../../../heap";
import { auto_cast } from "../../../heap/types/auto_cast";
import { ContextScheduler } from "../../../heap/types/context/scheduler";
import { ContextThread } from "../../../heap/types/context/thread";
import { ControlChanReceive } from "../../../heap/types/control/chan_receive";
import { ControlChanReceiveI } from "../../../heap/types/control/chan_receive_i";
import { ControlChanReceiveStmt } from "../../../heap/types/control/chan_receive_stmt";
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

  const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });
  const chan_send_i = ControlChanSendI.allocate(heap);

  thread.control().push(pop_i_cmd);
  thread.control().push(chan_send_i);

  heap.free_object(pop_i_cmd);
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

function evaluate_chan_receive(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlChanReceive;
  const name = cmd_object.get_name_address();

  const chan_receive_i = ControlChanReceiveI.allocate(heap);
  thread.control().push(chan_receive_i);
  heap.free_object(chan_receive_i);

  thread.control().push(name.address);

  scheduler.enqueue(thread);
}

function evaluate_chan_receive_stmt(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlChanReceiveStmt;
  const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });

  thread.control().push(pop_i_cmd);
  thread.control().push(cmd_object.get_body_address().address);

  heap.free_object(pop_i_cmd);

  scheduler.enqueue(thread);
}

function evaluate_chan_receive_i(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const name = auto_cast(heap, thread.stash().pop()) as UserVariable;

  if (name.get_value().is_nil()) {
    throw new Error("evaluate_chan_receive_i: nil channel");
  }

  // Note: receive() is responsible for enqueueing the thread.
  (name.get_value() as UserChannel).recv(
    thread,
    scheduler,
    new UserVariable(heap, PrimitiveNil.allocate()),
    PrimitiveNil.allocate_default(heap)
  );

  name.free();
}

export {
  evaluate_chan_send,
  evaluate_chan_send_i,
  evaluate_chan_receive,
  evaluate_chan_receive_stmt,
  evaluate_chan_receive_i,
};
