import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';
import { ControlBlock } from '../../heap/types/control/block';

function evaluate_block(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlBlock(heap, cmd);
    const body = cmd_object.get_body_address().reference();
    const env = E.get_frame();
    const exit_scope_cmd = heap.allocate_any({ tag: "exit-scope_i" });
    E.set_frame(env.push_frame());
    C.push(exit_scope_cmd);
    C.push(body.address);
}

function evaluate_exit_scope_i(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const env = E.get_frame();
    E.set_frame(env.pop_frame());
}

export {
    evaluate_block,
    evaluate_exit_scope_i,
};
