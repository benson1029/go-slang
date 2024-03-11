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
 *   - 1 byte   : number of children
 *     - if primitive, number of additional payload (in words)
 *     - otherwise, number of children
 * - Payload (4 bytes)
 *   - if primitve, the actual value
 *   - otherwise, the reference count
 * - The rest of the object (4f bytes)
 *   - each is an address of the child object
 *
 */

const TAG_PRIMITIVE_bool            = 0x0001; // 0000 0000 0000 0001
const TAG_PRIMITIVE_int             = 0x0002; // 0000 0000 0000 0002
const TAG_PRIMITIVE_float32         = 0x0003; // 0000 0000 0000 0003
const TAG_PRIMITIVE_constant_string = 0x0004; // 0000 0000 0000 0004

const TAG_COMPLEX_array             = 0x8001; // 1000 0000 0000 0001
const TAG_COMPLEX_slice             = 0x8002; // 1000 0000 0000 0010
const TAG_COMPLEX_string            = 0x8003; // 1000 0000 0000 0011
const TAG_COMPLEX_linked_list       = 0x8004; // 1000 0000 0000 0100
const TAG_COMPLEX_hash_table        = 0x8005; // 1000 0000 0000 0101

const TAG_CONTROL_name              = 0xC001; // 1100 0000 0000 0001
const TAG_CONTROL_literal           = 0xC002; // 1100 0000 0000 0010
const TAG_CONTROL_var               = 0xC003; // 1100 0000 0000 0011
const TAG_CONTROL_assign            = 0xC004; // 1100 0000 0000 0100
const TAG_CONTROL_unary             = 0xC005; // 1100 0000 0000 0101
const TAG_CONTROL_postfix           = 0xC006; // 1100 0000 0000 0110
const TAG_CONTROL_binary            = 0xC007; // 1100 0000 0000 0111
const TAG_CONTROL_sequence          = 0xC008; // 1100 0000 0000 1000
const TAG_CONTROL_block             = 0xC009; // 1100 0000 0000 1001
const TAG_CONTROL_if                = 0xC00A; // 1100 0000 0000 1010
const TAG_CONTROL_for               = 0xC00B; // 1100 0000 0000 1011
const TAG_CONTROL_break             = 0xC00C; // 1100 0000 0000 1100
const TAG_CONTROL_continue          = 0xC00D; // 1100 0000 0000 1101
const TAG_CONTROL_defer             = 0xC00E; // 1100 0000 0000 1110
const TAG_CONTROL_return            = 0xC00F; // 1100 0000 0000 1111
const TAG_CONTROL_function          = 0xC010; // 1100 0000 0001 0000
const TAG_CONTROL_call              = 0xC011; // 1100 0000 0001 0001
const TAG_CONTROL_lambda            = 0xC012; // 1100 0000 0001 0010
const TAG_CONTROL_lambda_call       = 0xC013; // 1100 0000 0001 0011

class Heap {
    private heap: BuddyAllocator;

    private write_metadata(address: number, tag: number, children: number): void {
        this.heap.memory_set_2_bytes(address + 1, tag);
        this.set_number_of_children(address, children);
    }

    private get_number_of_children(address: number): number {
        return this.heap.memory_get_byte(address + 3);
    }

    private set_number_of_children(address: number, value: number): void {
        this.heap.memory_set_byte(address + 3, value);
    }

    private get_children(address: number, index: number): number { // 0-indexed
        return this.heap.memory_get_word(address + (2 + index) * WORD_SIZE);
    }

    private set_children(address: number, index: number, value: number): void { // 0-indexed
        this.heap.memory_set_word(address + (2 + index) * WORD_SIZE, value);
    }

    private increment_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.heap.memory_set_word(address + WORD_SIZE, ref_count + 1);
    }

    private decrement_reference_count(address: number): void {
        const ref_count = this.get_reference_count(address);
        this.heap.memory_set_word(address + WORD_SIZE, ref_count - 1);
    }

    private get_reference_count(address: number): number {
        return this.heap.memory_get_word(address + WORD_SIZE);
    }

    private is_primitive(address: number): boolean {
        const tag = this.heap.memory_get_2_bytes(address + 1);
        // If first bit is 0, it is a primitive
        return (tag & 0x8000) === 0x0000;
    }

    private mark_and_sweep(): void {

    }

    private allocate_object(words: number): number {
        let address = this.allocate_object(words);

        if (address === null) {
            this.mark_and_sweep();
            address = this.heap.allocate(words);
        }

        if (address === null) {
            throw new Error("Out of memory");
        }

        return address;
    }

    public copy_object(address: number): number {
        if (!this.is_primitive(address)) {
            // Increase the reference count
            this.increment_reference_count(address);
            return address;
        }

        // Primitive, copy the whole thing
        const num_children = this.get_number_of_children(address);
        const new_address = this.allocate_object(2 + num_children);

        // Copy metadata (except reserved byte)
        for (let i = 1; i < WORD_SIZE; i++) {
            this.heap.memory_set_byte(new_address + i, this.heap.memory_get_byte(address + i));
        }

        // Copy payload
        this.heap.memory_set_word(new_address + WORD_SIZE, this.heap.memory_get_word(address + WORD_SIZE));

        // Copy children
        for (let i = 0; i < num_children; i++) {
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

    /**
     * PRIMITIVE_bool
     * Structure : [4 bytes metadata, 4 bytes value]
     * Children  : None
     *
     * @param value boolean value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_bool(value: boolean): number {
        const address = this.allocate_object(2);
        this.write_metadata(address, TAG_PRIMITIVE_bool, 0);
        this.heap.memory_set_word(address + WORD_SIZE, value ? 1 : 0);
        return address;
    }

    /**
     * PRIMITIVE_int
     * Structure : [4 bytes metadata, 4 bytes value]
     * Children  : None
     *
     * @param value integer value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_int(value: number): number {
        const address = this.allocate_object(2);
        this.write_metadata(address, TAG_PRIMITIVE_int, 0);
        this.heap.memory_set_word(address + WORD_SIZE, value);
        return address;
    }

    /**
     * PRIMITIVE_float32
     * Structure : [4 bytes metadata, 4 bytes value]
     * Children  : None
     *
     * @param value float32 value
     * @returns address of the object
     */
    public allocate_PRIMITIVE_float32(value: number): number {
        const address = this.allocate_object(2);
        this.write_metadata(address, TAG_PRIMITIVE_float32, 0);
        this.heap.memory_set_float32(address + WORD_SIZE, value);
        return address;
    }

    /**
     * PRIMITIVE_constant_string
     * Structure : [4 bytes metadata, 4 bytes length (in bytes), 2 bytes each character]
     * Children  : None
     *
     * @param str string to be stored (maximum length is 512 characters)
     * @returns address of the object
     */
    public allocate_PRIMITIVE_constant_string(str: string): number {
        console.assert(Math.ceil(str.length / 2) <= 0xFF, "String is too long");

        const address = this.allocate_object(2 + Math.ceil(str.length / 2));

        // Metadata
        this.write_metadata(address, TAG_PRIMITIVE_constant_string, 0);

        // Payload
        this.heap.memory_set_word(address + WORD_SIZE, str.length);

        // Characters
        for (let i = 0; i < str.length; i++) {
            this.heap.memory_set_2_bytes(address + 2 * WORD_SIZE + i * 2, str.charCodeAt(i));
        }

        return address;
    }


    /**
     * CONTROL_name
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_name(obj: { tag: string, name: string }): number {
        const address = this.allocate_object(3);
        this.heap.set_cannnot_be_freed(address, true);

        const string_address = this.allocate_PRIMITIVE_constant_string(obj.name);
        this.heap.set_cannnot_be_freed(string_address, true);

        // Metadata
        this.write_metadata(address, TAG_CONTROL_name, 1);
        this.increment_reference_count(address);

        // Payload
        this.set_children(address, 0, string_address);

        // Remove cannot-be-freed marker
        this.heap.set_cannnot_be_freed(address, false);
        this.heap.set_cannnot_be_freed(string_address, false);

        return address;
    }

    /**
     * CONTROL_literal
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Children  :
     * - 4 bytes address of the value
     *
     * @param obj control object
     * @returns address of the object
    */
    public allocate_CONTROL_literal(obj: { tag: string, type: string, value: any }): number {
        const address = this.allocate_object(3);
        this.heap.set_cannnot_be_freed(address, true);

        let value_address: number;
        switch (obj.type) {
            case "bool":
                value_address = this.allocate_PRIMITIVE_bool(obj.value);
                break;
            case "int":
                value_address = this.allocate_PRIMITIVE_int(obj.value);
                break;
            case "float32":
                value_address = this.allocate_PRIMITIVE_float32(obj.value);
                break;
            case "string":
                value_address = this.allocate_PRIMITIVE_constant_string(obj.value);
                break;
            default:
                throw new Error("Unknown type");
        }
        this.heap.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.write_metadata(address, TAG_CONTROL_literal, 1);
        this.increment_reference_count(address);

        // Payload
        this.set_children(address, 0, value_address);

        // Remove cannot-be-freed marker
        this.heap.set_cannnot_be_freed(address, false);
        this.heap.set_cannnot_be_freed(value_address, false);

        return address;
    }

    /**
     * CONTROL_var
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_var(obj: { tag: string, name: string, type: string, value: any }): number {
        const address = this.allocate_object(4);
        this.heap.set_cannnot_be_freed(address, true);

        const name_address = this.allocate_PRIMITIVE_constant_string(obj.name);
        this.heap.set_cannnot_be_freed(name_address, true);

        const value_address = this.allocate_based_on_tag(obj.value);
        this.heap.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.write_metadata(address, TAG_CONTROL_var, 2);
        this.increment_reference_count(address);

        // Payload
        this.set_children(address, 0, name_address);
        this.set_children(address, 1, value_address);

        // Remove cannot-be-freed marker
        this.heap.set_cannnot_be_freed(address, false);
        this.heap.set_cannnot_be_freed(name_address, false);
        this.heap.set_cannnot_be_freed(value_address, false);

        return address;
    }

    /**
     * CONTROL_assign
     * Structure : [4 bytes metadata, 4 bytes reference count]
     * Children  :
     * - 4 bytes address of the name (MISC_constant_string)
     * - 4 bytes address of the value
     *
     * @param obj control object
     * @returns address of the object
     */
    public allocate_CONTROL_assign(obj: { tag: string, name: string, value: any }): number {
        const address = this.allocate_object(4);
        this.heap.set_cannnot_be_freed(address, true);

        const name_address = this.allocate_PRIMITIVE_constant_string(obj.name);
        this.heap.set_cannnot_be_freed(name_address, true);

        const value_address = this.allocate_based_on_tag(obj.value);
        this.heap.set_cannnot_be_freed(value_address, true);

        // Metadata
        this.write_metadata(address, TAG_CONTROL_assign, 2);
        this.increment_reference_count(address);

        // Payload
        this.set_children(address, 0, name_address);
        this.set_children(address, 1, value_address);

        // Remove cannot-be-freed marker
        this.heap.set_cannnot_be_freed(address, false);
        this.heap.set_cannnot_be_freed(name_address, false);
        this.heap.set_cannnot_be_freed(value_address, false);

        return address;
    }


    public allocate_number(value: number): number {
        return value;
    }

    public value_of(address: number): number {
        return address;
    }

    public allocate_based_on_tag(obj: any): number {
        switch (obj.tag) {
            case TAG_PRIMITIVE_bool:
                return this.allocate_PRIMITIVE_bool(obj);
            case TAG_PRIMITIVE_int:
                return this.allocate_PRIMITIVE_int(obj);
            case TAG_PRIMITIVE_float32:
                return this.allocate_PRIMITIVE_float32(obj);
            case TAG_PRIMITIVE_constant_string:
                return this.allocate_PRIMITIVE_constant_string(obj);
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
