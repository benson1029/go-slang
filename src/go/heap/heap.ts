
/**
 * Memory layout for objects:
 *
 * Each object is at least 8 bytes
 * - Metadata (4 bytes)
 *   - 1 byte   : reserved for BuddyAllocator
 *     - 5 bit  : bucket of allocated memory
 *     - 1 bit  : marker for mark-and-sweep
 *     - 1 bit  : marker for objects that cannot be freed
 *     - 1 bit  : unused
 *   - 2 byte   : type tag of the object
 *     - 1 bit  : 1 if kernel-related objects (control, environment), 0 otherwise
 *     - 1 bit  : 1 if object has children, 0 otherwise
 *     - 14 bit : tag
 *   - 1 byte   : number of fields
 *     - fields are additional information which are not addresses
 * - Reference Count (4 bytes)
 * - The rest of the object (4 bytes * field)
 *   - Additional information
 *   - If has a child, the first field is the number of children
 * - The children of the object (4 bytes * number of children)
 *   - each is an address of the child object
 *
 * Therefore, an object has:
 * - 4 byte     : Metadata
 * - 4 byte     : Payload
 * - 4 byte * f : Fields
 * - 4 byte * c : Children
 *
 * We call an object primitive if first 2 bits of the tag are 00.
 * We call an object complex if first 2 bits of the tag are 01.
 * We call an object control if first 1 bit of the tag are 1.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuddyAllocator, WORD_SIZE } from "./alloc";
import { auto_cast } from "./types/auto_cast";
import { ComplexBuiltin } from "./types/complex/builtin";
import { ComplexLinkedList } from "./types/complex/linked_list";
import { ComplexPointer } from "./types/complex/pointer";
import { ComplexString } from "./types/complex/string";
import { ControlIndex } from "./types/control";
import { ControlAssign } from "./types/control/assign";
import { ControlAssignI } from "./types/control/assign_i";
import { ControlBinary } from "./types/control/binary";
import { ControlBinaryI } from "./types/control/binary_i";
import { ControlBlock } from "./types/control/block";
import { ControlBreak } from "./types/control/break";
import { ControlCall } from "./types/control/call";
import { ControlCallI } from "./types/control/call_i";
import { ControlCallStmt } from "./types/control/call_stmt";
import { ControlContinue } from "./types/control/continue";
import { ControlExitScopeI } from "./types/control/exit_scope";
import { ControlFor } from "./types/control/for";
import { ControlForI } from "./types/control/for_i";
import { ControlFunction } from "./types/control/function";
import { ControlGoCallStmt } from "./types/control/go_call_stmt";
import { ControlIf } from "./types/control/if";
import { ControlIfI } from "./types/control/if_i";
import { ControlIndexAddress } from "./types/control/index_address";
import { ControlIndexAddressI } from "./types/control/index_address_i";
import { ControlIndexI } from "./types/control/index_i";
import { ControlLiteral } from "./types/control/literal";
import { ControlLogicalI } from "./types/control/logical_i";
import { ControlLogicalImmI } from "./types/control/logical_imm_i";
import { ControlMake } from "./types/control/make";
import { ControlMember } from "./types/control/member";
import { ControlMemberAddress } from "./types/control/member_address";
import { ControlMemberI } from "./types/control/member_i";
import { ControlName } from "./types/control/name";
import { ControlNameAddress } from "./types/control/name_address";
import { ControlPopI } from "./types/control/pop_i";
import { ControlPostfix } from "./types/control/postfix";
import { ControlRestoreEnvI } from "./types/control/restore_env_i";
import { ControlReturn } from "./types/control/return";
import { ControlReturnI } from "./types/control/return_i";
import { ControlSequence } from "./types/control/sequence";
import { ControlUnary } from "./types/control/unary";
import { ControlUnaryI } from "./types/control/unary_i";
import { ControlVar } from "./types/control/var";
import { ControlVarI } from "./types/control/var_i";
import { default_value } from "./types/default_value";
import { EnvironmentFrame } from "./types/environment/frame";
import { PrimitiveBool } from "./types/primitive/bool";
import { PrimitiveFloat32 } from "./types/primitive/float32";
import { PrimitiveInt32 } from "./types/primitive/int32";
import { PrimitiveNil } from "./types/primitive/nil";
import { PrimitiveRune } from "./types/primitive/rune";
import { PrimitiveUndefined } from "./types/primitive/undefined";

import {
    TAGSTRING_PRIMITIVE_bool,
    TAGSTRING_PRIMITIVE_int32,
    TAGSTRING_PRIMITIVE_float32,
    TAGSTRING_PRIMITIVE_rune,
    TAGSTRING_COMPLEX_string,
    TAGSTRING_COMPLEX_linked_list,
    TAGSTRING_COMPLEX_pointer,
    TAGSTRING_CONTROL_name,
    TAGSTRING_CONTROL_literal,
    TAGSTRING_CONTROL_var,
    TAGSTRING_CONTROL_assign,
    TAGSTRING_CONTROL_unary,
    TAGSTRING_CONTROL_postfix,
    TAGSTRING_CONTROL_binary,
    TAGSTRING_CONTROL_sequence,
    TAGSTRING_CONTROL_call,
    TAGSTRING_CONTROL_function,
    TAGSTRING_CONTROL_unary_i,
    TAGSTRING_CONTROL_binary_i,
    TAG_PRIMITIVE_nil,
    TAG_PRIMITIVE_undefined,
    TAGSTRING_ENVIRONMENT_frame,
    TAGSTRING_CONTROL_pop_i,
    TAGSTRING_CONTROL_var_i,
    TAGSTRING_CONTROL_assign_i,
    TAGSTRING_CONTROL_block,
    TAGSTRING_CONTROL_exit_scope_i,
    TAGSTRING_CONTROL_for,
    TAGSTRING_CONTROL_for_i,
    TAGSTRING_CONTROL_continue,
    TAGSTRING_CONTROL_break,
    TAGSTRING_CONTROL_if,
    TAGSTRING_CONTROL_if_i,
    TAGSTRING_CONTROL_return,
    TAGSTRING_CONTROL_call_i,
    TAGSTRING_CONTROL_restore_env_i,
    TAGSTRING_CONTROL_return_i,
    TAGSTRING_COMPLEX_builtin,
    TAGSTRING_CONTROL_logical_i,
    TAGSTRING_CONTROL_logical_imm_i,
    TAGSTRING_CONTROL_call_stmt,
    TAGSTRING_CONTROL_go_call_stmt,
    TAGSTRING_CONTROL_member,
    TAGSTRING_CONTROL_member_address,
    TAGSTRING_CONTROL_member_i,
    TAGSTRING_CONTROL_name_address,
    TAGSTRING_CONTROL_make,
    TAGSTRING_USER_type_array,
    TAGSTRING_USER_type_bool,
    TAGSTRING_USER_type_float32,
    TAGSTRING_USER_type_int32,
    TAGSTRING_USER_type_string,
    TAGSTRING_CONTROL_index,
    TAGSTRING_CONTROL_index_i,
    TAGSTRING_CONTROL_index_address,
    TAGSTRING_CONTROL_index_address_i
} from "./types/tags";
import { UserTypeArray } from "./types/user/type/array";
import { UserTypeBool } from "./types/user/type/bool";
import { UserTypeFloat32 } from "./types/user/type/float32";
import { UserTypeInt32 } from "./types/user/type/int32";
import { UserTypeString } from "./types/user/type/string";

class Heap {
    private alloc: BuddyAllocator;


    public allocate_object(tag: number, fields: number, children: number): number {
        const words = 2 + fields + children;
        let address = this.alloc.allocate(words);

        if (address === null) {
            this.mark_and_sweep();
            address = this.alloc.allocate(words);
        }

        if (address === null) {
            throw new Error("Out of memory");
        }

        if (fields < 0 || children < 0) {
            throw new Error("Negative fields or children");
        }

        // Write metadata
        this.alloc.memory_set_2_bytes(address + 1, tag);

        // Set number of fields
        this.alloc.memory_set_byte(address + 3, fields);

        if (this.has_children(address)) {
            if (fields <= 0) {
                throw new Error("Trying to set children when there is no fields");
            }
            // The first field must be number of children
            this.alloc.memory_set_word(address + 2 * WORD_SIZE, children);
        } else {
            if (children > 0) {
                throw new Error("Trying to set number of children when there is no children");
            }
        }

        this.increment_reference_count(address);
        return address;
    }

    public get_tag(address: number): number {
        return this.alloc.memory_get_2_bytes(address + 1);
    }

    public has_children(address: number): boolean {
        const tag = this.get_tag(address);
        return (tag & 0x4000) === 0x4000;
    }

    public get_number_of_fields(address: number): number {
        return this.alloc.memory_get_byte(address + 3);
    }

    public get_field(address: number, index: number): number { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        return this.alloc.memory_get_word(address + (2 + index) * WORD_SIZE);
    }

    public set_field(address: number, index: number, value: number): void { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        this.alloc.memory_set_word(address + (2 + index) * WORD_SIZE, value);
    }

    public get_number_of_children(address: number): number {
        if (!this.has_children(address)) {
            return 0;
        }
        return this.get_field(address, 0);
    }

    public set_number_of_children(address: number, value: number): void {
        if (!this.has_children(address)) {
            throw new Error("Trying to set number of children when there is no children");
        }
        this.set_field(address, 0, value);
    }

    public get_child(address: number, index: number): number { // 0-indexed
        if (!this.has_children(address)) {
            throw new Error("Trying to get children when there is no children");
        }
        const fields = this.get_number_of_fields(address);
        const num_children = this.get_number_of_children(address);
        if (index < 0 || index >= num_children) {
            throw new Error("Children index out of range");
        }
        return this.alloc.memory_get_word(address + (2 + fields + index) * WORD_SIZE);
    }

    public set_child(address: number, index: number, value: number): void { // 0-indexed
        if (!this.has_children(address)) {
            throw new Error("Trying to set children when there is no children");
        }
        const fields = this.get_number_of_fields(address);
        const num_children = this.get_number_of_children(address);
        if (index < 0 || index >= num_children) {
            throw new Error("Children index out of range");
        }
        this.alloc.memory_set_word(address + (2 + fields + index) * WORD_SIZE, value);
    }

    public get_reference_count(address: number): number {
        return this.alloc.memory_get_word(address + WORD_SIZE);
    }

    public set_reference_count(address: number, value: number): void {
        this.alloc.memory_set_word(address + WORD_SIZE, value);
    }

    public increment_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.set_reference_count(address, ref_count + 1);
    }

    public decrement_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.set_reference_count(address, ref_count - 1);
    }

    public set_cannnot_be_freed(address: number, value: boolean): void {
        // if (value === this.alloc.get_cannnot_be_freed(address)) {
        //     console.log("Warning: Setting cannnot_be_freed to the same value " + auto_cast(this, address).stringify());
        // }
        this.alloc.set_cannnot_be_freed(address, value);
    }

    public check_all_free(): boolean {
        return this.alloc.check_all_free(
            (address: number) => auto_cast(this, address).stringify() + " reference count: " + this.get_reference_count(address)
        );
    }

    public free_object(address: number): void {
        this.decrement_reference_count(address);
        if (this.get_reference_count(address) === 0) {
            // console.log("Freeing object: ", auto_cast(this, address).stringify());
            // Free the children
            const num_children = this.get_number_of_children(address);
            for (let i = 0; i < num_children; i++) {
                this.free_object(this.get_child(address, i));
            }
            this.alloc.deallocate(address);
        }
    }

    public copy_object(address: number): number {
        this.set_cannnot_be_freed(address, true);

        const copy_address = this.allocate_object(
            this.get_tag(address),
            this.get_number_of_fields(address),
            this.get_number_of_children(address)
        );
        for (let i = 0; i < this.get_number_of_fields(address); i++) {
            this.set_field(copy_address, i, this.get_field(address, i));
        }
        for (let i = 0; i < this.get_number_of_children(address); i++) {
            this.set_child(copy_address, i, this.reference_object(this.get_child(address, i)));
        }

        this.set_cannnot_be_freed(address, false);
        return copy_address;
    }

    public reference_object(address: number): number {
        this.increment_reference_count(address);
        return address;
    }

    constructor(memory: number) { // memory is in bytes
        const num_words = Math.floor(memory / WORD_SIZE);
        this.alloc = new BuddyAllocator(num_words);

        {
            /**
             * PRIMITIVE_nil
             * Fields    : None
             * Children  : None
             *
             * @returns address of the object
             */
            const address = PrimitiveNil.allocate();
            this.alloc.memory_set_byte(address, 0); // 1 reserved byte for BuddyAllocator
            this.alloc.memory_set_2_bytes(address + 1, TAG_PRIMITIVE_nil); // 2 bytes tag
            this.alloc.memory_set_byte(address + 3, 0); // 1 byte number of fields
            this.alloc.memory_set_word(address + 4, 0); // 4 bytes reference count
            this.alloc.set_cannnot_be_freed(address, true);
        }

        {
            /**
             * PRIMITIVE_undefined
             * Fields    : None
             * Children  : None
             *
             * @returns address of the object
             */
            const address = PrimitiveUndefined.allocate();
            this.alloc.memory_set_byte(address, 0); // 1 reserved byte for BuddyAllocator
            this.alloc.memory_set_2_bytes(address + 1, TAG_PRIMITIVE_undefined); // 2 bytes tag
            this.alloc.memory_set_byte(address + 3, 0); // 1 byte number of fields
            this.alloc.memory_set_word(address + 4, 0); // 4 bytes reference count
            this.alloc.set_cannnot_be_freed(address, true);
        }
    }

    public set_root(address: number): void {
        this.alloc.set_root_address(address);
    }

    public get_root(): number {
        return this.alloc.get_root_address();
    }

    private mark_dfs(address: number): void {
        if (!this.alloc.is_user_address(address)) {
            return;
        }
        if (this.alloc.get_mark_and_sweep(address)) {
            return;
        }
        this.alloc.set_mark_and_sweep(address, true);
        if (this.has_children(address)) {
            const num_children = this.get_number_of_children(address);
            for (let i = 0; i < num_children; i++) {
                this.mark_dfs(this.get_child(address, i));
            }
        }
    }

    public mark_and_sweep(): void {
        const root = this.get_root();
        this.mark_dfs(root);
        this.alloc.mark_all_cannot_be_freed(this.mark_dfs);
        this.alloc.sweep_and_free();
    }

    /**
     * PRIMITIVE_bool
     * Fields    : boolean value
     * Children  : None
     *
     * @param value boolean value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_bool(value: boolean): number {
        return PrimitiveBool.allocate(this, value);
    }

    /**
     * PRIMITIVE_int32
     * Fields    : int32 value
     * Children  : None
     *
     * @param value integer value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_int32(value: number): number {
        return PrimitiveInt32.allocate(this, value);
    }

    /**
     * PRIMITIVE_float32
     * Fields    : float32 value
     * Children  : None
     *
     * @param value float32 value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_float32(value: number): number {
        return PrimitiveFloat32.allocate(this, value);
    }

    /**
     * PRIMITIVE_rune
     * Fields    : rune value (int32)
     * Children  : None
     *
     * @param value rune value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_rune(value: number): number {
        return PrimitiveRune.allocate(this, value);
    }

    /**
     * COMPLEX_string
     * Fields    : number of children
     * Children  : characters of the string (each PRIMITIVE_rune)
     *
     * @param str string value
     * @returns address of the object
     */
    public allocate_COMPLEX_string(str: string): number {
        return ComplexString.allocate(this, str);
    }

    /**
     * COMPLEX_linked_list
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  :
     * - value (any)
     * - next_address node (COMPLEX_linked_list)
     *
     * @param values linked list values
     * @returns address of the object
     */
    public allocate_COMPLEX_linked_list(values: any[]): number {
        return ComplexLinkedList.allocate_from_array(this, values);
    }

    /**
     * COMPLEX_pointer
     * Fields    : number of children
     * Children  : address of the object referenced
     *
     * @param value address value
     * @returns address of the object
     */
    public allocate_COMPLEX_pointer(value: number): number {
        return ComplexPointer.allocate(this, value);
    }

    /**
     * COMPLEX_builtin
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the function name (COMPLEX_string)
     */
    public allocate_COMPLEX_builtin(obj: { tag: string, name: string }): number {
        return ComplexBuiltin.allocate(this, obj.name);
    }

    /**
     * CONTROL_name
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_name(obj: { tag: string, name: string }): number {
        return ControlName.allocate(this, obj.name);
    }

    /**
     * CONTROL_literal
     * Literal will be parsed into one of the PRIMITIVE types
     *
     * @param obj control object
     * @returns address of the object
    */
    public allocate_CONTROL_literal(obj: { tag: string, type: string, value: any }): number {
        return ControlLiteral.allocate(this, obj.type, obj.value);
    }

    /**
     * CONTROL_var
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_var(obj: { tag: string, name: string, type: string, value: any }): number {
        return ControlVar.allocate(this, obj.name, default_value(this, obj.type, obj.value));
    }

    /**
     * CONTROL_assign
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (expression)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_assign(obj: { tag: string, name: any, value: any }): number {
        return ControlAssign.allocate(this, obj.name, obj.value);
    }

    /**
     * CONTROL_unary
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (COMPLEX_string)
     * - 4 bytes address of the operand (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_unary(obj: { tag: string, operator: string, operand: any }): number {
        return ControlUnary.allocate(this, obj.operator, obj.operand);
    }

    /**
     * CONTROL_postfix
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (COMPLEX_string)
     * - 4 bytes address of the operand (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_postfix(obj: { tag: string, operator: string, operand: any }): number {
        return ControlPostfix.allocate(this, obj.operator, obj.operand);
    }

    /**
     * CONTROL_binary
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (COMPLEX_string)
     * - 4 bytes address of the left operand (expression)
     * - 4 bytes address of the right operand (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_binary(obj: { tag: string, operator: string, leftOperand: any, rightOperand: any }): number {
        return ControlBinary.allocate(this, obj.operator, obj.leftOperand, obj.rightOperand);
    }

    /**
     * CONTROL_sequence
     * Fields    : number of children
     * Children  : linked list of expressions
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_sequence(obj: { tag: string, body: any[] }): number {
        return ControlSequence.allocate(this, obj.body);
    }

    /**
     * CONTROL_function
     * Fields    : number of children, number of parameters
     * Children  :
     * - 4 bytes address of the function name (COMPLEX_string)
     * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_function(obj: { tag: string, name: string, params: any[], captures: any[], returnType: string, body: any }): number {
        const param_names: string[] = obj.params.map(param => param.name);
        const capture_names: string[] = obj.captures.map(capture => capture.name);
        return ControlFunction.allocate(this, obj.name, param_names, capture_names, obj.body);
    }

    /**
     * CONTROL_call
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the called function (any)
     * - 4 bytes * num_arguments address of the arguments (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_call(obj: { tag: string, func: any, args: any[] }): number {
        return ControlCall.allocate(this, obj.func, obj.args);
    }

    /**
     * CONTROL_unary_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (COMPLEX_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_unary_i(obj: { tag: string, operator: ComplexString }): number {
        return ControlUnaryI.allocate(this, obj.operator);
    }

    /**
     * CONTROL_binary_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (COMPLEX_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_binary_i(obj: { tag: string, operator: ComplexString }): number {
        return ControlBinaryI.allocate(this, obj.operator);
    }

    /**
     * CONTROL_pop_i
     * Fields    : none
     *
     * @returns address of the object
     */
    public allocate_CONTROL_pop_i(): number {
        return ControlPopI.allocate(this);
    }

    /**
     * CONTROL_var_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_var_i(obj: { tag: string, name: ComplexString }): number {
        return ControlVarI.allocate(this, obj.name);
    }

    /**
     * CONTROL_assign_i
     * Fields    : None
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_assign_i(): number {
        return ControlAssignI.allocate(this);
    }

    /**
     * CONTROL_block
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the body (sequence)
     */
    public allocate_CONTROL_block(obj: { tag: string, body: any }): number {
        return ControlBlock.allocate(this, obj.body);
    }

    /**
     * CONTROL_exit_scope_i
     * Fields    : None
     */
    public allocate_CONTROL_exit_scope_i(): number {
        return ControlExitScopeI.allocate(this);
    }

    /**
     * CONTROL_for
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the init (expression)
     * - 4 bytes address of the condition (expression)
     * - 4 bytes address of the update (expression)
     * - 4 bytes address of the body (block)
     */
    public allocate_CONTROL_for(obj: { tag: string, init: any, condition: any, update: any, body: any }): number {
        return ControlFor.allocate(this, obj.init, obj.condition, obj.update, obj.body);
    }

    /**
     * CONTROL_for_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the condition (expression)
     * - 4 bytes address of the update (assign)
     * - 4 bytes address of the body (block)
     */
    public allocate_CONTROL_for_i(obj: { tag: string, condition: any, update: any, body: any }): number {
        return ControlForI.allocate(this, obj.condition, obj.update, obj.body);
    }

    /**
     * CONTROL_break
     * Fields    : None
     */
    public allocate_CONTROL_break(): number {
        return ControlBreak.allocate(this);
    }

    /**
     * CONTROL_continue
     * Fields    : None
     */
    public allocate_CONTROL_continue(): number {
        return ControlContinue.allocate(this);
    }

    /**
     * CONTROL_if
     * Fields    : Number of children
     * Children  :
     * - 4 bytes address of the condition (expression)
     * - 4 bytes address of the then_body (block)
     * - 4 bytes address of the else_body (block)
     */
    public allocate_CONTROL_if(obj: { tag: string, condition: any, then_body: any, else_body: any }): number {
        return ControlIf.allocate(this, obj.condition, obj.then_body, obj.else_body);
    }

    /**
     * CONTROL_if_i
     * Fields    : Number of children
     * Children  :
     * - 4 bytes address of the then_body (block)
     * - 4 bytes address of the else_body (block)
     */
    public allocate_CONTROL_if_i(obj: { tag: string, then_body: any, else_body: any }): number {
        return ControlIfI.allocate(this, obj.then_body, obj.else_body);
    }

    /**
     * CONTROL_return
     * Fields    : Number of children
     * Children  :
     * - 4 bytes address of the value (expression)
     */
    public allocate_CONTROL_return(obj: { tag: string, value: any }): number {
        return ControlReturn.allocate(this, obj.value);
    }

    /**
     * CONTROL_call_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the number of arguments (PRIMITIVE_number)
     */
    public allocate_CONTROL_call_i(obj: { tag: string, num_args: number }): number {
        return ControlCallI.allocate(this, obj.num_args);
    }

    /**
     * CONTROL_restore_env_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the frame to restore (ENVIRONMENT_frame)
     */
    public allocate_CONTROL_restore_env_i(obj: { tag: string, frame: EnvironmentFrame }): number {
        return ControlRestoreEnvI.allocate(this, obj.frame);
    }

    /**
     * CONTROL_return_i
     * Fields    : none
     */
    public allocate_CONTROL_return_i(): number {
        return ControlReturnI.allocate(this);
    }

    /**
     * CONTROL_logical_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (PRIMITIVE_string)
     */
    public allocate_CONTROL_logical_i(obj: { tag: string, operator: number }): number {
        return ControlLogicalI.allocate(this, obj.operator);
    }

    /**
     * CONTROL_logical_imm_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the right expression (expression)
     * - 4 bytes address of the operator (PRIMITIVE_string)
     */
    public allocate_CONTROL_logical_imm_i(obj: { tag: string, operator: number, right: number }): number {
        return ControlLogicalImmI.allocate(this, obj.right, obj.operator);
    }

    /**
     * CONTROL_call_stmt
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the call expression (CONTROL_call)
     */
    public allocate_CONTROL_call_stmt(obj: { tag: string, body: number }): number {
        return ControlCallStmt.allocate(this, obj.body);
    }

    /**
     * CONTROL_go_call_stmt
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the call expression (CONTROL_call)
     */
    public allocate_CONTROL_go_call_stmt(obj: { tag: string, body: number }): number {
        return ControlGoCallStmt.allocate(this, obj.body);
    }

    /**
     * CONTROL_member
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the object (expression)
     * - 4 bytes address of the member name (COMPLEX_string)
     */
    public allocate_CONTROL_member(obj: { tag: string, object: any, member: string }): number {
        return ControlMember.allocate(this, obj.object, obj.member);
    }

    /**
     * CONTROL_member_address
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the object (expression)
     * - 4 bytes address of the member name (COMPLEX_string)
     */
    public allocate_CONTROL_member_address(obj: { tag: string, object: any, member: string }): number {
        return ControlMemberAddress.allocate(this, obj.object, obj.member);
    }

    /**
     * CONTROL_member_i
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the member name (COMPLEX_string)
     */
    public allocate_CONTROL_member_i(obj: { tag: string, member: ComplexString }): number {
        return ControlMemberI.allocate(this, obj.member);
    }

    /**
     * CONTROL_name_address
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     */
    public allocate_CONTROL_name_address(obj: { tag: string, name: string }): number {
        return ControlNameAddress.allocate(this, obj.name);
    }

    /**
     * CONTROL_make
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the type (type)
     * - 4 bytes * num_arguments address of the arguments (expression)
     */
    public allocate_CONTROL_make(obj: { tag: string, type: any, args: any[] }): number {
        return ControlMake.allocate(this, obj.type, obj.args);
    }

    /**
     * CONTROL_index
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the array (expression)
     * - 4 bytes address of the index (expression)
     */
    public allocate_CONTROL_index(obj: { tag: string, array: any, index: any }): number {
        return ControlIndex.allocate(this, obj.array, obj.index);
    }

    /**
     * CONTROL_index_i
     * Fields    : none
     */
    public allocate_CONTROL_index_i(): number {
        return ControlIndexI.allocate(this);
    }

    /**
     * CONTROL_index_address
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the array (expression)
     * - 4 bytes address of the index (expression)
     */
    public allocate_CONTROL_index_address(obj: { tag: string, array: any, index: any }): number {
        return ControlIndexAddress.allocate(this, obj.array, obj.index);
    }

    /**
     * CONTROL_index_address_i
     * Fields    : none
     */
    public allocate_CONTROL_index_address_i(): number {
        return ControlIndexAddressI.allocate(this);
    }

    /**
     * ENVIRONMENT_frame
     * Fields    : number of children
     * Children  :
     * - parent frame (ENVIRONMENT_frame)
     * - linked list of entries (ENVIRONMENT_entry)
     * @param parent_frame_address address of the parent frame (ENVIRONMENT_frame)
     * @returns address of the object
     */
    public allocate_ENVIRONMENT_frame(obj: { tag: string, parent_frame_address: number }): number {
        return EnvironmentFrame.allocate(this, obj.parent_frame_address);
    }

    /**
     * USER_type_array
     * Fields    :
     * - number of children
     * - size of the array
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     * - 4 bytes address of the type of the array (USER_type)
     */
    public allocate_USER_type_array(obj: { tag: string, len: number, type: any }): number {
        return UserTypeArray.allocate(this, obj.len, obj.type);
    }

    /**
     * USER_type_bool
     * Fields    :
     * - number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     */
    public allocate_USER_type_bool(): number {
        return UserTypeBool.allocate(this);
    }

    /**
     * USER_type_float32
     * Fields    :
     * - number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     */
    public allocate_USER_type_float32(): number {
        return UserTypeFloat32.allocate(this);
    }

    /**
     * USER_type_int32
     * Fields    :
     * - number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     */
    public allocate_USER_type_int32(): number {
        return UserTypeInt32.allocate(this);
    }

    /**
     * USER_type_string
     * Fields    :
     * - number of children
     * Children  :
     * - 4 bytes address of the name (COMPLEX_string)
     */
    public allocate_USER_type_string(): number {
        return UserTypeString.allocate(this);
    }

    public allocate_number(value: number): number {
        return value;
    }

    public value_of(address: number): number {
        return address;
    }

    public allocate_any(obj: any): number {
        if (obj == null) {
            obj = 0;
        }
        if (typeof obj === "number") {
            // obj is a pointer to somewhere already in the alloc
            this.increment_reference_count(obj);
            return obj;
        }
        if (!obj.hasOwnProperty("tag")) {
            throw new Error("Non-pointer object must have a tag");
        }
        switch (obj.tag) {
            case TAGSTRING_PRIMITIVE_bool:
                return this.allocate_PRIMITIVE_bool(obj.value);
            case TAGSTRING_PRIMITIVE_int32:
                return this.allocate_PRIMITIVE_int32(obj.value);
            case TAGSTRING_PRIMITIVE_float32:
                return this.allocate_PRIMITIVE_float32(obj.value);
            case TAGSTRING_PRIMITIVE_rune:
                return this.allocate_PRIMITIVE_rune(obj.value);
            case TAGSTRING_COMPLEX_string:
                return this.allocate_COMPLEX_string(obj);
            case TAGSTRING_COMPLEX_linked_list:
                return this.allocate_COMPLEX_linked_list(obj);
            case TAGSTRING_COMPLEX_pointer:
                return this.allocate_COMPLEX_pointer(obj);
            case TAGSTRING_COMPLEX_builtin:
                return this.allocate_COMPLEX_builtin(obj);
            case TAGSTRING_CONTROL_name:
                return this.allocate_CONTROL_name(obj);
            case TAGSTRING_CONTROL_literal:
                return this.allocate_CONTROL_literal(obj);
            case TAGSTRING_CONTROL_var:
                return this.allocate_CONTROL_var(obj);
            case TAGSTRING_CONTROL_assign:
                return this.allocate_CONTROL_assign(obj);
            case TAGSTRING_CONTROL_unary:
                return this.allocate_CONTROL_unary(obj);
            case TAGSTRING_CONTROL_postfix:
                return this.allocate_CONTROL_postfix(obj);
            case TAGSTRING_CONTROL_binary:
                return this.allocate_CONTROL_binary(obj);
            case TAGSTRING_CONTROL_sequence:
                return this.allocate_CONTROL_sequence(obj);
            case TAGSTRING_CONTROL_function:
                return this.allocate_CONTROL_function(obj);
            case TAGSTRING_CONTROL_call:
                return this.allocate_CONTROL_call(obj);
            case TAGSTRING_CONTROL_unary_i:
                return this.allocate_CONTROL_unary_i(obj);
            case TAGSTRING_CONTROL_binary_i:
                return this.allocate_CONTROL_binary_i(obj);
            case TAGSTRING_CONTROL_pop_i:
                return this.allocate_CONTROL_pop_i();
            case TAGSTRING_CONTROL_var_i:
                return this.allocate_CONTROL_var_i(obj);
            case TAGSTRING_CONTROL_assign_i:
                return this.allocate_CONTROL_assign_i();
            case TAGSTRING_CONTROL_block:
                return this.allocate_CONTROL_block(obj);
            case TAGSTRING_CONTROL_exit_scope_i:
                return this.allocate_CONTROL_exit_scope_i();
            case TAGSTRING_CONTROL_for:
                return this.allocate_CONTROL_for(obj);
            case TAGSTRING_CONTROL_for_i:
                return this.allocate_CONTROL_for_i(obj);
            case TAGSTRING_CONTROL_break:
                return this.allocate_CONTROL_break();
            case TAGSTRING_CONTROL_continue:
                return this.allocate_CONTROL_continue();
            case TAGSTRING_CONTROL_if:
                return this.allocate_CONTROL_if(obj);
            case TAGSTRING_CONTROL_if_i:
                return this.allocate_CONTROL_if_i(obj);
            case TAGSTRING_CONTROL_return:
                return this.allocate_CONTROL_return(obj);
            case TAGSTRING_CONTROL_call_i:
                return this.allocate_CONTROL_call_i(obj);
            case TAGSTRING_CONTROL_restore_env_i:
                return this.allocate_CONTROL_restore_env_i(obj);
            case TAGSTRING_CONTROL_return_i:
                return this.allocate_CONTROL_return_i();
            case TAGSTRING_CONTROL_logical_i:
                return this.allocate_CONTROL_logical_i(obj);
            case TAGSTRING_CONTROL_logical_imm_i:
                return this.allocate_CONTROL_logical_imm_i(obj);
            case TAGSTRING_CONTROL_call_stmt:
                return this.allocate_CONTROL_call_stmt(obj);
            case TAGSTRING_CONTROL_go_call_stmt:
                return this.allocate_CONTROL_go_call_stmt(obj);
            case TAGSTRING_CONTROL_member:
                return this.allocate_CONTROL_member(obj);
            case TAGSTRING_CONTROL_member_address:
                return this.allocate_CONTROL_member_address(obj);
            case TAGSTRING_CONTROL_member_i:
                return this.allocate_CONTROL_member_i(obj);
            case TAGSTRING_CONTROL_name_address:
                return this.allocate_CONTROL_name_address(obj);
            case TAGSTRING_CONTROL_make:
                return this.allocate_CONTROL_make(obj);
            case TAGSTRING_CONTROL_index:
                return this.allocate_CONTROL_index(obj);
            case TAGSTRING_CONTROL_index_i:
                return this.allocate_CONTROL_index_i();
            case TAGSTRING_CONTROL_index_address:
                return this.allocate_CONTROL_index_address(obj);
            case TAGSTRING_CONTROL_index_address_i:
                return this.allocate_CONTROL_index_address_i();
            case TAGSTRING_ENVIRONMENT_frame:
                return this.allocate_ENVIRONMENT_frame(obj);
            case TAGSTRING_USER_type_array:
                return this.allocate_USER_type_array(obj);
            case TAGSTRING_USER_type_bool:
                return this.allocate_USER_type_bool();
            case TAGSTRING_USER_type_float32:
                return this.allocate_USER_type_float32();
            case TAGSTRING_USER_type_int32:
                return this.allocate_USER_type_int32();
            case TAGSTRING_USER_type_string:
                return this.allocate_USER_type_string();
            default:
                throw new Error("Unknown tag " + obj.tag);
        }
    }
}

export { Heap };
