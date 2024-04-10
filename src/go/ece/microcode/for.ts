import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlFor } from '../../heap/types/control/for';
import { PrimitiveBool } from '../../heap/types/primitive/bool';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlForI } from '../../heap/types/control/for_i';
import { TAG_COMPLEX_string, TAG_CONTROL_exit_scope_i, TAG_CONTROL_for_i, TAG_CONTROL_marker_i, TAG_CONTROL_var } from '../../heap/types/tags';
import { ControlVar } from '../../heap/types/control/var';
import { ComplexString } from '../../heap/types/complex/string';

function evaluate_for(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlFor(heap, cmd);

    // Start a new scope
    E.push_frame();
    const exit_scope_cmd = heap.allocate_any({ tag: "exit-scope_i" });
    C.push(exit_scope_cmd);
    heap.free_object(exit_scope_cmd);

    // Push for loop body
    const init_obj = cmd_object.get_init_address();
    let loopVar;
    if (init_obj.get_tag() === TAG_CONTROL_var) {
        const var_cmd = init_obj as ControlVar;
        loopVar = var_cmd.get_name_address();
    } else {
        loopVar = auto_cast(heap, 0);
    }
    const for_i_cmd = heap.allocate_any({
        tag: "for_i",
        condition: cmd_object.get_condition_address(),
        update: cmd_object.get_update_address(),
        body: cmd_object.get_body_address(),
        loopVar: loopVar,
    });
    C.push(for_i_cmd);
    heap.free_object(for_i_cmd);

    // Push the condition
    const condition = cmd_object.get_condition_address();
    C.push(condition.address);

    // Evaluate the initializer
    const init = cmd_object.get_init_address();
    C.push(init.address);
}

function evaluate_for_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlForI(heap, cmd);
    const condition = cmd_object.get_condition_address();
    const update = cmd_object.get_update_address();
    const body = cmd_object.get_body_address();
    const loopVar = cmd_object.get_loop_var();

    const condition_value = auto_cast(heap, S.pop()) as unknown as PrimitiveBool;
    if (condition_value.get_value()) {
        // Do one iteration
        C.push(cmd_object.address);
        C.push(condition.address);
        C.push(update.address);

        if (loopVar.get_tag() === TAG_COMPLEX_string) {
            // Copy the loop variable into a new scope
            const variable = E.get_frame().get_variable_address(loopVar.address);
            const value = variable.get_value();
            E.push_frame();
            E.get_frame().insert_new_variable(loopVar.address);
            E.get_frame().get_variable_address(loopVar.address).set_value(value);
            const assign_i_cmd = heap.allocate_any({ tag: "assign_i" });
            C.push(assign_i_cmd);
            heap.free_object(assign_i_cmd);
            const name_address_cmd = heap.allocate_any({ tag: "name-address", name: (loopVar as ComplexString).get_string() });
            C.push(name_address_cmd);
            heap.free_object(name_address_cmd);
            const exit_scope_cmd = heap.allocate_any({ tag: "exit-scope_i" });
            C.push(exit_scope_cmd);
            heap.free_object(exit_scope_cmd);
            const name_cmd = heap.allocate_any({ tag: "name", name: (loopVar as ComplexString).get_string() });
            C.push(name_cmd);
            heap.free_object(name_cmd);
            const marker_cmd = heap.allocate_any({ tag: "marker_i" });
            C.push(marker_cmd);
            heap.free_object(marker_cmd);
        }

        C.push(body.address);
    } else {
        // Do nothing to terminate the loop
    }
    condition_value.free();
}

function evaluate_break(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlForI(heap, cmd);
    const top_cmd = auto_cast(heap, C.pop());
    if (top_cmd.get_tag() === TAG_CONTROL_for_i) {
        // Do nothing to finish the breaking
    } else {
        if (top_cmd.get_tag() === TAG_CONTROL_exit_scope_i) {
            E.pop_frame();
        }
        C.push(cmd_object.address);
    }
    top_cmd.free();
}

function evaluate_continue(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlForI(heap, cmd);
    const top_cmd = auto_cast(heap, C.pop());
    if (top_cmd.get_tag() === TAG_CONTROL_marker_i) {
        // Do nothing to finish the continuing
    } else {
        if (top_cmd.get_tag() === TAG_CONTROL_exit_scope_i) {
            E.pop_frame();
        }
        C.push(cmd_object.address);
    }
    top_cmd.free();
}

export {
    evaluate_for,
    evaluate_for_i,
    evaluate_break,
    evaluate_continue,
};