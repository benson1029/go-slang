/**
 * CONTROL_select_i
 */

import { ContextScheduler } from "../context/scheduler";
import { ContextThread } from "../context/thread";
import { ContextWaitingInstance } from "../context/waiting_instance";
import { HeapObject } from "../objects";
import { UserChannel } from "../user/channel";

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function generate_random_ordering(num_cases: number): number[] {
  const orderings = new Array<number>(num_cases);
  for (let i = 0; i < num_cases; i++) {
    orderings[i] = i;
  }
  for (let i = orderings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = orderings[i];
    orderings[i] = orderings[j];
    orderings[j] = temp;
  }
  return orderings;
}

class ControlSelectI extends HeapObject {
  public select_case(
    thread: ContextThread,
    scheduler: ContextScheduler,
    default_case_body: HeapObject,
    send_case_channels: UserChannel[],
    send_case_values: HeapObject[],
    send_case_bodies: HeapObject[],
    recv_case_channels: UserChannel[],
    recv_case_bodies: HeapObject[]
  ) {
    // First, get a random orderings of the cases
    const num_cases = send_case_channels.length + recv_case_channels.length;
    const orderings = generate_random_ordering(num_cases);

    // In random order, check if any of the cases are ready
    for (let i = 0; i < num_cases; i++) {
      const ordering = orderings[i];
      if (ordering < send_case_channels.length) {
        const channel = send_case_channels[ordering];
        const value = send_case_values[ordering];
        const body = send_case_bodies[ordering];

        const try_send = channel.try_send(thread, scheduler, value);
        if (try_send.success) {
          thread.control().push(body.address);
          scheduler.enqueue(thread);
          return;
        }
      } else {
        const channel =
          recv_case_channels[ordering - send_case_channels.length];
        const body = recv_case_bodies[ordering - send_case_channels.length];

        const try_recv = channel.try_recv(thread, scheduler);
        if (try_recv.success) {
          thread.control().push(body.address);
          scheduler.enqueue(thread);
          return;
        }
      }
    }

    // No cases are ready
    // If there is a default case, push it to the control stack
    if (!default_case_body.is_nil()) {
      thread.control().push(default_case_body.address);
      scheduler.enqueue(thread);
      return;
    }

    // Otherwise, wait until a case is ready
    const waker = thread.createWaker();

    for (let i = 0; i < send_case_channels.length; i++) {
      const try_send = send_case_channels[i].try_send(
        thread,
        scheduler,
        send_case_values[i]
      );
      if (try_send.success) {
        throw new Error(
          "ControlSelectI.select_case: try_send should not be successful"
        );
      }

      const waiting_instance = new ContextWaitingInstance(
        this.heap,
        ContextWaitingInstance.allocate(this.heap, waker)
      );

      waiting_instance.set_value(send_case_values[i]);
      waiting_instance.set_body(send_case_bodies[i]);
      try_send.waitingQueue.enqueue(waiting_instance);

      waiting_instance.free();
    }

    for (let i = 0; i < recv_case_channels.length; i++) {
      const try_recv = recv_case_channels[i].try_recv(thread, scheduler);
      if (try_recv.success) {
        throw new Error(
          "ControlSelectI.select_case: try_recv should not be successful"
        );
      }

      const waiting_instance = new ContextWaitingInstance(
        this.heap,
        ContextWaitingInstance.allocate(this.heap, waker)
      );

      waiting_instance.set_body(recv_case_bodies[i]);
      try_recv.waitingQueue.enqueue(waiting_instance);

      waiting_instance.free();
    }

    // we don't enqueue the thread, because it needs to wait
    waker.free();
    return;
  }
}

export { ControlSelectI };
