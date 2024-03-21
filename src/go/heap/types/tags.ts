const TAG_PRIMITIVE_nil = 0x0000; // 0000 0000 0000 0000
const TAG_PRIMITIVE_bool = 0x0001; // 0000 0000 0000 0001
const TAG_PRIMITIVE_int32 = 0x0002; // 0000 0000 0000 0010
const TAG_PRIMITIVE_float32 = 0x0003; // 0000 0000 0000 0011
const TAG_PRIMITIVE_rune = 0x0004; // 0000 0000 0000 0100
const TAG_PRIMITIVE_undefined = 0x0005; // 0000 0000 0000 0101

const TAG_COMPLEX_array = 0x4001; // 0100 0000 0000 0001
// const TAG_COMPLEX_slice             = 0x4002; // 0100 0000 0000 0010
const TAG_COMPLEX_string = 0x4003; // 0100 0000 0000 0011
const TAG_COMPLEX_linked_list = 0x4004; // 0100 0000 0000 0100
const TAG_COMPLEX_pointer = 0x4006; // 0100 0000 0000 0110
const TAG_COMPLEX_function = 0x4007; // 0100 0000 0000 0111
const TAG_COMPLEX_builtin = 0x4008; // 0100 0000 0000 1000

const TAG_CONTROL_pop_i = 0x8001; // 1000 0000 0000 0001
const TAG_CONTROL_exit_scope_i = 0x8002; // 1000 0000 0000 0010
const TAG_CONTROL_break = 0x8003; // 1000 0000 0000 0011
const TAG_CONTROL_continue = 0x8004; // 1000 0000 0000 0100
const TAG_CONTROL_return_i = 0x8005; // 1000 0000 0000 0101

const TAG_CONTROL_name = 0xC001; // 1100 0000 0000 0001
const TAG_CONTROL_literal = 0xC002; // 1100 0000 0000 0010
const TAG_CONTROL_var = 0xC003; // 1100 0000 0000 0011
const TAG_CONTROL_assign = 0xC004; // 1100 0000 0000 0100
const TAG_CONTROL_unary = 0xC005; // 1100 0000 0000 0101
const TAG_CONTROL_postfix = 0xC006; // 1100 0000 0000 0110
const TAG_CONTROL_binary = 0xC007; // 1100 0000 0000 0111
const TAG_CONTROL_sequence = 0xC008; // 1100 0000 0000 1000
// const TAG_CONTROL_block             = 0xC009; // 1100 0000 0000 1001
// const TAG_CONTROL_if                = 0xC00A; // 1100 0000 0000 1010
// const TAG_CONTROL_for               = 0xC00B; // 1100 0000 0000 1011
// const TAG_CONTROL_break             = 0xC00C; // 1100 0000 0000 1100
// const TAG_CONTROL_continue          = 0xC00D; // 1100 0000 0000 1101
// const TAG_CONTROL_defer             = 0xC00E; // 1100 0000 0000 1110
const TAG_CONTROL_return            = 0xC00F; // 1100 0000 0000 1111
const TAG_CONTROL_function = 0xC010; // 1100 0000 0001 0000
const TAG_CONTROL_call = 0xC011; // 1100 0000 0001 0001
const TAG_CONTROL_lambda_call = 0xC012; // 1100 0000 0001 0010
const TAG_CONTROL_unary_i = 0xC013; // 1100 0000 0001 0011
const TAG_CONTROL_binary_i = 0xC014; // 1100 0000 0001 0100
const TAG_CONTROL_var_i = 0xC016; // 1100 0000 0001 0110
const TAG_CONTROL_assign_i = 0xC017; // 1100 0000 0001 0111
const TAG_CONTROL_block = 0xC018; // 1100 0000 0001 1000
const TAG_CONTROL_for = 0xC019; // 1100 0000 0001 1001
const TAG_CONTROL_for_i = 0xC01A; // 1100 0000 0001 1010
const TAG_CONTROL_if = 0xC01B; // 1100 0000 0001 1011
const TAG_CONTROL_if_i = 0xC01C; // 1100 0000 0001 1100
const TAG_CONTROL_call_i = 0xC01D; // 1100 0000 0001 1101
const TAG_CONTROL_restore_env_i = 0xC01E; // 1100 0000 0001 1110



const TAG_ENVIRONMENT_entry = 0xC100; // 1100 0001 0000 0000
const TAG_ENVIRONMENT_frame = 0xC101; // 1100 0001 0000 0001
const TAG_ENVIRONMENT_hash_table = 0xC102; // 1100 0001 0000 0010

const TAG_CONTEXT_control = 0xC200; // 1100 0010 0000 0000
const TAG_CONTEXT_stash = 0xC201; // 1100 0010 0000 0001
const TAG_CONTEXT_env = 0xC202; // 1100 0010 0000 0010
const TAG_CONTEXT_thread = 0xC203; // 1100 0010 0000 0011

const TAGSTRING_PRIMITIVE_nil = "nil";
const TAGSTRING_PRIMITIVE_bool = "bool";
const TAGSTRING_PRIMITIVE_int32 = "int32";
const TAGSTRING_PRIMITIVE_float32 = "float32";
const TAGSTRING_PRIMITIVE_rune = "rune";

const TAGSTRING_COMPLEX_array = "array";
const TAGSTRING_COMPLEX_string = "string";
const TAGSTRING_COMPLEX_linked_list = "linked_list";
const TAGSTRING_COMPLEX_pointer = "pointer";
const TAGSTRING_COMPLEX_hash_table = "hash_table";
const TAGSTRING_COMPLEX_builtin = "builtin";

const TAGSTRING_CONTROL_name = "name";
const TAGSTRING_CONTROL_literal = "literal";
const TAGSTRING_CONTROL_var = "var";
const TAGSTRING_CONTROL_assign = "assign";
const TAGSTRING_CONTROL_unary = "unary";
const TAGSTRING_CONTROL_postfix = "postfix";
const TAGSTRING_CONTROL_binary = "binary";
const TAGSTRING_CONTROL_sequence = "sequence";
const TAGSTRING_CONTROL_function = "function";
const TAGSTRING_CONTROL_call = "call";
const TAGSTRING_CONTROL_lambda_call = "lambda-call";
const TAGSTRING_CONTROL_block = "block";
const TAGSTRING_CONTROL_for = "for";
const TAGSTRING_CONTROL_break = "break";
const TAGSTRING_CONTROL_continue = "continue";
const TAGSTRING_CONTROL_if = "if";
const TAGSTRING_CONTROL_return = "return";

const TAGSTRING_CONTROL_unary_i = "unary_i";
const TAGSTRING_CONTROL_binary_i = "binary_i";
const TAGSTRING_CONTROL_pop_i = "pop_i";
const TAGSTRING_CONTROL_var_i = "var_i";
const TAGSTRING_CONTROL_assign_i = "assign_i";
const TAGSTRING_CONTROL_exit_scope_i = "exit-scope_i";
const TAGSTRING_CONTROL_for_i = "for_i";
const TAGSTRING_CONTROL_if_i = "if_i";
const TAGSTRING_CONTROL_call_i = "call_i";
const TAGSTRING_CONTROL_restore_env_i = "restore-env_i";
const TAGSTRING_CONTROL_return_i = "return_i";

const TAGSTRING_ENVIRONMENT_frame = "frame";

export {
  TAG_PRIMITIVE_nil,
  TAG_PRIMITIVE_bool,
  TAG_PRIMITIVE_int32,
  TAG_PRIMITIVE_float32,
  TAG_PRIMITIVE_rune,
  TAG_PRIMITIVE_undefined,
  TAG_COMPLEX_array,
  TAG_COMPLEX_string,
  TAG_COMPLEX_linked_list,
  TAG_COMPLEX_pointer,
  TAG_COMPLEX_function,
  TAG_COMPLEX_builtin,
  TAG_CONTROL_name,
  TAG_CONTROL_literal,
  TAG_CONTROL_var,
  TAG_CONTROL_assign,
  TAG_CONTROL_unary,
  TAG_CONTROL_postfix,
  TAG_CONTROL_binary,
  TAG_CONTROL_sequence,
  TAG_CONTROL_function,
  TAG_CONTROL_call,
  TAG_CONTROL_lambda_call,
  TAG_CONTROL_block,
  TAG_CONTROL_for,
  TAG_CONTROL_break,
  TAG_CONTROL_continue,
  TAG_CONTROL_if,
  TAG_CONTROL_unary_i,
  TAG_CONTROL_binary_i,
  TAG_CONTROL_pop_i,
  TAG_CONTROL_var_i,
  TAG_CONTROL_assign_i,
  TAG_CONTROL_exit_scope_i,
  TAG_CONTROL_for_i,
  TAG_CONTROL_if_i,
  TAG_CONTROL_call_i,
  TAG_CONTROL_restore_env_i,
  TAG_CONTROL_return,
  TAG_CONTROL_return_i,
  TAG_ENVIRONMENT_entry,
  TAG_ENVIRONMENT_frame,
  TAG_ENVIRONMENT_hash_table,
  TAG_CONTEXT_control,
  TAG_CONTEXT_stash,
  TAG_CONTEXT_env,
  TAG_CONTEXT_thread,
  TAGSTRING_PRIMITIVE_nil,
  TAGSTRING_PRIMITIVE_bool,
  TAGSTRING_PRIMITIVE_int32,
  TAGSTRING_PRIMITIVE_float32,
  TAGSTRING_PRIMITIVE_rune,
  TAGSTRING_COMPLEX_array,
  TAGSTRING_COMPLEX_string,
  TAGSTRING_COMPLEX_linked_list,
  TAGSTRING_COMPLEX_pointer,
  TAGSTRING_COMPLEX_hash_table,
  TAGSTRING_COMPLEX_builtin,
  TAGSTRING_CONTROL_name,
  TAGSTRING_CONTROL_literal,
  TAGSTRING_CONTROL_var,
  TAGSTRING_CONTROL_assign,
  TAGSTRING_CONTROL_unary,
  TAGSTRING_CONTROL_postfix,
  TAGSTRING_CONTROL_binary,
  TAGSTRING_CONTROL_sequence,
  TAGSTRING_CONTROL_function,
  TAGSTRING_CONTROL_call,
  TAGSTRING_CONTROL_lambda_call,
  TAGSTRING_CONTROL_block,
  TAGSTRING_CONTROL_for,
  TAGSTRING_CONTROL_break,
  TAGSTRING_CONTROL_continue,
  TAGSTRING_CONTROL_if,
  TAGSTRING_CONTROL_unary_i,
  TAGSTRING_CONTROL_binary_i,
  TAGSTRING_CONTROL_pop_i,
  TAGSTRING_CONTROL_var_i,
  TAGSTRING_CONTROL_assign_i,
  TAGSTRING_CONTROL_exit_scope_i,
  TAGSTRING_CONTROL_for_i,
  TAGSTRING_CONTROL_if_i,
  TAGSTRING_CONTROL_call_i,
  TAGSTRING_CONTROL_restore_env_i,
  TAGSTRING_CONTROL_return,
  TAGSTRING_CONTROL_return_i,
  TAGSTRING_ENVIRONMENT_frame,
};
