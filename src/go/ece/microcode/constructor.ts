import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { Heap } from '../../heap';
import { ControlMake } from '../../heap/types/control/make';
import { auto_cast } from '../../heap/types/auto_cast';
import { TAG_USER_type_array, TAG_USER_type_function } from '../../heap/types/tags';
import { ComplexArray } from '../../heap/types/complex/array';
import { UserTypeArray } from '../../heap/types/user/type/array';
import { UserVariable } from '../../heap/types/user/variable';
import { ControlConstructor } from '../../heap/types/control/constructor';

function evaluate_make(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const make_cmd = auto_cast(heap, cmd) as ControlMake;
    const type = make_cmd.get_type();

    switch (type.get_tag()) {
        case TAG_USER_type_array: {
            const type_casted = type as UserTypeArray;
            const array = auto_cast(heap, ComplexArray.allocate(heap, type_casted.get_length())) as ComplexArray;
            for (let i = 0; i < type_casted.get_length(); i++) {
                const variable = auto_cast(heap, UserVariable.allocate_nil(heap)) as UserVariable;
                type_casted.get_inner_type().construct_default(variable);
                array.set_value_address(i, variable);
                variable.free();
            }
            S.push(array.address);
            array.free();
            break;
        }
        case TAG_USER_type_function:
            const nil_address = heap.allocate_any(null);
            S.push(nil_address);
            heap.free_object(nil_address);
            break;
        default:
            throw new Error("evaluate_make: Invalid type");
    }
}

function evaluate_constructor(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const constructor_cmd = auto_cast(heap, cmd) as ControlConstructor;

    const constructor_i_cmd = heap.allocate_any({
        tag: "constructor_i",
        type: constructor_cmd.get_type(),
        num_args: constructor_cmd.get_number_of_arguments(),
    })
    C.push(constructor_i_cmd);

    for (let i = 0; i < constructor_cmd.get_number_of_arguments(); i++) {
        C.push(constructor_cmd.get_argument(i).address);
    }

    heap.free_object(constructor_i_cmd);
}

function evaluate_constructor_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const constructor_i_cmd = auto_cast(heap, cmd) as ControlConstructor;
    const type = constructor_i_cmd.get_type();

    switch (type.get_tag()) {
        case TAG_USER_type_array: {
            const type_casted = type as UserTypeArray;
            if (constructor_i_cmd.get_number_of_arguments() !== type_casted.get_length()) {
                throw new Error("evaluate_constructor_i: Invalid number of arguments");
            }
            const array = auto_cast(heap, ComplexArray.allocate(heap, type_casted.get_length())) as ComplexArray;
            for (let i = 0; i < type_casted.get_length(); i++) {
                const value = auto_cast(heap, S.pop());
                const variable = auto_cast(heap, UserVariable.allocate_nil(heap)) as UserVariable;
                variable.set_value(value);
                array.set_value_address(i, variable);
                value.free();
                variable.free();
            }
            S.push(array.address);
            array.free();
            break;
        }
        default:
            throw new Error("evaluate_constructor_i: Invalid type");
    }
}

export {
    evaluate_make,
    evaluate_constructor,
    evaluate_constructor_i,
};