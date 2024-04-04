import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { Heap } from '../../heap';
import { auto_cast } from '../../heap/types/auto_cast';
import { TAG_USER_type_array, TAG_USER_type_channel, TAG_USER_type_function, TAG_USER_type_slice, TAG_USER_type_struct_decl } from '../../heap/types/tags';
import { ComplexArray } from '../../heap/types/complex/array';
import { UserTypeArray } from '../../heap/types/user/type/array';
import { UserVariable } from '../../heap/types/user/variable';
import { ControlConstructor } from '../../heap/types/control/constructor';
import { UserTypeStructDecl } from '../../heap/types/user/type/struct_decl';
import { UserTypeStruct } from '../../heap/types/user/type/struct';
import { UserStruct } from '../../heap/types/user/struct';
import { ControlDefaultMake } from '../../heap/types/control/default_make';
import { ControlMake } from '../../heap/types/control/make';
import { ControlMakeI } from '../../heap/types/control/make_i';
import { PrimitiveInt32 } from '../../heap/types/primitive/int32';
import { UserChannel } from '../../heap/types/user/channel';

function evaluate_default_make(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const make_cmd = auto_cast(heap, cmd) as ControlDefaultMake;
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
        case TAG_USER_type_function: {
            const nil_address = heap.allocate_any(null);
            S.push(nil_address);
            heap.free_object(nil_address);
            break;
        }
        case TAG_USER_type_struct_decl: {
            const struct_decl = type as UserTypeStructDecl;
            const struct = E.get_struct_frame().get_variable_address(struct_decl.get_name().address).get_value() as UserTypeStruct;
            const struct_val = UserStruct.allocate(heap, struct);
            S.push(struct_val);
            heap.free_object(struct_val);
            break;
        }
        case TAG_USER_type_channel: {
            const nil_address = heap.allocate_any(null);
            S.push(nil_address);
            heap.free_object(nil_address);
            break;
        }
        default: {
            throw new Error("evaluate_default_make: Invalid type");
        }
    }
}

function evaluate_make(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const make_cmd = auto_cast(heap, cmd) as ControlMake;

    const make_i_cmd = heap.allocate_any({
        tag: "make_i",
        type: make_cmd.get_type(),
        num_args: make_cmd.get_number_of_args(),
    });
    C.push(make_i_cmd);
    heap.free_object(make_i_cmd);

    for (let i = 0; i < make_cmd.get_number_of_args(); i++) {
        C.push(make_cmd.get_arg_address(i).address);
    }
}

function evaluate_make_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const make_cmd = auto_cast(heap, cmd) as ControlMakeI;
    const type = make_cmd.get_type();
    const num_args = make_cmd.get_number_of_arguments();

    switch (type.get_tag()) {
        case TAG_USER_type_channel: {
            if (num_args > 1) {
                throw new Error("evaluate_make: channel expects 1 or 2 arguments");
            }
            let buffer_size: number;
            if (num_args === 0) {
                buffer_size = 0;
            } else {
                const buffer_size_value = auto_cast(heap, S.pop()) as PrimitiveInt32;
                buffer_size = buffer_size_value.get_value();
                buffer_size_value.free();
            }
            const channel = new UserChannel(heap, UserChannel.allocate(heap, buffer_size, type));
            S.push(channel.address);
            channel.free();
            break;
        }
        case TAG_USER_type_slice: {
            throw new Error("evaluate_make: Not implemented");
        }
        default: {
            throw new Error("evaluate_make: Invalid type");
        }
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
    evaluate_default_make,
    evaluate_make,
    evaluate_make_i,
    evaluate_constructor,
    evaluate_constructor_i,
};