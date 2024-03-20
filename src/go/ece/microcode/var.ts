import { Heap } from "../../heap";
import { auto_cast } from "../../heap/types/auto_cast";
import { ControlAssign } from "../../heap/types/control/assign";
import { ControlAssignI } from "../../heap/types/control/assign_i";
import { ControlName } from "../../heap/types/control/name";
import { ControlVar } from "../../heap/types/control/var";
import { ControlVarI } from "../../heap/types/control/var_i";
import { Primitive } from "../../heap/types/primitive";
import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';

function evaluate_var(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const var_object = new ControlVar(heap, cmd);
    const expression = var_object.get_expression().reference();
    const var_i_addr = heap.allocate_any({ tag: "var_i", name: var_object.get_name_address() });
    C.push(var_i_addr);
    C.push(expression.address);
}

function evaluate_var_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const var_i_object = new ControlVarI(heap, cmd);
    const name = var_i_object.get_name_address();
    E.get_frame().insert_new_variable(name.address);
    const value = auto_cast(heap, S.pop()) as unknown as Primitive;
    E.get_frame().set_variable_value_address(name.address, value.address);
    S.push(value.address);
}

function evaluate_name(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const name_object = new ControlName(heap, cmd);
    const name = name_object.get_name_address();
    const value = E.get_frame().get_variable_value_address(name.address).reference();
    S.push(value.address);
}

function evaluate_assign(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const assign_object = new ControlAssign(heap, cmd);
    const expression = assign_object.get_expression().reference();
    const assign_i_addr = heap.allocate_any({ tag: "assign_i", name: assign_object.get_name_address() });
    C.push(assign_i_addr);
    C.push(expression.address);
}

function evaluate_assign_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const assign_i_object = new ControlAssignI(heap, cmd);
    const name = assign_i_object.get_name_address();
    const value = auto_cast(heap, S.pop()) as unknown as Primitive;
    E.get_frame().set_variable_value_address(name.address, value.address);
    S.push(value.address);
}

export {
    evaluate_var,
    evaluate_var_i,
    evaluate_name,
    evaluate_assign,
    evaluate_assign_i,
};
