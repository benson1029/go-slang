import * as block from "./block";
import * as expression from "./expression";
import * as control_for from "./for";
import * as sequence from "./sequence";
import * as control_var from "./var";
import * as tags from "../../heap/types/tags";

function lookup_microcode(tag: number): Function {
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
        default:
            throw new UnsupportedCommandError(tag.toString());
    }
}

class UnsupportedCommandError extends Error {
    constructor(tag: string) {
        super(`Unsupported command type: ${tag}`);
    }
}

export { lookup_microcode, UnsupportedCommandError };
