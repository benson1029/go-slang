import { Heap } from "../heap";
import { ComplexArray } from "./complex/array";
import { ComplexBuiltin } from "./complex/builtin";
import { ComplexFunction } from "./complex/function";
import { ComplexLinkedList } from "./complex/linked_list";
import { ComplexPointer } from "./complex/pointer";
import { ComplexString } from "./complex/string";
import { ContextControl } from "./context/control";
import { ContextEnv } from "./context/env";
import { ContextStash } from "./context/stash";
import { ContextThread } from "./context/thread";
import { ControlAssign } from "./control/assign";
import { ControlAssignI } from "./control/assign_i";
import { ControlBinary } from "./control/binary";
import { ControlBinaryI } from "./control/binary_i";
import { ControlBlock } from "./control/block";
import { ControlBreak } from "./control/break";
import { ControlCall } from "./control/call";
import { ControlCallI } from "./control/call_i";
import { ControlCallStmt } from "./control/call_stmt";
import { ControlContinue } from "./control/continue";
import { ControlExitScopeI } from "./control/exit_scope";
import { ControlFor } from "./control/for";
import { ControlForI } from "./control/for_i";
import { ControlFunction } from "./control/function";
import { ControlGoCallStmt } from "./control/go_call_stmt";
import { ControlIf } from "./control/if";
import { ControlIfI } from "./control/if_i";
import { ControlLogicalI } from "./control/logical_i";
import { ControlLogicalImmI } from "./control/logical_imm_i";
import { ControlMember } from "./control/member";
import { ControlMemberAddress } from "./control/member_address";
import { ControlMemberI } from "./control/member_i";
import { ControlName } from "./control/name";
import { ControlPopI } from "./control/pop_i";
import { ControlPostfix } from "./control/postfix";
import { ControlRestoreEnvI } from "./control/restore_env_i";
import { ControlReturn } from "./control/return";
import { ControlReturnI } from "./control/return_i";
import { ControlSequence } from "./control/sequence";
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
} from "./tags"
import { UserStruct } from "./user/struct";
import { UserTypeArray } from "./user/type/array";
import { UserTypeBool } from "./user/type/bool";
import { UserTypeBuiltin } from "./user/type/builtin";
import { UserTypeChannel } from "./user/type/channel";
import { UserTypeFloat32 } from "./user/type/float32";
import { UserTypeFunction } from "./user/type/function";
import { UserTypeInt32 } from "./user/type/int32";
import { UserTypeNil } from "./user/type/nil";
import { UserTypeSlice } from "./user/type/slice";
import { UserTypeString } from "./user/type/string";
import { UserTypeStruct } from "./user/type/struct";
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
    case TAG_USER_variable:
      return new UserVariable(heap, address);
    case TAG_USER_struct:
      return new UserStruct(heap, address);
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
    default:
      throw new Error("Unknown tag " + tag.toString() + " at address " + address.toString());
  }
}

export { auto_cast };
