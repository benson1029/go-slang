import { Heap } from "../../../heap";
import { auto_cast } from "../../../heap/types/auto_cast";
import { ContextScheduler } from "../../../heap/types/context/scheduler";
import { ContextThread } from "../../../heap/types/context/thread";
import { ControlCaseReceive } from "../../../heap/types/control/case_receive";
import { ControlCaseSend } from "../../../heap/types/control/case_send";
import { ControlSelect } from "../../../heap/types/control/select";
import { ControlSelectI } from "../../../heap/types/control/select_i";

function evaluate_select(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlSelect;

  const pop_i_cmd = heap.allocate_any({ tag: "pop_i" });
  const select_i = ControlSelectI.allocate(heap, cmd_object);

  thread.control().push(pop_i_cmd);
  thread.control().push(select_i);

  heap.free_object(pop_i_cmd);
  heap.free_object(select_i);

  for (let i = 0; i < cmd_object.get_number_of_cases(); i++) {
    const control_case = cmd_object.get_case(i);
    if (control_case.is_default()) {
      // do nothing
    } else if (control_case.is_send()) {
      const control_case_send = control_case as ControlCaseSend;
      thread.control().push(control_case_send.get_channel_address().address);
      thread.control().push(control_case_send.get_value_address().address);
    } else if (control_case.is_receive()) {
      const control_case_receive = control_case as ControlCaseReceive;
      thread.control().push(control_case_receive.get_channel_address().address);
      if (!control_case_receive.get_assign_address().is_nil()) {
        thread
          .control()
          .push(control_case_receive.get_assign_address().address);
      }
    } else {
      throw new Error("evaluate_select: invalid control case");
    }
  }

  scheduler.enqueue(thread);
}

function evaluate_select_i(
  cmd: number,
  heap: Heap,
  thread: ContextThread,
  scheduler: ContextScheduler
) {
  const cmd_object = auto_cast(heap, cmd) as ControlSelectI;
  cmd_object.select_case(thread, scheduler);
}

export { evaluate_select, evaluate_select_i };
