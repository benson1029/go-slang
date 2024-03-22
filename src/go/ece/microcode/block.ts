
import { Heap } from '../../heap';
import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { ControlBlock } from '../../heap/types/control/block';

function evaluate_block(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlBlock(heap, cmd);
    const body = cmd_object.get_body_address();
    const exit_scope_cmd = heap.allocate_any({ tag: "exit-scope_i" });
    E.push_frame();
    C.push(exit_scope_cmd);
    C.push(body.address);
    heap.free_object(exit_scope_cmd);
}

function evaluate_exit_scope_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    E.pop_frame();
}

export {
    evaluate_block,
    evaluate_exit_scope_i,
};
