import * as expression from "./expression";
import * as sequence from "./sequence";
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
