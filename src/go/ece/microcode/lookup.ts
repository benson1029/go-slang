import * as expression from "./expression";
import * as sequence from "./sequence";

function lookup_microcode(cmd: any): Function {
    switch (cmd.tag) {
        case "literal":
            return expression.evaluate_literal;
        case "unary":
            return expression.evaluate_unary;
        case "unary_i":
            return expression.evaluate_unary_i;
        case "binary":
            return expression.evaluate_binary;
        case "binary_i":
            return expression.evaluate_binary_i;
        case "sequence":
            return sequence.evaluate_sequence;
        default:
            throw new UnsupportedCommandError(cmd.tag);
    }
}

class UnsupportedCommandError extends Error {
    constructor(tag: string) {
        super(`Unsupported command type: ${tag}`);
    }
}

export { lookup_microcode, UnsupportedCommandError };
