import { Heap } from '../../heap';
import { auto_cast } from '../../heap/types/auto_cast';
import { ComplexArray } from '../../heap/types/complex/array';
import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { ControlIndex } from '../../heap/types/control';
import { ControlIndexAddress } from '../../heap/types/control/index_address';
import { PrimitiveInt32 } from '../../heap/types/primitive/int32';
import { UserVariable } from '../../heap/types/user/variable';

function evaluate_index(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlIndex(heap, cmd);
    const array = cmd_object.get_array();
    const index = cmd_object.get_index();
    const index_i_cmd = heap.allocate_any({ tag: "index_i" });
    C.push(index_i_cmd);
    C.push(array.address);
    C.push(index.address);
    heap.free_object(index_i_cmd);
}

function evaluate_index_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const array = auto_cast(heap, S.pop()) as ComplexArray;
    const index = auto_cast(heap, S.pop()) as PrimitiveInt32;
    const variable = array.get_value_address(index.get_value()) as UserVariable;
    const value = variable.get_value();
    S.push(value.address);
    array.free();
    index.free();
}

function evaluate_index_address(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlIndexAddress(heap, cmd);
    const array = cmd_object.get_array();
    const index = cmd_object.get_index();
    const index_i_cmd = heap.allocate_any({ tag: "index_address_i" });
    C.push(index_i_cmd);
    C.push(array.address);
    C.push(index.address);
    heap.free_object(index_i_cmd);
}

function evaluate_index_address_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const array_variable = auto_cast(heap, S.pop()) as UserVariable;
    const array = array_variable.get_value() as ComplexArray;
    const index = auto_cast(heap, S.pop()) as PrimitiveInt32;
    const variable = array.get_value_address(index.get_value()) as UserVariable;
    S.push(variable.address);
    array_variable.free();
    index.free();
}

export {
    evaluate_index,
    evaluate_index_i,
    evaluate_index_address,
    evaluate_index_address_i,
}