import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { Heap } from '../../heap';
import { ControlIf } from '../../heap/types/control/if';
import { ControlIfI } from '../../heap/types/control/if_i';
import { auto_cast } from '../../heap/types/auto_cast';
import { PrimitiveBool } from '../../heap/types/primitive/bool';

function evaluate_if(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlIf(heap, cmd);
    const condition = cmd_object.get_condition_address();
    const then_body = cmd_object.get_then_body_address();
    const else_body = cmd_object.get_else_body_address();
    const if_i_cmd = heap.allocate_any({
        tag: "if_i",
        condition: condition.address,
        then_body: then_body,
        else_body: else_body,
    });
    C.push(if_i_cmd);
    C.push(condition.address);
    heap.free_object(if_i_cmd);
}

function evaluate_if_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlIfI(heap, cmd);
    const then_body = cmd_object.get_then_body_address();
    const else_body = cmd_object.get_else_body_address();
    const condition_value = auto_cast(heap, S.pop()) as unknown as PrimitiveBool;
    if (condition_value.get_value()) {
        C.push(then_body.address);
    } else {
        C.push(else_body.address);
    }
    condition_value.free();
}

export {
    evaluate_if,
    evaluate_if_i,
};
