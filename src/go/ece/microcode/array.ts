import { Heap } from '../../heap';
import { auto_cast } from '../../heap/types/auto_cast';
import { ComplexArray } from '../../heap/types/complex/array';
import { ContextControl } from '../../heap/types/context/control';
import { ContextEnv } from '../../heap/types/context/env';
import { ContextStash } from '../../heap/types/context/stash';
import { ControlIndex } from '../../heap/types/control';
import { ControlIndexAddress } from '../../heap/types/control/index_address';
import { ControlSlice } from '../../heap/types/control/slice';
import { ControlSliceAddress } from '../../heap/types/control/slice_address';
import { PrimitiveInt32 } from '../../heap/types/primitive/int32';
import { PrimitiveNil } from '../../heap/types/primitive/nil';
import { TAG_COMPLEX_array, TAG_PRIMITIVE_nil, TAG_USER_slice } from '../../heap/types/tags';
import { UserSlice } from '../../heap/types/user/slice';
import { UserTypeNil } from '../../heap/types/user/type/nil';
import { UserTypeSlice } from '../../heap/types/user/type/slice';
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
    if (array.get_tag() === TAG_COMPLEX_array) {
        const variable = array.get_value_address(index.get_value()) as UserVariable;
        const value = variable.get_value();
        S.push(value.address);
    } else if (array.get_tag() === TAG_USER_slice) {
        const slice = array as unknown as UserSlice;
        const index_offset = index.get_value() + slice.get_offset();
        const variable = slice.get_underlying_array().get_value_address(index_offset) as UserVariable;
        const value = variable.get_value();
        S.push(value.address);
    }
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
    if (array.get_tag() === TAG_COMPLEX_array) {
        const variable = array.get_value_address(index.get_value()) as UserVariable;
        S.push(variable.address);
    } else if (array.get_tag() === TAG_USER_slice) {
        const slice = array as unknown as UserSlice;
        const index_offset = index.get_value() + slice.get_offset();
        const variable = slice.get_underlying_array().get_value_address(index_offset) as UserVariable;
        S.push(variable.address);
    }
    array_variable.free();
    index.free();
}

function evaluate_slice(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlSlice(heap, cmd);
    const array = cmd_object.get_array();
    const start_index = cmd_object.get_start_index();
    const end_index = cmd_object.get_end_index();
    const slice_i_cmd = heap.allocate_any({ tag: "slice_i" });
    C.push(slice_i_cmd);
    C.push(array.address);
    const push_nil_cmd = heap.allocate_any({ tag: "push_i", object: PrimitiveNil.allocate_default(heap) });
    if (start_index.get_tag() === TAG_PRIMITIVE_nil) {
        C.push(push_nil_cmd);
    } else {
        C.push(start_index.address);
    }
    if (end_index.get_tag() === TAG_PRIMITIVE_nil) {
        C.push(push_nil_cmd);
    } else {
        C.push(end_index.address);
    }
    heap.free_object(slice_i_cmd);
    heap.free_object(push_nil_cmd);
}

function evaluate_slice_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const array = auto_cast(heap, S.pop()) as ComplexArray;
    const start_index_obj = auto_cast(heap, S.pop()) as PrimitiveInt32;
    const end_index_obj = auto_cast(heap, S.pop()) as PrimitiveInt32;
    let start_index = start_index_obj.get_value();
    let end_index = end_index_obj.get_value();

    if (start_index == null) {
        start_index = 0;
    }
    if (end_index == null) {
        if (array.get_tag() === TAG_COMPLEX_array) {
            end_index = array.get_length();
        } else {
            end_index = (array as unknown as UserSlice).get_length();
        }
    }

    if (start_index > end_index) {
        throw new Error("invalid slice indices: " + end_index + " < " + start_index);
    }

    let len, cap, offset, underlying_array;

    if (array.get_tag() === TAG_COMPLEX_array) {
        len = end_index - start_index;
        cap = array.get_length() - start_index;
        offset = start_index;
        underlying_array = array;
    } else if (array.get_tag() === TAG_USER_slice) {
        const slice = array as unknown as UserSlice;
        len = end_index - start_index;
        cap = slice.get_capacity() - start_index;
        offset = start_index + slice.get_offset();
        underlying_array = slice.get_underlying_array();
    }

    if (len > cap) {
        throw new Error("slice bounds out of range [" + start_index + ":" + end_index + "] with length " + array.get_length());
    }

    const slice = UserSlice.allocate(heap, len, cap, offset, underlying_array);
    S.push(slice);

    heap.free_object(slice);

    array.free();
    start_index_obj.free();
    end_index_obj.free();
}

function evaluate_slice_address(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const cmd_object = new ControlSliceAddress(heap, cmd);
    const array = cmd_object.get_array();
    const start_index = cmd_object.get_start_index();
    const end_index = cmd_object.get_end_index();
    const slice_i_cmd = heap.allocate_any({ tag: "slice_address_i" });
    C.push(slice_i_cmd);
    C.push(array.address);
    const push_nil_cmd = heap.allocate_any({ tag: "push_i", object: PrimitiveNil.allocate_default(heap) });
    if (start_index.get_tag() === TAG_PRIMITIVE_nil) {
        C.push(push_nil_cmd);
    } else {
        C.push(start_index.address);
    }
    if (end_index.get_tag() === TAG_PRIMITIVE_nil) {
        C.push(push_nil_cmd);
    } else {
        C.push(end_index.address);
    }
    heap.free_object(slice_i_cmd);
    heap.free_object(push_nil_cmd);
}

function evaluate_slice_address_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const array_variable = auto_cast(heap, S.pop()) as UserVariable;
    const array = array_variable.get_value() as ComplexArray;
    const start_index_obj = auto_cast(heap, S.pop()) as PrimitiveInt32;
    const end_index_obj = auto_cast(heap, S.pop()) as PrimitiveInt32;
    let start_index = start_index_obj.get_value();
    let end_index = end_index_obj.get_value();

    if (start_index == null) {
        start_index = 0;
    }
    if (end_index == null) {
        if (array.get_tag() === TAG_COMPLEX_array) {
            end_index = array.get_length();
        } else {
            end_index = (array as unknown as UserSlice).get_length();
        }
    }

    if (start_index > end_index) {
        throw new Error("invalid slice indices: " + end_index + " < " + start_index);
    }

    let len, cap, offset, underlying_array;

    if (array.get_tag() === TAG_COMPLEX_array) {
        len = end_index - start_index;
        cap = array.get_length() - start_index;
        offset = start_index;
        underlying_array = array;
    } else {
        const slice = array as unknown as UserSlice;
        len = end_index - start_index;
        cap = slice.get_capacity() - start_index;
        offset = start_index + slice.get_offset();
        underlying_array = slice.get_underlying_array();
    }

    if (len > cap) {
        throw new Error("slice bounds out of range [" + start_index + ":" + end_index + "] with length " + array.get_length());
    }

    const slice = auto_cast(heap, UserSlice.allocate(heap, len, cap, offset, underlying_array)) as UserSlice;
    const type = auto_cast(heap, UserTypeSlice.allocate(heap, UserTypeNil.allocate(heap))) as UserTypeSlice;
    const slice_variable = UserVariable.allocate(heap, type, slice);
    S.push(slice_variable);

    type.get_inner_type().free();
    slice.free();
    type.free();
    heap.free_object(slice_variable);

    array_variable.free();
    start_index_obj.free();
    end_index_obj.free();
}

export {
    evaluate_index,
    evaluate_index_i,
    evaluate_index_address,
    evaluate_index_address_i,
    evaluate_slice,
    evaluate_slice_i,
    evaluate_slice_address,
    evaluate_slice_address_i,
}