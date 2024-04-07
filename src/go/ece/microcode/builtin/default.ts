import { ContextControl } from '../../../heap/types/context/control';
import { ContextStash } from '../../../heap/types/context/stash';
import { ContextEnv } from '../../../heap/types/context/env';
import { Heap } from '../../../heap';
import { auto_cast } from '../../../heap/types/auto_cast';
import { TAG_COMPLEX_array, TAG_USER_slice } from '../../../heap/types/tags';
import { ComplexArray } from '../../../heap/types/complex/array';
import { ArrayType, Int32Type, SliceType, Type, isEqual } from '../../loader/typeUtil';
import { UserSlice } from '../../../heap/types/user/slice';
import { UserVariable } from '../../../heap/types/user/variable';

function evaluate_builtin(name: string, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv, output: Function, args: number[]): void {
    if (name === "len") {
        const array = auto_cast(heap, args[0]);
        if (array.get_tag() === TAG_COMPLEX_array) {
            const len = (array as ComplexArray).get_length();
            const value = heap.allocate_PRIMITIVE_int32(len);
            S.push(value);
            heap.free_object(value);
        } else if (array.get_tag() === TAG_USER_slice) {
            const len = (array as UserSlice).get_length();
            const value = heap.allocate_PRIMITIVE_int32(len);
            S.push(value);
            heap.free_object(value);
        }
    }
    else if (name === "cap") {
        const array = auto_cast(heap, args[0]);
        if (array.get_tag() === TAG_COMPLEX_array) {
            const len = (array as ComplexArray).get_length();
            const value = heap.allocate_PRIMITIVE_int32(len);
            S.push(value);
            heap.free_object(value);
        } else if (array.get_tag() === TAG_USER_slice) {
            const len = (array as UserSlice).get_capacity();
            const value = heap.allocate_PRIMITIVE_int32(len);
            S.push(value);
            heap.free_object(value);
        }
    }
    else if (name === "append") {
        const slice = auto_cast(heap, args[0]) as UserSlice;
        if (slice.get_length() === slice.get_capacity()) {
            const new_capacity = slice.get_capacity() === 0 ? 1 : slice.get_capacity() * 2;
            const new_array = auto_cast(heap, ComplexArray.allocate(heap, new_capacity)) as ComplexArray;
            for (let i = 0; i < new_capacity; i++) {
                const variable = auto_cast(heap, UserVariable.allocate_nil(heap)) as UserVariable;
                new_array.set_value_address(i, variable);
                variable.free();
            }
            for (let i = 0; i < slice.get_length(); i++) {
                const variable = new_array.get_value_address(i) as UserVariable;
                const old_variable = slice.get_underlying_array().get_value_address(slice.get_offset() + i) as UserVariable;
                variable.set_value(old_variable.get_value());
            }
            const variable = new_array.get_value_address(slice.get_length()) as UserVariable;
            variable.set_value(auto_cast(heap, args[1]));
            const new_slice = UserSlice.allocate(heap, slice.get_length() + 1, new_capacity, 0, new_array);
            S.push(new_slice);
            new_array.free();
            heap.free_object(new_slice);
        } else {
            const variable = slice.get_underlying_array().get_value_address(slice.get_offset() + slice.get_length()) as UserVariable;
            variable.set_value(auto_cast(heap, args[1]));
            const new_slice = UserSlice.allocate(heap, slice.get_length() + 1, slice.get_capacity(), slice.get_offset(), slice.get_underlying_array());
            S.push(new_slice);
            heap.free_object(new_slice);
        }
    }
    else {
        throw new Error("evaluate_builtin: Builtin not found");
    }
}

function get_builtin_type(name: string, args: Type[]): Type {
    if (name === "len" || name === "cap") {
        if (args.length === 1) {
            if (args[0] instanceof ArrayType || args[0] instanceof SliceType) {
                return new Int32Type();
            }
            throw new Error("len: Argument is not an array or slice");
        }
        throw new Error("len: Expected 1 argument");
    }
    else if (name === "append") {
        if (args.length === 2) {
            if (!(args[0] instanceof SliceType)) {
                throw new Error("append: First argument is not a slice");
            }
            if (!isEqual(args[0].type, args[1])) {
                throw new Error("append: Type mismatch");
            }
            return args[0];
        }
        throw new Error("append: Expected 2 arguments");
    }
    throw new Error("get_builtin_type: Builtin not found");
}

function link_imports(): { type: string; name: string; value: any }[] {
    return [
        { type: "function", name: "append", value: { tag: "builtin", name: "default.append" } },
        { type: "function", name: "len", value: { tag: "builtin", name: "default.len" } },
        { type: "function", name: "cap", value: { tag: "builtin", name: "default.cap" } },
    ];
}

export {
    evaluate_builtin,
    get_builtin_type,
    link_imports,
};
