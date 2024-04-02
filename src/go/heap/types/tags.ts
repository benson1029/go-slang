export const TAG_PRIMITIVE_nil = 0x0000; // 0000 0000 0000 0000
export const TAG_PRIMITIVE_bool = 0x0001; // 0000 0000 0000 0001
export const TAG_PRIMITIVE_int32 = 0x0002; // 0000 0000 0000 0010
export const TAG_PRIMITIVE_float32 = 0x0003; // 0000 0000 0000 0011
export const TAG_PRIMITIVE_rune = 0x0004; // 0000 0000 0000 0100
export const TAG_PRIMITIVE_undefined = 0x0005; // 0000 0000 0000 0101

export const TAG_COMPLEX_array = 0x4001; // 0100 0000 0000 0001
// export const TAG_COMPLEX_slice             = 0x4002; // 0100 0000 0000 0010
export const TAG_COMPLEX_string = 0x4003; // 0100 0000 0000 0011
export const TAG_COMPLEX_linked_list = 0x4004; // 0100 0000 0000 0100
export const TAG_COMPLEX_pointer = 0x4006; // 0100 0000 0000 0110
export const TAG_COMPLEX_function = 0x4007; // 0100 0000 0000 0111
export const TAG_COMPLEX_builtin = 0x4008; // 0100 0000 0000 1000
export const TAG_COMPLEX_queue = 0x4009; // 0100 0000 0000 1001
export const TAG_COMPLEX_mutex = 0x400A; // 0100 0000 0000 1010

export const TAG_COMPLEX_semaphore = 0x400C; // 0100 0000 0000 1100


export const TAG_CONTROL_pop_i = 0x8001; // 1000 0000 0000 0001
export const TAG_CONTROL_exit_scope_i = 0x8002; // 1000 0000 0000 0010
export const TAG_CONTROL_break = 0x8003; // 1000 0000 0000 0011
export const TAG_CONTROL_continue = 0x8004; // 1000 0000 0000 0100
export const TAG_CONTROL_return_i = 0x8005; // 1000 0000 0000 0101
export const TAG_CONTROL_assign_i = 0x8006; // 1000 0000 0000 0110
export const TAG_CONTROL_index_i = 0x8007; // 1000 0000 0000 0111
export const TAG_CONTROL_index_address_i = 0x8008; // 1000 0000 0000 1000

export const TAG_CONTROL_name = 0xC001; // 1100 0000 0000 0001
export const TAG_CONTROL_literal = 0xC002; // 1100 0000 0000 0010
export const TAG_CONTROL_var = 0xC003; // 1100 0000 0000 0011
export const TAG_CONTROL_assign = 0xC004; // 1100 0000 0000 0100
export const TAG_CONTROL_unary = 0xC005; // 1100 0000 0000 0101
export const TAG_CONTROL_postfix = 0xC006; // 1100 0000 0000 0110
export const TAG_CONTROL_binary = 0xC007; // 1100 0000 0000 0111
export const TAG_CONTROL_sequence = 0xC008; // 1100 0000 0000 1000
// export const TAG_CONTROL_block             = 0xC009; // 1100 0000 0000 1001
// export const TAG_CONTROL_if                = 0xC00A; // 1100 0000 0000 1010
// export const TAG_CONTROL_for               = 0xC00B; // 1100 0000 0000 1011
// export const TAG_CONTROL_break             = 0xC00C; // 1100 0000 0000 1100
// export const TAG_CONTROL_continue          = 0xC00D; // 1100 0000 0000 1101
// export const TAG_CONTROL_defer             = 0xC00E; // 1100 0000 0000 1110
export const TAG_CONTROL_return            = 0xC00F; // 1100 0000 0000 1111
export const TAG_CONTROL_function = 0xC010; // 1100 0000 0001 0000
export const TAG_CONTROL_call = 0xC011; // 1100 0000 0001 0001
export const TAG_CONTROL_unary_i = 0xC013; // 1100 0000 0001 0011
export const TAG_CONTROL_binary_i = 0xC014; // 1100 0000 0001 0100
export const TAG_CONTROL_var_i = 0xC016; // 1100 0000 0001 0110
export const TAG_CONTROL_block = 0xC018; // 1100 0000 0001 1000
export const TAG_CONTROL_for = 0xC019; // 1100 0000 0001 1001
export const TAG_CONTROL_for_i = 0xC01A; // 1100 0000 0001 1010
export const TAG_CONTROL_if = 0xC01B; // 1100 0000 0001 1011
export const TAG_CONTROL_if_i = 0xC01C; // 1100 0000 0001 1100
export const TAG_CONTROL_call_i = 0xC01D; // 1100 0000 0001 1101
export const TAG_CONTROL_restore_env_i = 0xC01E; // 1100 0000 0001 1110
export const TAG_CONTROL_logical_i = 0xC020; // 1100 0000 0010 0000
export const TAG_CONTROL_logical_imm_i = 0xC021; // 1100 0000 0010 0001
export const TAG_CONTROL_call_stmt = 0xC022; // 1100 0000 0010 0010
export const TAG_CONTROL_go_call_stmt = 0xC023; // 1100 0000 0010 0011
export const TAG_CONTROL_struct = 0xC024; // 1100 0000 0010 0100
export const TAG_CONTROL_member = 0xC025; // 1100 0000 0010 0101
export const TAG_CONTROL_member_address = 0xC026; // 1100 0000 0010 0110
export const TAG_CONTROL_member_i = 0xC027; // 1100 0000 0010 0111
export const TAG_CONTROL_name_address = 0xC028; // 1100 0000 0010 1000
export const TAG_CONTROL_make = 0xC029; // 1100 0000 0010 1001
export const TAG_CONTROL_index = 0xC02A; // 1100 0000 0010 1010
export const TAG_CONTROL_index_address = 0xC02B; // 1100 0000 0010 1011
export const TAG_CONTROL_constructor = 0xC02C; // 1100 0000 0010 1100
export const TAG_CONTROL_constructor_i = 0xC02D; // 1100 0000 0010 1101
export const TAG_CONTROL_chan_send = 0xC02E; // 1100 0000 0010 1110
export const TAG_CONTROL_chan_send_i = 0xC02F; // 1100 0000 0010 1111
export const TAG_CONTROL_chan_receive = 0xC030; // 1100 0000 0011 0000
export const TAG_CONTROL_chan_receive_i = 0xC031; // 1100 0000 0011 0001
export const TAG_CONTROL_chan_receive_stmt = 0xC032; // 1100 0000 0011 0010

export const TAG_ENVIRONMENT_entry = 0xC100; // 1100 0001 0000 0000
export const TAG_ENVIRONMENT_frame = 0xC101; // 1100 0001 0000 0001
export const TAG_ENVIRONMENT_hash_table = 0xC102; // 1100 0001 0000 0010

export const TAG_CONTEXT_control = 0xC200; // 1100 0010 0000 0000
export const TAG_CONTEXT_stash = 0xC201; // 1100 0010 0000 0001
export const TAG_CONTEXT_env = 0xC202; // 1100 0010 0000 0010
export const TAG_CONTEXT_thread = 0xC203; // 1100 0010 0000 0011
export const TAG_CONTEXT_scheduler = 0xC204; // 1100 0010 0000 0100
export const TAG_CONTEXT_waker = 0xC205; // 1100 0010 0000 0101


export const TAG_USER_variable = 0xC301; // 1100 0011 0000 0001
export const TAG_USER_struct = 0xC302; // 1100 0011 0000 0010
export const TAG_USER_channel = 0xC303; // 1100 0011 0000 0011

export const TAG_USER_type_struct = 0xC300; // 1100 0011 0000 0000
export const TAG_USER_type_int32 = 0xC303; // 1100 0011 0000 0011
export const TAG_USER_type_float32 = 0xC304; // 1100 0011 0000 0100
export const TAG_USER_type_bool = 0xC305; // 1100 0011 0000 0101
export const TAG_USER_type_string = 0xC306; // 1100 0011 0000 0110
export const TAG_USER_type_array = 0xC307; // 1100 0011 0000 0111
export const TAG_USER_type_function = 0xC308; // 1100 0011 0000 1000
export const TAG_USER_type_channel = 0xC309; // 1100 0011 0000 1001
export const TAG_USER_type_slice = 0xC30A; // 1100 0011 0000 1010
export const TAG_USER_type_nil = 0xC30B; // 1100 0011 0000 1011
export const TAG_USER_type_builtin = 0xC30C; // 1100 0011 0000 1100
export const TAG_USER_type_struct_decl = 0xC30D; // 1100 0011 0000 1101

export const TAGSTRING_PRIMITIVE_nil = "nil";
export const TAGSTRING_PRIMITIVE_bool = "bool";
export const TAGSTRING_PRIMITIVE_int32 = "int32";
export const TAGSTRING_PRIMITIVE_float32 = "float32";
export const TAGSTRING_PRIMITIVE_rune = "rune";

export const TAGSTRING_COMPLEX_array = "array";
export const TAGSTRING_COMPLEX_string = "string";
export const TAGSTRING_COMPLEX_linked_list = "linked_list";
export const TAGSTRING_COMPLEX_pointer = "pointer";
export const TAGSTRING_COMPLEX_hash_table = "hash_table";
export const TAGSTRING_COMPLEX_builtin = "builtin";

export const TAGSTRING_CONTROL_name = "name";
export const TAGSTRING_CONTROL_literal = "literal";
export const TAGSTRING_CONTROL_var = "var";
export const TAGSTRING_CONTROL_assign = "assign";
export const TAGSTRING_CONTROL_unary = "unary";
export const TAGSTRING_CONTROL_postfix = "postfix";
export const TAGSTRING_CONTROL_binary = "binary";
export const TAGSTRING_CONTROL_sequence = "sequence";
export const TAGSTRING_CONTROL_function = "function";
export const TAGSTRING_CONTROL_call = "call";
export const TAGSTRING_CONTROL_block = "block";
export const TAGSTRING_CONTROL_for = "for";
export const TAGSTRING_CONTROL_break = "break";
export const TAGSTRING_CONTROL_continue = "continue";
export const TAGSTRING_CONTROL_if = "if";
export const TAGSTRING_CONTROL_return = "return";
export const TAGSTRING_CONTROL_call_stmt = "call-stmt";
export const TAGSTRING_CONTROL_go_call_stmt = "go-call-stmt";
export const TAGSTRING_CONTROL_member = "member";
export const TAGSTRING_CONTROL_member_address = "member-address";
export const TAGSTRING_CONTROL_name_address = "name-address";
export const TAGSTRING_CONTROL_make = "make";
export const TAGSTRING_CONTROL_index = "index";
export const TAGSTRING_CONTROL_index_address = "index-address";
export const TAGSTRING_CONTROL_constructor = "constructor";

export const TAGSTRING_CONTROL_unary_i = "unary_i";
export const TAGSTRING_CONTROL_binary_i = "binary_i";
export const TAGSTRING_CONTROL_pop_i = "pop_i";
export const TAGSTRING_CONTROL_var_i = "var_i";
export const TAGSTRING_CONTROL_assign_i = "assign_i";
export const TAGSTRING_CONTROL_exit_scope_i = "exit-scope_i";
export const TAGSTRING_CONTROL_for_i = "for_i";
export const TAGSTRING_CONTROL_if_i = "if_i";
export const TAGSTRING_CONTROL_call_i = "call_i";
export const TAGSTRING_CONTROL_restore_env_i = "restore-env_i";
export const TAGSTRING_CONTROL_return_i = "return_i";
export const TAGSTRING_CONTROL_logical_i = "logical_i";
export const TAGSTRING_CONTROL_logical_imm_i = "logical_imm_i";
export const TAGSTRING_CONTROL_member_i = "member_i";
export const TAGSTRING_CONTROL_index_i = "index_i";
export const TAGSTRING_CONTROL_index_address_i = "index_address_i";
export const TAGSTRING_CONTROL_constructor_i = "constructor_i";
export const TAGSTRING_CONTROL_chan_send = "chan-send";
export const TAGSTRING_CONTROL_chan_receive = "chan-receive";
export const TAGSTRING_CONTROL_chan_receive_stmt = "chan-receive-stmt";


export const TAGSTRING_USER_type_bool = "bool-type";
export const TAGSTRING_USER_type_int32 = "int32-type";
export const TAGSTRING_USER_type_float32 = "float32-type";
export const TAGSTRING_USER_type_string = "string-type";
export const TAGSTRING_USER_type_array = "array-type";
export const TAGSTRING_USER_type_function = "function-type";
export const TAGSTRING_USER_type_channel = "channel-type";
export const TAGSTRING_USER_type_slice = "slice-type";
export const TAGSTRING_USER_type_struct_decl = "struct-decl-type";
export const TAGSTRING_USER_type_struct = "struct-type";

export const TAGSTRING_ENVIRONMENT_frame = "frame";
