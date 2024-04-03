import * as array from "./array";
import * as block from "./block";
import * as constructor from "./constructor";
import * as expression from "./expression";
import * as control_for from "./for";
import * as control_function from "./function";
import * as control_if from "./if";
import * as sequence from "./sequence";
import * as struct from "./struct";
import * as control_var from "./var";
import * as tags from "../../heap/types/tags";
import * as concurrent_go from "./concurrent/go";
import { Heap } from "../../heap";
import { ContextThread } from "../../heap/types/context/thread";
import { ContextScheduler } from "../../heap/types/context/scheduler";

function lookup_microcode_sequential(tag: number): Function {
  switch (tag) {
    case tags.TAG_PRIMITIVE_bool:
    case tags.TAG_PRIMITIVE_int32:
    case tags.TAG_PRIMITIVE_float32:
    case tags.TAG_COMPLEX_string:
      return expression.evaluate_literal;
    case tags.TAG_CONTROL_unary:
      return expression.evaluate_unary;
    case tags.TAG_CONTROL_unary_i:
      return expression.evaluate_unary_i;
    case tags.TAG_CONTROL_binary:
      return expression.evaluate_binary;
    case tags.TAG_CONTROL_binary_i:
      return expression.evaluate_binary_i;
    case tags.TAG_CONTROL_sequence:
      return sequence.evaluate_sequence;
    case tags.TAG_CONTROL_var:
      return control_var.evaluate_var;
    case tags.TAG_CONTROL_var_i:
      return control_var.evaluate_var_i;
    case tags.TAG_CONTROL_assign:
      return control_var.evaluate_assign;
    case tags.TAG_CONTROL_assign_i:
      return control_var.evaluate_assign_i;
    case tags.TAG_CONTROL_name:
      return control_var.evaluate_name;
    case tags.TAG_CONTROL_block:
      return block.evaluate_block;
    case tags.TAG_CONTROL_exit_scope_i:
      return block.evaluate_exit_scope_i;
    case tags.TAG_CONTROL_for:
      return control_for.evaluate_for;
    case tags.TAG_CONTROL_for_i:
      return control_for.evaluate_for_i;
    case tags.TAG_CONTROL_break:
      return control_for.evaluate_break;
    case tags.TAG_CONTROL_continue:
      return control_for.evaluate_continue;
    case tags.TAG_CONTROL_if:
      return control_if.evaluate_if;
    case tags.TAG_CONTROL_if_i:
      return control_if.evaluate_if_i;
    case tags.TAG_CONTROL_function:
      return control_function.evaluate_function;
    case tags.TAG_CONTROL_call:
      return control_function.evaluate_call;
    case tags.TAG_CONTROL_call_i:
      return control_function.evaluate_call_i;
    case tags.TAG_CONTROL_return:
      return control_function.evaluate_return;
    case tags.TAG_CONTROL_return_i:
      return control_function.evaluate_return_i;
    case tags.TAG_CONTROL_restore_env_i:
      return control_function.evaluate_restore_env_i;
    case tags.TAG_CONTROL_logical_i:
      return expression.evaluate_logical_i;
    case tags.TAG_CONTROL_logical_imm_i:
      return expression.evaluate_logical_imm_i;
    case tags.TAG_CONTROL_call_stmt:
      return control_function.evaluate_call_stmt;
    case tags.TAG_CONTROL_pop_i:
      return control_function.evaluate_pop_i;
    case tags.TAG_CONTROL_member:
      return struct.evaluate_member;
    case tags.TAG_CONTROL_member_i:
      return struct.evaluate_member_i;
    case tags.TAG_CONTROL_name_address:
      return control_var.evaluate_name_address;
    case tags.TAG_CONTROL_make:
      return constructor.evaluate_make;
    case tags.TAG_CONTROL_index:
      return array.evaluate_index;
    case tags.TAG_CONTROL_index_i:
      return array.evaluate_index_i;
    case tags.TAG_CONTROL_index_address:
      return array.evaluate_index_address;
    case tags.TAG_CONTROL_index_address_i:
      return array.evaluate_index_address_i;
    case tags.TAG_CONTROL_constructor:
      return constructor.evaluate_constructor;
    case tags.TAG_CONTROL_constructor_i:
      return constructor.evaluate_constructor_i;
    case tags.TAG_CONTROL_struct:
      return struct.evaluate_struct;
    case tags.TAG_CONTROL_member_address:
      return struct.evaluate_member_address;
    case tags.TAG_CONTROL_member_address_i:
      return struct.evaluate_member_address_i;
    case tags.TAG_CONTROL_method:
      return struct.evaluate_method;
    case tags.TAG_CONTROL_method_member:
      return struct.evaluate_method_member;
    case tags.TAG_CONTROL_push_i:
      return control_function.evaluate_push_i;
    case tags.TAG_PRIMITIVE_nil:
      return (...args: any[]) => {};
    default:
      throw new UnsupportedCommandError(tag.toString());
  }
}

function lookup_microcode(tag: number): Function {
  switch (tag) {
    case tags.TAG_CONTROL_go_call_stmt:
      return concurrent_go.evaluate_go_call_stmt;
    default:
      return (
        cmd: number,
        heap: Heap,
        thread: ContextThread,
        scheduler: ContextScheduler,
        output: Function
      ) => {
        const microcode = lookup_microcode_sequential(tag);
        microcode(
          cmd,
          heap,
          thread.control(),
          thread.stash(),
          thread.env(),
          output
        );
        scheduler.enqueue(thread);
      };
  }
}

class UnsupportedCommandError extends Error {
  constructor(tag: string) {
    super(`Unsupported command type: ${tag}`);
  }
}

export { lookup_microcode, UnsupportedCommandError };
