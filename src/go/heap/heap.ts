/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuddyAllocator, WORD_SIZE } from "./alloc";

// TODO: Store the contents in the BuddyAllocator. This is a placeholder.

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
 *     - 2 bit
 *       - 00 if primitive
 *       - 10 if complex
 *       - 11 if control object (program code)
 *     - 14 bit : tag
 *   - 1 byte   : number of fields
 *     - fields are additional information which are not addresses
 * - Payload (4 bytes)
 *   - if primitve, the actual value
 *   - otherwise, the reference count
 * - The rest of the object (4 bytes * field)
 *   - Additional information
 *   - If field > 0, the first word is the number of children
 * - The children of the object (4 bytes * number of children)
 *   - each is an address of the child object
 *
 * Therefore, an object has:
 * - 4 byte     : Metadata
 * - 4 byte     : Payload
 * - 4 byte * f : Fields
 * - 4 byte * c : Children
 */

const TAG_PRIMITIVE_nil             = 0x0000; // 0000 0000 0000 0000
const TAG_PRIMITIVE_bool            = 0x0001; // 0000 0000 0000 0001
const TAG_PRIMITIVE_int32           = 0x0002; // 0000 0000 0000 0010
const TAG_PRIMITIVE_float32         = 0x0003; // 0000 0000 0000 0011
const TAG_PRIMITIVE_rune            = 0x0004; // 0000 0000 0000 0100

// const TAG_COMPLEX_array             = 0x8001; // 1000 0000 0000 0001
// const TAG_COMPLEX_slice             = 0x8002; // 1000 0000 0000 0010
const TAG_COMPLEX_string            = 0x8003; // 1000 0000 0000 0011
// const TAG_COMPLEX_linked_list       = 0x8004; // 1000 0000 0000 0100
// const TAG_COMPLEX_hash_table        = 0x8005; // 1000 0000 0000 0101

const TAG_CONTROL_name              = 0xC001; // 1100 0000 0000 0001
const TAG_CONTROL_literal           = 0xC002; // 1100 0000 0000 0010
const TAG_CONTROL_var               = 0xC003; // 1100 0000 0000 0011
const TAG_CONTROL_assign            = 0xC004; // 1100 0000 0000 0100
// const TAG_CONTROL_unary             = 0xC005; // 1100 0000 0000 0101
// const TAG_CONTROL_postfix           = 0xC006; // 1100 0000 0000 0110
// const TAG_CONTROL_binary            = 0xC007; // 1100 0000 0000 0111
// const TAG_CONTROL_sequence          = 0xC008; // 1100 0000 0000 1000
// const TAG_CONTROL_block             = 0xC009; // 1100 0000 0000 1001
// const TAG_CONTROL_if                = 0xC00A; // 1100 0000 0000 1010
// const TAG_CONTROL_for               = 0xC00B; // 1100 0000 0000 1011
// const TAG_CONTROL_break             = 0xC00C; // 1100 0000 0000 1100
// const TAG_CONTROL_continue          = 0xC00D; // 1100 0000 0000 1101
// const TAG_CONTROL_defer             = 0xC00E; // 1100 0000 0000 1110
// const TAG_CONTROL_return            = 0xC00F; // 1100 0000 0000 1111
// const TAG_CONTROL_function          = 0xC010; // 1100 0000 0001 0000
// const TAG_CONTROL_call              = 0xC011; // 1100 0000 0001 0001
// const TAG_CONTROL_lambda            = 0xC012; // 1100 0000 0001 0010
// const TAG_CONTROL_lambda_call       = 0xC013; // 1100 0000 0001 0011

class ObjectAllocator {
    private heap: BuddyAllocator;

    public allocate_object(tag: number, fields: number, children: number): number {
        const words = 2 + fields + children;
        const address = this.heap.allocate(words);

        if (address === null) {
            return null;
        }

        // Write metadata
        this.heap.memory_set_2_bytes(address + 1, tag);

        // Set number of fields
        this.heap.memory_set_byte(address + 3, fields);

        // Set number of children
        if (children > 0) {
            if (fields <= 0) {
                throw new Error("Trying to set children when there is no fields");
            }

            // The first field must be number of children
            this.set_number_of_children(address, children);
        }

        return address;
    }

    public get_tag(address: number): number {
        return this.heap.memory_get_2_bytes(address + 1);
    }

    public get_number_of_fields(address: number): number {
        return this.heap.memory_get_byte(address + 3);
    }

    public get_payload(address: number): number {
        return this.heap.memory_get_word(address + WORD_SIZE);
    }

    public set_payload(address: number, value: number): void {
        this.heap.memory_set_word(address + WORD_SIZE, value);
    }

    public get_field(address: number, index: number): number { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        return this.heap.memory_get_word(address + (2 + index) * WORD_SIZE);
    }

    public set_field(address: number, index: number, value: number): void { // 0-indexed
        const fields = this.get_number_of_fields(address);
        if (index < 0 || index >= fields) {
            throw new Error("Field index out of range");
        }
        this.heap.memory_set_word(address + (2 + index) * WORD_SIZE, value);
    }

    public get_number_of_children(address: number): number {
        const fields = this.get_number_of_fields(address);
        if (fields === 0) {
            return 0;
        }
        return this.get_field(address, 0);
    }

    public set_number_of_children(address: number, value: number): void {
        const fields = this.get_number_of_fields(address);
        if (fields === 0) {
            throw new Error("Trying to set children when there is no children");
        }
        this.set_field(address, 0, value);
    }

    public get_children(address: number, index: number): number { // 0-indexed
        const fields = this.get_number_of_fields(address);
        const num_children = this.get_number_of_children(address);
        if (index < 0 || index >= num_children) {
            throw new Error("Children index out of range");
        }
        return this.heap.memory_get_word(address + (2 + fields + index) * WORD_SIZE);
    }

    public set_children(address: number, index: number, value: number): void { // 0-indexed
        const fields = this.get_number_of_fields(address);
        const num_children = this.get_number_of_children(address);
        if (index < 0 || index >= num_children) {
            throw new Error("Children index out of range");
        }
        this.heap.memory_set_word(address + (2 + fields + index) * WORD_SIZE, value);
    }

    public is_primitive(address: number): boolean {
        const tag = this.get_tag(address);
        // If first bit is 0, it is a primitive
        return (tag & 0x8000) === 0x0000;
    }

    public get_reference_count(address: number): number {
        if (this.is_primitive(address)) {
            throw new Error("Trying to get reference count of a primitive");
        }
        return this.get_payload(address);
    }

    public increment_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.set_payload(address, ref_count + 1);
    }

    public decrement_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.set_payload(address, ref_count - 1);
    }

    public set_cannnot_be_freed(address: number, value: boolean): void {
        this.heap.set_cannnot_be_freed(address, value);
    }

    public copy_object(address: number): number {
        if (!this.is_primitive(address)) {
            // Increase the reference count
            this.increment_reference_count(address);
            return address;
        }

        // Primitive object, copy the whole thing
        const tag = this.get_tag(address);
        const fields = this.get_number_of_fields(address);
        const children = this.get_number_of_children(address);
        const new_address = this.allocate_object(tag, fields, children);

        // Copy payload
        this.set_payload(new_address, this.get_payload(address));

        // Copy fields
        for (let i = 0; i < fields; i++) {
            this.set_field(new_address, i, this.get_field(address, i));
        }

        // Copy children
        for (let i = 0; i < children; i++) {
            this.set_children(new_address, i, this.get_children(address, i));
        }

        return new_address;
    }

    public free_object(address: number): void {
        if (this.is_primitive(address)) {
            this.heap.deallocate(address);
            return;
        }

        // Decrease the reference count
        this.decrement_reference_count(address);
        if (this.get_reference_count(address) === 0) {
            // Free the children
            const num_children = this.get_number_of_children(address);
            for (let i = 0; i < num_children; i++) {
                this.free_object(this.get_children(address, i));
            }
            this.heap.deallocate(address);
        }
    }

    constructor(memory: number) { // memory is in bytes
        const num_words = Math.floor(memory / WORD_SIZE);
        this.heap = new BuddyAllocator(num_words);
    }
}

class Heap {
    allocator: ObjectAllocator;

    constructor(memory: number) {
        this.allocator = new ObjectAllocator(memory);
    }

    public mark_and_sweep(): void {

    }

    public allocate_object(tag: number, fields: number, children: number): number {
        let address = this.allocator.allocate_object(tag, fields, children);
        if (address === null) {
            this.mark_and_sweep();
            address = this.allocator.allocate_object(tag, fields, children);
        }
        if (address === null) {
            throw new Error("Out of memory");
        }
        return address;
    }

    /**
     * PRIMITIVE_nil
     * Structure : [4 bytes metadata, 4 bytes value]
     * Fields    : None
     * Children  : None
     *
     * @returns address of the object
     */
    public allocate_PRIMITIVE_nil(): number {
        const address = this.allocate_object(TAG_PRIMITIVE_nil, 0, 0);
        return address;
    }

    /**
     * PRIMITIVE_bool
     * Structure : [4 bytes metadata, 4 bytes value]
     * Fields    : None
     * Children  : None
     *
     * @param value boolean value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_bool(value: boolean): number {
        const address = this.allocate_object(TAG_PRIMITIVE_bool, 0, 0);
        this.allocator.set_payload(address, value ? 1 : 0);
        return address;
    }

    /**
     * PRIMITIVE_int
     * Structure : [4 bytes metadata, 4 bytes value]
     * Fields    : None
     * Children  : None
     *
     * @param value integer value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_int32(value: number): number {
        const address = this.allocate_object(TAG_PRIMITIVE_int32, 0, 0);
        this.allocator.set_payload(address, value);
        return address;
    }

    /**
     * PRIMITIVE_float32
     * Structure : [4 bytes metadata, 4 bytes value]
     * Fields    : None
     * Children  : None
     *
     * @param value float32 value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_float32(value: number): number {
        const address = this.allocate_object(TAG_PRIMITIVE_float32, 0, 0);
        this.allocator.set_payload(address, value);
        return address;
    }

    /**
     * PRIMITIVE_rune
     * Structure : [4 bytes metadata, 4 bytes value]
     * Fields    : None
     * Children  : None
     *
     * @param value rune value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_rune(value: number): number {
        const address = this.allocate_object(TAG_PRIMITIVE_rune, 0, 0);
        this.allocator.set_payload(address, value);
        return address;
    }

    /**
     * COMPLEX_string
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  : characters of the string (each PRIMITIVE_rune)
     *
     * @param str string value
     * @returns address of the object
     */
    public allocate_COMPLEX_string(str: string): number {
        const address = this.allocate_object(TAG_COMPLEX_string, 1, str.length);
        this.allocator.increment_reference_count(address);
        for (let i = 0; i < str.length; i++) {
            const rune = this.allocate_PRIMITIVE_rune(str.charCodeAt(i));
            this.allocator.set_children(address, i, rune);
        }
        return address;
    }

    /**
     * CONTROL_name
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_name(obj: { tag: string, name: string }): number {
        const address = this.allocate_object(TAG_CONTROL_name, 1, 1);
        this.allocator.set_cannnot_be_freed(address, true);

        const name_address = this.allocate_COMPLEX_string(obj.name);
        this.allocator.set_cannnot_be_freed(name_address, true);

        // Metadata
        this.allocator.increment_reference_count(address);
        this.allocator.set_children(address, 0, name_address);

        // Remove cannot-be-freed marker
        this.allocator.set_cannnot_be_freed(address, false);
        this.allocator.set_cannnot_be_freed(name_address, false);

        return address;
    }

    /**
     * CONTROL_literal
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the value
     *
     * @param obj control object
     * @returns address of the object
    */
    public allocate_CONTROL_literal(obj: { tag: string, type: string, value: any }): number {
        const address = this.allocate_object(TAG_CONTROL_literal, 1, 1);
        this.allocator.set_cannnot_be_freed(address, true);

        let value_address: number;
        switch (obj.type) {
            case "bool":
                value_address = this.allocate_PRIMITIVE_bool(obj.value);
                break;
            case "int32":
                value_address = this.allocate_PRIMITIVE_int32(obj.value);
                break;
            case "float32":
                value_address = this.allocate_PRIMITIVE_float32(obj.value);
                break;
            case "string":
                value_address = this.allocate_COMPLEX_string(obj.value);
                break;
            default:
                throw new Error("Unknown type");
        }
        this.allocator.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.allocator.increment_reference_count(address);
        this.allocator.set_children(address, 0, value_address);

        // Remove cannot-be-freed marker
        this.allocator.set_cannnot_be_freed(address, false);
        this.allocator.set_cannnot_be_freed(value_address, false);

        return address;
    }

    /**
     * CONTROL_var
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_var(obj: { tag: string, name: string, type: string, value: any }): number {
        const address = this.allocate_object(TAG_CONTROL_var, 1, 2);
        this.allocator.set_cannnot_be_freed(address, true);

        const name_address = this.allocate_COMPLEX_string(obj.name);
        this.allocator.set_cannnot_be_freed(name_address, true);

        const value_address = this.allocate_any(obj.value);
        this.allocator.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.allocator.increment_reference_count(address);
        this.allocator.set_children(address, 0, name_address);
        this.allocator.set_children(address, 1, value_address);

        // Remove cannot-be-freed marker
        this.allocator.set_cannnot_be_freed(address, false);
        this.allocator.set_cannnot_be_freed(name_address, false);
        this.allocator.set_cannnot_be_freed(value_address, false);

        return address;
    }

    /**
     * CONTROL_assign
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Fields    : number of children
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value (expression)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_assign(obj: { tag: string, name: string, value: any }): number {
        const address = this.allocate_object(TAG_CONTROL_assign, 1, 2);
        this.allocator.set_cannnot_be_freed(address, true);

        const name_address = this.allocate_COMPLEX_string(obj.name);
        this.allocator.set_cannnot_be_freed(name_address, true);

        const value_address = this.allocate_any(obj.value);
        this.allocator.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.allocator.increment_reference_count(address);
        this.allocator.set_children(address, 0, name_address);
        this.allocator.set_children(address, 1, value_address);

        // Remove cannot-be-freed marker
        this.allocator.set_cannnot_be_freed(address, false);
        this.allocator.set_cannnot_be_freed(name_address, false);
        this.allocator.set_cannnot_be_freed(value_address, false);

        return address;
    }

    public allocate_number(value: number): number {
        return value;
    }

    public value_of(address: number): number {
        return address;
    }

    public allocate_any(obj: any): number {
        switch (obj.tag) {
            case TAG_PRIMITIVE_bool:
                return this.allocate_PRIMITIVE_bool(obj);
            case TAG_PRIMITIVE_int32:
                return this.allocate_PRIMITIVE_int32(obj);
            case TAG_PRIMITIVE_float32:
                return this.allocate_PRIMITIVE_float32(obj);
            case TAG_PRIMITIVE_rune:
                return this.allocate_PRIMITIVE_rune(obj);
            case TAG_CONTROL_name:
                return this.allocate_CONTROL_name(obj);
            case TAG_CONTROL_literal:
                return this.allocate_CONTROL_literal(obj);
            case TAG_CONTROL_var:
                return this.allocate_CONTROL_var(obj);
            case TAG_CONTROL_assign:
                return this.allocate_CONTROL_assign(obj);
            default:
                throw new Error("Unknown tag");
        }
    }
}

export { Heap };
