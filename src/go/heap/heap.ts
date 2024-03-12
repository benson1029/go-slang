
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
import { ComplexLinkedList } from "./types/complex/linked_list";
import { ComplexPointer } from "./types/complex/pointer";
import { ComplexString } from "./types/complex/string";
import { ControlAssign } from "./types/control/assign";
import { ControlBinary } from "./types/control/binary";
import { ControlLiteral } from "./types/control/literal";
import { ControlName } from "./types/control/name";
import { ControlPostfix } from "./types/control/postfix";
import { ControlSequence } from "./types/control/sequence";
import { ControlUnary } from "./types/control/unary";
import { ControlVar } from "./types/control/var";
import { PrimitiveBool } from "./types/primitive/bool";
import { PrimitiveFloat32 } from "./types/primitive/float32";
import { PrimitiveInt32 } from "./types/primitive/int32";
import { PrimitiveRune } from "./types/primitive/rune";

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
    TAG_CONTROL_sequence
} from "./types/tags";

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

        // Write metadata
        this.alloc.memory_set_2_bytes(address + 1, tag);

        // Set number of fields
        this.alloc.memory_set_byte(address + 3, fields);

        // Set number of children
        if (children > 0) {
            if (fields <= 0) {
                throw new Error("Trying to set children when there is no fields");
            }
            if (!this.has_children(address)) {
                throw new Error("Trying to set children when there is no children");
            }

            // The first field must be number of children
            this.set_number_of_children(address, children);
        } else {
            if (this.has_children(address)) {
                throw new Error("Trying to set no children when there is children");
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

    public get_field_float32(address: number, index: number): number { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        return this.alloc.memory_get_float32(address + (2 + index) * WORD_SIZE);
    }

    public set_field_float32(address: number, index: number, value: number): void { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        this.alloc.memory_set_float32(address + (2 + index) * WORD_SIZE, value);
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
        this.alloc.set_cannnot_be_freed(address, value);
    }

    public free_object(address: number): void {
        this.decrement_reference_count(address);
        if (this.get_reference_count(address) === 0) {
            // Free the children
            const num_children = this.get_number_of_children(address);
            for (let i = 0; i < num_children; i++) {
                this.free_object(this.get_child(address, i));
            }
            this.alloc.deallocate(address);
        }
    }

    constructor(memory: number) { // memory is in bytes
        const num_words = Math.floor(memory / WORD_SIZE);
        this.alloc = new BuddyAllocator(num_words);

        // Allocate the nil object

        /**
         * PRIMITIVE_nil
         * Structure : [4 bytes metadata, 4 bytes value]
         * Fields    : None
         * Children  : None
         *
         * @returns address of the object
         */
        this.alloc.memory_set_byte(0, 0); // 1 reserved byte for BuddyAllocator
        this.alloc.memory_set_2_bytes(1, TAG_PRIMITIVE_nil); // 2 bytes tag
        this.alloc.memory_set_byte(3, 0); // 1 byte number of fields
        this.alloc.memory_set_word(4, 0); // 4 bytes reference count
    }

    public mark_and_sweep(): void {

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
        return ComplexLinkedList.allocate(this, values);
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
     * CONTROL_name
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_name(obj: { tag: string, name: string }): number {
        return ControlName.allocate(this, obj.name);
    }

    /**
     * CONTROL_literal
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the type (COMPLEX_string)
     * - 4 bytes address of the value
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
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_var(obj: { tag: string, name: string, type: string, value: any }): number {
        return ControlVar.allocate(this, obj.name, obj.value);
    }

    /**
     * CONTROL_assign
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_assign(obj: { tag: string, name: string, value: any }): number {
        return ControlAssign.allocate(this, obj.name, obj.value);
    }

    /**
     * CONTROL_unary
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the operator (MISC_constant_string)
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
     * - 4 bytes address of the operator (MISC_constant_string)
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
     * - 4 bytes address of the operator (MISC_constant_string)
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

    public allocate_number(value: number): number {
        return value;
    }

    public value_of(address: number): number {
        return address;
    }

    public allocate_any(obj: any): number {
        if (obj === null || obj === undefined) {
            return 0;
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
            case TAG_PRIMITIVE_bool:
                return this.allocate_PRIMITIVE_bool(obj);
            case TAG_PRIMITIVE_int32:
                return this.allocate_PRIMITIVE_int32(obj);
            case TAG_PRIMITIVE_float32:
                return this.allocate_PRIMITIVE_float32(obj);
            case TAG_PRIMITIVE_rune:
                return this.allocate_PRIMITIVE_rune(obj);
            case TAG_COMPLEX_string:
                return this.allocate_COMPLEX_string(obj);
            case TAG_COMPLEX_linked_list:
                return this.allocate_COMPLEX_linked_list(obj);
            case TAG_COMPLEX_pointer:
                return this.allocate_COMPLEX_pointer(obj);
            case TAG_CONTROL_name:
                return this.allocate_CONTROL_name(obj);
            case TAG_CONTROL_literal:
                return this.allocate_CONTROL_literal(obj);
            case TAG_CONTROL_var:
                return this.allocate_CONTROL_var(obj);
            case TAG_CONTROL_assign:
                return this.allocate_CONTROL_assign(obj);
            case TAG_CONTROL_unary:
                return this.allocate_CONTROL_unary(obj);
            case TAG_CONTROL_postfix:
                return this.allocate_CONTROL_postfix(obj);
            case TAG_CONTROL_binary:
                return this.allocate_CONTROL_binary(obj);
            case TAG_CONTROL_sequence:
                return this.allocate_CONTROL_sequence(obj);
            default:
                throw new Error("Unknown tag");
        }
    }
}

export { Heap };
