import { Heap } from "../heap";
import { ComplexArray } from "./complex/array";
import { ComplexBuiltin } from "./complex/builtin";
import { ComplexFunction } from "./complex/function";
import { ComplexLinkedList } from "./complex/linked_list";
import { ComplexMethod } from "./complex/method";
import { ComplexMutex } from "./complex/mutex";
import { ComplexPointer } from "./complex/pointer";
import { ComplexString } from "./complex/string";
import { ComplexWaitGroup } from "./complex/wait_group";
import { ContextControl } from "./context/control";
import { ContextEnv } from "./context/env";
import { ContextScheduler } from "./context/scheduler";
import { ContextStash } from "./context/stash";
import { ContextThread } from "./context/thread";
import { ContextWaitingInstance } from "./context/waiting_instance";
import { ContextWaker } from "./context/waker";
import { ControlIndex } from "./control";
import { ControlAssign } from "./control/assign";
import { ControlAssignI } from "./control/assign_i";
import { ControlBinary } from "./control/binary";
import { ControlBinaryI } from "./control/binary_i";
import { ControlBlock } from "./control/block";
import { ControlBreak } from "./control/break";
import { ControlCall } from "./control/call";
import { ControlCallI } from "./control/call_i";
import { ControlCallStmt } from "./control/call_stmt";
import { ControlCaseDefault } from "./control/case_default";
import { ControlCaseReceive } from "./control/case_receive";
import { ControlCaseSend } from "./control/case_send";
import { ControlChanReceive } from "./control/chan_receive";
import { ControlChanReceiveI } from "./control/chan_receive_i";
import { ControlChanReceiveStmt } from "./control/chan_receive_stmt";
import { ControlChanSend } from "./control/chan_send";
import { ControlChanSendI } from "./control/chan_send_i";
import { ControlConstructor } from "./control/constructor";
import { ControlConstructorI } from "./control/constructor_i";
import { ControlContinue } from "./control/continue";
import { ControlDefaultMake } from "./control/default_make";
import { ControlExitScopeI } from "./control/exit_scope";
import { ControlFor } from "./control/for";
import { ControlForI } from "./control/for_i";
import { ControlFunction } from "./control/function";
import { ControlGoCallStmt } from "./control/go_call_stmt";
import { ControlIf } from "./control/if";
import { ControlIfI } from "./control/if_i";
import { ControlIndexAddress } from "./control/index_address";
import { ControlIndexAddressI } from "./control/index_address_i";
import { ControlIndexI } from "./control/index_i";
import { ControlLogicalI } from "./control/logical_i";
import { ControlLogicalImmI } from "./control/logical_imm_i";
import { ControlMake } from "./control/make";
import { ControlMakeI } from "./control/make_i";
import { ControlMarkerI } from "./control/marker_i";
import { ControlMember } from "./control/member";
import { ControlMemberAddress } from "./control/member_address";
import { ControlMemberAddressI } from "./control/member_address_i";
import { ControlMemberI } from "./control/member_i";
import { ControlMethod } from "./control/method";
import { ControlMethodMember } from "./control/method_member";
import { ControlName } from "./control/name";
import { ControlNameAddress } from "./control/name_address";
import { ControlPopI } from "./control/pop_i";
import { ControlPostfix } from "./control/postfix";
import { ControlPushI } from "./control/push_i";
import { ControlRestoreEnvI } from "./control/restore_env_i";
import { ControlReturn } from "./control/return";
import { ControlReturnI } from "./control/return_i";
import { ControlSelect } from "./control/select";
import { ControlSelectI } from "./control/select_i";
import { ControlSequence } from "./control/sequence";
import { ControlSlice } from "./control/slice";
import { ControlSliceAddress } from "./control/slice_address";
import { ControlSliceAddressI } from "./control/slice_address_i";
import { ControlSliceI } from "./control/slice_i";
import { ControlStruct } from "./control/struct";
import { ControlUnary } from "./control/unary";
import { ControlUnaryI } from "./control/unary_i";
import { ControlVar } from "./control/var";
import { ControlVarI } from "./control/var_i";
import { EnvironmentEntry } from "./environment/entry";
import { EnvironmentFrame } from "./environment/frame";
import { EnvironmentHashTable } from "./environment/hash_table";
import { HeapObject } from "./objects";
import { PrimitiveBool } from "./primitive/bool";
import { PrimitiveFloat32 } from "./primitive/float32";
import { PrimitiveInt32 } from "./primitive/int32";
import { PrimitiveNil } from "./primitive/nil";
import { PrimitiveRune } from "./primitive/rune";
import {
  TAG_PRIMITIVE_nil,
  TAG_PRIMITIVE_bool,
  TAG_PRIMITIVE_int32,
  TAG_PRIMITIVE_float32,
  TAG_PRIMITIVE_rune,
  TAG_COMPLEX_string,
  TAG_COMPLEX_linked_list,
  TAG_COMPLEX_pointer,
  TAG_CONTROL_name,
  TAG_CONTROL_literal,
  TAG_CONTROL_var,
  TAG_CONTROL_assign,
  TAG_CONTROL_unary,
  TAG_CONTROL_postfix,
  TAG_CONTROL_binary,
  TAG_CONTROL_sequence,
  TAG_CONTROL_call,
  TAG_CONTROL_function,
  TAG_CONTROL_unary_i,
  TAG_CONTROL_binary_i,
  TAG_CONTROL_pop_i,
  TAG_CONTROL_var_i,
  TAG_ENVIRONMENT_entry,
  TAG_ENVIRONMENT_frame,
  TAG_CONTROL_block,
  TAG_CONTROL_exit_scope_i,
  TAG_CONTROL_for,
  TAG_CONTROL_for_i,
  TAG_CONTROL_continue,
  TAG_CONTROL_break,
  TAG_CONTROL_if,
  TAG_CONTROL_if_i,
  TAG_CONTROL_assign_i,
  TAG_COMPLEX_array,
  TAG_COMPLEX_function,
  TAG_CONTEXT_thread,
  TAG_CONTEXT_control,
  TAG_CONTEXT_stash,
  TAG_CONTEXT_env,
  TAG_ENVIRONMENT_hash_table,
  TAG_CONTROL_call_i,
  TAG_CONTROL_restore_env_i,
  TAG_CONTROL_return,
  TAG_CONTROL_return_i,
  TAG_COMPLEX_builtin,
  TAG_CONTROL_logical_i,
  TAG_CONTROL_logical_imm_i,
  TAG_CONTROL_call_stmt,
  TAG_CONTROL_go_call_stmt,
  TAG_USER_struct,
  TAG_USER_type_array,
  TAG_USER_type_bool,
  TAG_USER_type_channel,
  TAG_USER_type_float32,
  TAG_USER_type_function,
  TAG_USER_type_int32,
  TAG_USER_type_nil,
  TAG_USER_type_slice,
  TAG_USER_type_string,
  TAG_USER_type_struct,
  TAG_USER_type_builtin,
  TAG_CONTROL_member,
  TAG_CONTROL_member_i,
  TAG_CONTROL_member_address,
  TAG_USER_variable,
  TAG_CONTROL_name_address,
  TAG_CONTROL_index,
  TAG_CONTROL_index_i,
  TAG_CONTROL_index_address,
  TAG_CONTROL_index_address_i,
  TAG_CONTROL_constructor,
  TAG_CONTROL_constructor_i,
  TAG_CONTROL_chan_send,
  TAG_CONTROL_chan_receive,
  TAG_CONTROL_chan_receive_stmt,
  TAG_USER_type_struct_decl,
  TAG_CONTROL_struct,
  TAG_USER_type_method,
  TAG_CONTROL_method,
  TAG_CONTROL_member_address_i,
  TAG_COMPLEX_method,
  TAG_CONTROL_method_member,
  TAG_CONTROL_push_i,
  TAG_CONTROL_chan_send_i,
  TAG_CONTROL_default_make,
  TAG_CONTROL_make,
  TAG_CONTROL_make_i,
  TAG_USER_channel,
  TAG_CONTEXT_scheduler,
  TAG_CONTEXT_waker,
  TAG_CONTEXT_waiting_instance,
  TAG_CONTROL_chan_receive_i,
  TAG_USER_type_mutex,
  TAG_COMPLEX_mutex,
  TAG_USER_slice,
  TAG_CONTROL_slice,
  TAG_CONTROL_slice_i,
  TAG_CONTROL_slice_address,
  TAG_CONTROL_slice_address_i,
  TAG_COMPLEX_wait_group,
  TAG_USER_type_wait_group,
  TAG_CONTROL_marker_i,
  TAG_CONTROL_select,
  TAG_CONTROL_case_default,
  TAG_CONTROL_case_send,
  TAG_CONTROL_case_receive,
  TAG_CONTROL_select_i,
} from "./tags"
import { UserChannel } from "./user/channel";
import { UserSlice } from "./user/slice";
import { UserStruct } from "./user/struct";
import { UserTypeArray } from "./user/type/array";
import { UserTypeBool } from "./user/type/bool";
import { UserTypeBuiltin } from "./user/type/builtin";
import { UserTypeChannel } from "./user/type/channel";
import { UserTypeFloat32 } from "./user/type/float32";
import { UserTypeFunction } from "./user/type/function";
import { UserTypeInt32 } from "./user/type/int32";
import { UserTypeMethod } from "./user/type/method";
import { UserTypeMutex } from "./user/type/mutex";
import { UserTypeNil } from "./user/type/nil";
import { UserTypeSlice } from "./user/type/slice";
import { UserTypeString } from "./user/type/string";
import { UserTypeStruct } from "./user/type/struct";
import { UserTypeStructDecl } from "./user/type/struct_decl";
import { UserTypeWaitGroup } from "./user/type/wait_group";
import { UserVariable } from "./user/variable";


function auto_cast(heap: Heap, address: number): HeapObject {
  const tag = heap.get_tag(address);
  switch (tag) {
    case TAG_PRIMITIVE_nil:
      return new PrimitiveNil(heap, address);
    case TAG_PRIMITIVE_bool:
      return new PrimitiveBool(heap, address);
    case TAG_PRIMITIVE_int32:
      return new PrimitiveInt32(heap, address);
    case TAG_PRIMITIVE_float32:
      return new PrimitiveFloat32(heap, address);
    case TAG_PRIMITIVE_rune:
      return new PrimitiveRune(heap, address);
    case TAG_COMPLEX_string:
      return new ComplexString(heap, address);
    case TAG_COMPLEX_linked_list:
      return new ComplexLinkedList(heap, address);
    case TAG_COMPLEX_pointer:
      return new ComplexPointer(heap, address);
    case TAG_COMPLEX_array:
      return new ComplexArray(heap, address);
    case TAG_COMPLEX_function:
      return new ComplexFunction(heap, address);
    case TAG_COMPLEX_builtin:
      return new ComplexBuiltin(heap, address);
    case TAG_COMPLEX_method:
      return new ComplexMethod(heap, address);
    case TAG_COMPLEX_mutex:
      return new ComplexMutex(heap, address);
    case TAG_COMPLEX_wait_group:
      return new ComplexWaitGroup(heap, address);
    case TAG_CONTROL_name:
      return new ControlName(heap, address);
    case TAG_CONTROL_literal:
      throw new Error("ControlLiteral is an abstract class and cannot be instantiated.");
    case TAG_CONTROL_var:
      return new ControlVar(heap, address);
    case TAG_CONTROL_assign:
      return new ControlAssign(heap, address);
    case TAG_CONTROL_assign_i:
      return new ControlAssignI(heap, address);
    case TAG_CONTROL_unary:
      return new ControlUnary(heap, address);
    case TAG_CONTROL_postfix:
      return new ControlPostfix(heap, address);
    case TAG_CONTROL_binary:
      return new ControlBinary(heap, address);
    case TAG_CONTROL_sequence:
      return new ControlSequence(heap, address);
    case TAG_CONTROL_function:
      return new ControlFunction(heap, address);
    case TAG_CONTROL_call:
      return new ControlCall(heap, address);
    case TAG_CONTROL_unary_i:
      return new ControlUnaryI(heap, address);
    case TAG_CONTROL_binary_i:
      return new ControlBinaryI(heap, address);
    case TAG_CONTROL_pop_i:
      return new ControlPopI(heap, address);
    case TAG_CONTROL_var_i:
      return new ControlVarI(heap, address);
    case TAG_CONTROL_block:
      return new ControlBlock(heap, address);
    case TAG_CONTROL_exit_scope_i:
      return new ControlExitScopeI(heap, address);
    case TAG_CONTROL_for:
      return new ControlFor(heap, address);
    case TAG_CONTROL_for_i:
      return new ControlForI(heap, address);
    case TAG_CONTROL_break:
      return new ControlBreak(heap, address);
    case TAG_CONTROL_continue:
      return new ControlContinue(heap, address);
    case TAG_CONTROL_if:
      return new ControlIf(heap, address);
    case TAG_CONTROL_if_i:
      return new ControlIfI(heap, address);
    case TAG_CONTROL_call_i:
      return new ControlCallI(heap, address);
    case TAG_CONTROL_restore_env_i:
      return new ControlRestoreEnvI(heap, address);
    case TAG_CONTROL_return:
      return new ControlReturn(heap, address);
    case TAG_CONTROL_return_i:
      return new ControlReturnI(heap, address);
    case TAG_CONTROL_logical_i:
      return new ControlLogicalI(heap, address);
    case TAG_CONTROL_logical_imm_i:
      return new ControlLogicalImmI(heap, address);
    case TAG_CONTROL_call_stmt:
      return new ControlCallStmt(heap, address);
    case TAG_CONTROL_go_call_stmt:
      return new ControlGoCallStmt(heap, address);
    case TAG_CONTROL_member:
      return new ControlMember(heap, address);
    case TAG_CONTROL_member_address:
      return new ControlMemberAddress(heap, address);
    case TAG_CONTROL_member_i:
      return new ControlMemberI(heap, address);
    case TAG_CONTROL_name_address:
      return new ControlNameAddress(heap, address);
    case TAG_CONTROL_default_make:
      return new ControlDefaultMake(heap, address);
    case TAG_CONTROL_make:
      return new ControlMake(heap, address);   
    case TAG_CONTROL_make_i:
      return new ControlMakeI(heap, address);   
    case TAG_CONTROL_index:
      return new ControlIndex(heap, address);
    case TAG_CONTROL_index_i:
      return new ControlIndexI(heap, address);
    case TAG_CONTROL_index_address:
      return new ControlIndexAddress(heap, address);
    case TAG_CONTROL_index_address_i:
      return new ControlIndexAddressI(heap, address);
    case TAG_CONTROL_constructor:
      return new ControlConstructor(heap, address);
    case TAG_CONTROL_constructor_i:
      return new ControlConstructorI(heap, address);
    case TAG_CONTROL_chan_send:
      return new ControlChanSend(heap, address);
    case TAG_CONTROL_chan_send_i:
      return new ControlChanSendI(heap, address);
    case TAG_CONTROL_chan_receive:
      return new ControlChanReceive(heap, address);
    case TAG_CONTROL_chan_receive_i:
      return new ControlChanReceiveI(heap, address);
    case TAG_CONTROL_chan_receive_stmt:
      return new ControlChanReceiveStmt(heap, address);
    case TAG_CONTROL_struct:
      return new ControlStruct(heap, address);
    case TAG_CONTROL_method:
      return new ControlMethod(heap, address);
    case TAG_CONTROL_member_address_i:
      return new ControlMemberAddressI(heap, address);
    case TAG_CONTROL_method_member:
      return new ControlMethodMember(heap, address);
    case TAG_CONTROL_push_i:
      return new ControlPushI(heap, address);
    case TAG_CONTROL_slice:
      return new ControlSlice(heap, address);
    case TAG_CONTROL_slice_i:
      return new ControlSliceI(heap, address);
    case TAG_CONTROL_slice_address:
      return new ControlSliceAddress(heap, address);
    case TAG_CONTROL_slice_address_i:
      return new ControlSliceAddressI(heap, address);
    case TAG_CONTROL_marker_i:
      return new ControlMarkerI(heap, address);
    case TAG_CONTROL_select_i:
      return new ControlSelectI(heap, address);
    case TAG_CONTROL_select:
      return new ControlSelect(heap, address);
    case TAG_CONTROL_case_default:
      return new ControlCaseDefault(heap, address);
    case TAG_CONTROL_case_send:
      return new ControlCaseSend(heap, address);
    case TAG_CONTROL_case_receive:
      return new ControlCaseReceive(heap, address);
    case TAG_ENVIRONMENT_entry:
      return new EnvironmentEntry(heap, address);
    case TAG_ENVIRONMENT_frame:
      return new EnvironmentFrame(heap, address);
    case TAG_ENVIRONMENT_hash_table:
      return new EnvironmentHashTable(heap, address);
    case TAG_CONTEXT_thread:
      return new ContextThread(heap, address);
    case TAG_CONTEXT_control:
      return new ContextControl(heap, address);
    case TAG_CONTEXT_stash:
      return new ContextStash(heap, address);
    case TAG_CONTEXT_env:
      return new ContextEnv(heap, address);
    case TAG_CONTEXT_scheduler:
      return new ContextScheduler(heap, address);
    case TAG_CONTEXT_waker:
      return new ContextWaker(heap, address);
    case TAG_CONTEXT_waiting_instance:
      return new ContextWaitingInstance(heap, address);
    case TAG_USER_variable:
      return new UserVariable(heap, address);
    case TAG_USER_struct:
      return new UserStruct(heap, address);
    case TAG_USER_channel:
      return new UserChannel(heap, address);
    case TAG_USER_slice:
      return new UserSlice(heap, address);
    case TAG_USER_type_array:
      return new UserTypeArray(heap, address);
    case TAG_USER_type_bool:
      return new UserTypeBool(heap, address);
    case TAG_USER_type_channel:
      return new UserTypeChannel(heap, address);
    case TAG_USER_type_float32:
      return new UserTypeFloat32(heap, address);
    case TAG_USER_type_function:
      return new UserTypeFunction(heap, address);
    case TAG_USER_type_int32:
      return new UserTypeInt32(heap, address);
    case TAG_USER_type_nil:
      return new UserTypeNil(heap, address);
    case TAG_USER_type_slice:
      return new UserTypeSlice(heap, address);
    case TAG_USER_type_string:
      return new UserTypeString(heap, address);
    case TAG_USER_type_struct:
      return new UserTypeStruct(heap, address);
    case TAG_USER_type_builtin:
      return new UserTypeBuiltin(heap, address);
    case TAG_USER_type_struct_decl:
      return new UserTypeStructDecl(heap, address);
    case TAG_USER_type_method:
      return new UserTypeMethod(heap, address);
    case TAG_USER_type_mutex:
      return new UserTypeMutex(heap, address);
    case TAG_USER_type_wait_group:
      return new UserTypeWaitGroup(heap, address);
    default:
      throw new Error("Unknown tag " + tag.toString() + " at address " + address.toString());
  }
}

export { auto_cast };
