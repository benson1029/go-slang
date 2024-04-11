/**
 * CONTROL_select_i
 * Fields    : number of children
 * Children  :
 * - address of select (CONTROL_select)
 */

import { auto_cast } from "../auto_cast";
import { ComplexQueue } from "../complex/queue";
import { ContextScheduler } from "../context/scheduler";
import { ContextThread } from "../context/thread";
import { ContextWaitingInstance } from "../context/waiting_instance";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_CONTROL_select_i } from "../tags";
import { UserChannel } from "../user/channel";
import { UserVariable } from "../user/variable";
import { ControlCase } from "./case";
import { ControlCaseDefault } from "./case_default";
import { ControlCaseReceive } from "./case_receive";
import { ControlSelect } from "./select";

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function generate_random_ordering(num_cases: number): number[] {
  const orderings = new Array<number>(num_cases);
  for (let i = 0; i < num_cases; i++) {
    orderings[i] = i;
  }
  for (let i = num_cases - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j >= i) {
      continue;
    }
    const temp = orderings[i];
    orderings[i] = orderings[j];
    orderings[j] = temp;
  }
  return orderings;
}

class ControlSelectI extends HeapObject {
  private get_select(): ControlSelect {
    return new ControlSelect(this.heap, this.get_child(0));
  }

  private get_case(index: number): ControlCase {
    return this.get_select().get_case(index);
  }

  private get_number_of_cases(): number {
    return this.get_select().get_number_of_cases();
  }

  public select_case(thread: ContextThread, scheduler: ContextScheduler) {
    let case_default = new ControlCaseDefault(
      this.heap,
      PrimitiveNil.allocate()
    );

    let cases_send: {
      channel: UserVariable;
      value_address: HeapObject;
      body: HeapObject;
    }[] = [];

    let cases_recv: {
      channel: UserVariable;
      assign_address: UserVariable;
      body: HeapObject;
    }[] = [];

    for (let i = 0; i < this.get_number_of_cases(); i++) {
      const control_case = this.get_case(i);
      if (control_case.is_default()) {
        case_default = control_case;
        continue;
      }

      const user_channel_variable_address = thread.stash().pop();
      const user_channel_variable = new UserVariable(
        this.heap,
        user_channel_variable_address
      );
      const body = control_case.get_body_address().reference();

      if (control_case.is_send()) {
        const value_address = thread.stash().pop();
        const value = auto_cast(this.heap, value_address);
        cases_send.push({
          channel: user_channel_variable,
          value_address: value,
          body: body,
        });
      } else if (control_case.is_receive()) {
        let assign_address = PrimitiveNil.allocate();
        if (
          !(control_case as ControlCaseReceive).get_assign_address().is_nil()
        ) {
          assign_address = thread.stash().pop();
        }
        const assign = new UserVariable(this.heap, assign_address);
        cases_recv.push({
          channel: user_channel_variable,
          assign_address: assign,
          body: body,
        });
      } else {
        throw new Error("ControlSelectI.select_case: unknown case type");
      }
    }

    // We need to free cases_send[] and cases_recv[] after
    const deferred_free = () => {
      for (let i = 0; i < cases_send.length; i++) {
        cases_send[i].channel.free();
        cases_send[i].value_address.free();
        cases_send[i].body.free();
      }
      for (let i = 0; i < cases_recv.length; i++) {
        cases_recv[i].channel.free();
        cases_recv[i].assign_address.free();
        cases_recv[i].body.free();
      }
    };

    // Get a random orderings of the cases
    const num_cases = cases_send.length + cases_recv.length;
    const orderings = generate_random_ordering(num_cases);

    // In random order, check if any of the cases are ready
    let waitingQueues: ComplexQueue[] = [];
    for (let i = 0; i < num_cases; i++) {
      const ordering = orderings[i];
      if (ordering < cases_send.length) {
        const variable = cases_send[ordering].channel;
        const value = cases_send[ordering].value_address;
        const body = cases_send[ordering].body;

        const channel = variable.get_value() as UserChannel;
        const try_send = channel.try_send(thread, scheduler, value);

        if (try_send.success) {
          thread.control().push(body.address);
          scheduler.enqueue(thread);
          deferred_free();
          return;
        } else {
          waitingQueues.push(try_send.waitingQueue);
        }
      } else {
        const ordering_recv = ordering - cases_send.length;
        console.log("recv", ordering_recv);
        const variable = cases_recv[ordering_recv].channel;
        const assign = cases_recv[ordering_recv].assign_address;
        const body = cases_recv[ordering_recv].body;

        const channel = variable.get_value() as UserChannel;
        const try_recv = channel.try_recv(thread, scheduler, assign);

        if (try_recv.success) {
          thread.control().push(body.address);
          scheduler.enqueue(thread);
          deferred_free();
          return;
        } else {
          waitingQueues.push(try_recv.waitingQueue);
        }
      }
    }

    // No cases are ready
    // If there is a default case, push it to the control stack
    if (!case_default.is_nil()) {
      thread.control().push(case_default.get_body_address().address);
      scheduler.enqueue(thread);
      deferred_free();
      return;
    }

    // Otherwise, wait until a case is ready
    const waker = thread.createWaker();
    for (let i = 0; i < num_cases; i++) {
      const waitingQueue = waitingQueues[i];
      const ordering = orderings[i];

      const waiting_instance = new ContextWaitingInstance(
        this.heap,
        ContextWaitingInstance.allocate(this.heap, waker)
      );

      if (ordering < cases_send.length) {
        const value = cases_send[ordering].value_address;
        const body = cases_send[ordering].body;

        waiting_instance.set_value(value);
        waiting_instance.set_body(body);
      } else {
        const ordering_recv = ordering - cases_send.length;
        const assign = cases_recv[ordering_recv].assign_address;
        const body = cases_recv[ordering_recv].body;

        waiting_instance.set_assign(assign);
        waiting_instance.set_body(body);
      }

      waitingQueue.enqueue(waiting_instance);
      waiting_instance.free();
    }

    // we don't enqueue the thread, because it needs to wait
    waker.free();
    deferred_free();
    return;
  }

  public static allocate(heap: any, select: ControlSelect): number {
    const address = heap.allocate_object(TAG_CONTROL_select_i, 1, 1);
    heap.set_child(address, 0, select.reference().address);
    return address;
  }
}

export { ControlSelectI };
