import { ContextControl } from '../../heap/types/context/control';
import { ContextStash } from '../../heap/types/context/stash';
import { ContextEnv } from '../../heap/types/context/env';
import { Heap } from '../../heap';
import { ControlMember } from '../../heap/types/control/member';
import { UserStruct } from '../../heap/types/user/struct';
import { auto_cast } from '../../heap/types/auto_cast';
import { ControlMemberI } from '../../heap/types/control/member_i';
import { ControlStruct } from '../../heap/types/control/struct';
import { UserTypeStruct } from '../../heap/types/user/type/struct';
import { UserType } from '../../heap/types/user/type';
import { ControlMemberAddress } from '../../heap/types/control/member_address';
import { ControlMemberAddressI } from '../../heap/types/control/member_address_i';
import { UserVariable } from '../../heap/types/user/variable';
import { TAG_USER_type_array, TAG_USER_type_struct_decl } from '../../heap/types/tags';
import { UserTypeStructDecl } from '../../heap/types/user/type/struct_decl';
import { UserTypeArray } from '../../heap/types/user/type/array';
import { ControlMethod } from '../../heap/types/control/method';
import { ComplexMethod } from '../../heap/types/complex/method';
import { ComplexString } from '../../heap/types/complex/string';
import { ControlMethodMember } from '../../heap/types/control/method_member';
import { HeapObject } from '../../heap/types/objects';

function resolveType(heap: Heap, E: ContextEnv, type: UserType, toFree: HeapObject[]): UserType {
    switch (type.get_tag()) {
        case TAG_USER_type_struct_decl:
            return E.get_struct_frame().get_variable_address(
                (type as UserTypeStructDecl).get_name().address
            ).get_value() as UserTypeStruct;
        case TAG_USER_type_array:
            const type_obj = auto_cast(heap, UserTypeArray.reallocate(
                heap,
                (type as UserTypeArray).get_length(),
                resolveType(heap, E, (type as UserTypeArray).get_inner_type(), toFree)
            )) as UserTypeArray;
            toFree.push(type_obj);
            return type_obj;
        default:
            return type;
    }
}

function evaluate_struct(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const struct_cmd = new ControlStruct(heap, cmd);
    const name = struct_cmd.get_name();
    let toFree = [];
    let members = [];
    for (let i = 0; i < struct_cmd.get_number_of_fields(); i++) {
        const member_name = struct_cmd.get_field_name(i);
        const member_type = resolveType(heap, E, struct_cmd.get_field_type(i), toFree);
        members.push({ name: member_name, type: member_type });
    }
    const type = auto_cast(heap, UserTypeStruct.allocate(
        heap,
        name,
        members
    )) as UserTypeStruct
    E.get_struct_frame().insert_new_variable(name.address);
    const variable = E.get_struct_frame().get_variable_address(name.address);
    variable.set_value(type);
    type.free();
    toFree.forEach(obj => obj.free());
}

function evaluate_method(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const method_cmd = new ControlMethod(heap, cmd);
    const method_name = auto_cast(heap, ComplexString.allocate(
        heap,
        "METHOD." + method_cmd.get_struct_name_address().get_string()
            + "." + method_cmd.get_name_address().get_string()
    )) as ComplexString;
    const method_object = auto_cast(
        heap,
        ComplexMethod.allocate(heap, method_cmd.address, E.get_frame().address)
    ) as ComplexMethod;
    E.get_struct_frame().insert_new_variable(method_name.address);
    const variable = E.get_struct_frame().get_variable_address(method_name.address);
    variable.set_value(method_object);
    method_name.free();
    method_object.free();
}

function evaluate_member(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_cmd = new ControlMember(heap, cmd);
    const value = member_cmd.get_object();
    const member_i_addr = heap.allocate_any({ tag: "member_i", member: member_cmd.get_member_name_address() });
    C.push(member_i_addr);
    C.push(value.address);
    heap.free_object(member_i_addr);
}

function evaluate_member_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_i_cmd = new ControlMemberI(heap, cmd);
    const member_name = member_i_cmd.get_member_name_address();
    const object = auto_cast(heap, S.pop()) as unknown as UserStruct;
    const member = object.get_frame().get_variable_address(member_name.address);
    const value = member.get_value();
    S.push(value.address);
    object.free();
}

function evaluate_member_address(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_address_cmd = new ControlMemberAddress(heap, cmd);
    const value = member_address_cmd.get_object();
    const member_address_i_addr = heap.allocate_any({ tag: "member_address_i", member: member_address_cmd.get_member_name_address() });
    C.push(member_address_i_addr);
    C.push(value.address);
    heap.free_object(member_address_i_addr);
}

function evaluate_member_address_i(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const member_address_i_cmd = new ControlMemberAddressI(heap, cmd);
    const member_name = member_address_i_cmd.get_member_name_address();
    const variable_object = auto_cast(heap, S.pop()) as unknown as UserVariable;
    const object = variable_object.get_value() as UserStruct;
    const member = object.get_frame().get_variable_address(member_name.address);
    S.push(member.address);
    variable_object.free();
}

function evaluate_method_member(cmd: number, heap: Heap, C: ContextControl, S: ContextStash, E: ContextEnv): void {
    const method_member_cmd = new ControlMethodMember(heap, cmd);
    const value = method_member_cmd.get_object();
    const method_name = auto_cast(
        heap,
        ComplexString.allocate(
            heap,
            "METHOD." + method_member_cmd.get_struct_name()
                + "." + method_member_cmd.get_member_name()
        )
    ) as ComplexString;
    const method = E.get_struct_frame().get_variable_address(method_name.address)
        .get_value() as ComplexMethod;
    const push_i_addr = heap.allocate_any({ tag: "push_i", object: method });
    C.push(push_i_addr);
    C.push(value.address);
    method_name.free();
    heap.free_object(push_i_addr);
}

export {
    evaluate_struct,
    evaluate_method,
    evaluate_member,
    evaluate_member_i,
    evaluate_member_address,
    evaluate_member_address_i,
    evaluate_method_member,
};
