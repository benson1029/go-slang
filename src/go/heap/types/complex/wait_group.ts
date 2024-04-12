/**
 * COMPLEX_wait_group
 * Fields    :
 * - number of children
 * - value of the wait group
 * Children  :
 * - address to a queue of CONTEXT_waker
 */

import { Heap } from "../../heap";
import { ContextScheduler } from "../context/scheduler";
import { ContextThread } from "../context/thread";
import { ContextWaker } from "../context/waker";
import { HeapObject } from "../objects";
import { TAG_COMPLEX_wait_group } from "../tags";
import { ComplexQueue } from "./queue";

class ComplexWaitGroup extends HeapObject {
    private get_queue(): ComplexQueue {
        return new ComplexQueue(this.heap, this.get_child(0));
    }

    private get_value(): number {
        return this.get_field(1);
    }

    private set_value(value: number): void {
        this.set_field(1, value);
    }

    public add(delta: number, scheduler: ContextScheduler): void {
        if (delta < 0 && this.get_value() < -delta) {
            throw new Error("negative wait group counter");
        }
        this.set_value(this.get_value() + delta);
        if (this.get_value() === 0) {
            this.wake(scheduler);
        }
    }

    public wait(thread: ContextThread, scheduler: ContextScheduler): void {
        if (this.get_value() > 0) {
            const waker = thread.createWaker();
            this.get_queue().enqueue(waker);
            waker.free();
        } else {
            scheduler.enqueue(thread);
        }
    }

    private wake(scheduler: ContextScheduler): void {
        while (this.get_queue().length() > 0) {
            const waker = this.get_queue().dequeue() as ContextWaker;
            waker.wake(scheduler);
            waker.free();
        }
    }

    public static allocate(heap: Heap, value: number): number {
        const address = heap.allocate_object(TAG_COMPLEX_wait_group, 2, 1);

        const queue_address = ComplexQueue.allocate(heap);
        heap.set_child(address, 0, queue_address);
        heap.set_field(address, 1, value);

        return address;
    }

    public to_object(): any {
        return "wait group (" + this.get_value() + ")";
    }
}

export { ComplexWaitGroup };
