import { Control } from '../control';
import { Stash } from '../stash';
import { Env } from '../env';
import { Heap } from '../../heap';
import { ControlFor } from '../../heap/types/control/for';
import { PrimitiveBool } from '../../heap/types/primitive/bool';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlForI } from '../../heap/types/control/for_i';
import { TAG_CONTROL_for_i } from '../../heap/types/tags';

function evaluate_for(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlFor(heap, cmd);

    // Start a new scope
    const env = E.get_frame();
    E.set_frame(env.push_frame());
    const exit_scope_cmd = heap.allocate_any({ tag: "exit-scope_i" });
    C.push(exit_scope_cmd);

    // Push for loop body
    const for_i_cmd = heap.allocate_any({
        tag: "for_i",
        condition: cmd_object.get_condition_address(),
        update: cmd_object.get_update_address(),
        body: cmd_object.get_body_address(),
    });
    C.push(for_i_cmd);

    // Push the condition
    const condition = cmd_object.get_condition_address().reference();
    C.push(condition.address);

    // Evaluate the initializer
    const init = cmd_object.get_init_address().reference();
    C.push(init.address);
}

function evaluate_for_i(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlForI(heap, cmd);
    const condition = cmd_object.get_condition_address().reference();
    const update = cmd_object.get_update_address().reference();
    const body = cmd_object.get_body_address().reference();

    const condition_value = auto_cast(heap, S.pop()) as unknown as PrimitiveBool;
    if (condition_value.get_value()) {
        // Do one iteration
        C.push(cmd_object.reference().address);
        C.push(condition.address);
        C.push(update.address);
        C.push(body.address);
    } else {
        // Do nothing to terminate the loop
    }
}

function evaluate_break(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlForI(heap, cmd);
    const top_cmd = auto_cast(heap, C.pop());
    if (top_cmd.get_tag() === TAG_CONTROL_for_i) {
        // Do nothing to finish the breaking
    } else {
        C.push(cmd_object.reference().address);
    }
}

function evaluate_continue(cmd: number, heap: Heap, C: Control, S: Stash, E: Env): void {
    const cmd_object = new ControlForI(heap, cmd);
    const top_cmd = auto_cast(heap, C.pop());
    if (top_cmd.get_tag() === TAG_CONTROL_for_i) {
        const for_i_cmd = top_cmd as ControlForI;
        C.push(for_i_cmd.reference().address);
        C.push(for_i_cmd.get_condition_address().reference().address);
        C.push(for_i_cmd.get_update_address().reference().address);
    } else {
        C.push(cmd_object.reference().address);
    }
}

export {
    evaluate_for,
    evaluate_for_i,
    evaluate_break,
    evaluate_continue,
};