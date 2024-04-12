/**
 * COMPLEX_method
 * Fields    :
 * - number of children
 * - number of parameters
 * Children  :
 * - 4 bytes address of the method body (any)
 * - 4 bytes address of the self name (COMPLEX_string)
 * - 4 bytes address of environment of captures (ENVIRONMENT_frame)
 * - 4 bytes * num_parameters address of the parameter names (COMPLEX_string)
 */

import { Heap } from "../../heap";
import { auto_cast } from "../auto_cast";
import { ComplexString } from "../complex/string";
import { ControlMethod } from "../control/method";
import { EnvironmentFrame } from "../environment/frame";
import { HeapObject } from "../objects";
import { PrimitiveNil } from "../primitive/nil";
import { TAG_COMPLEX_method } from "../tags";

class ComplexMethod extends HeapObject {
    public get_body_address(): HeapObject {
        if (this.get_tag() !== TAG_COMPLEX_method) {
            throw new Error("ComplexMethod.get_body_address: Invalid tag");
        }
        return auto_cast(this.heap, this.get_child(0));
    }

    public get_self_name_address(): ComplexString {
        if (this.get_tag() !== TAG_COMPLEX_method) {
            throw new Error("ComplexMethod.get_self_name_address: Invalid tag");
        }
        return new ComplexString(this.heap, this.get_child(1));
    }

    public get_environment_address(): EnvironmentFrame {
        if (this.get_tag() !== TAG_COMPLEX_method) {
            throw new Error("ComplexMethod.get_environment_address: Invalid tag");
        }
        return new EnvironmentFrame(this.heap, this.get_child(2));
    }

    public get_param_name_address(index: number): ComplexString {
        if (this.get_tag() !== TAG_COMPLEX_method) {
            throw new Error("ComplexMethod.get_param_name_address: Invalid tag");
        }
        if (index < 0 || index >= this.get_number_of_params()) {
            throw new Error("ComplexMethod.get_param_name_address: Index out of range");
        }
        return new ComplexString(this.heap, this.get_child(3 + index));
    }

    public get_number_of_params(): number {
        if (this.get_tag() !== TAG_COMPLEX_method) {
            throw new Error("ComplexMethod.get_number_of_params: Invalid tag");
        }
        return this.get_field(1);
    }

    public static allocate(
        heap: Heap,
        control_method_address: number,
        current_environment_frame_address: number
    ): number {
        const control_method = new ControlMethod(
            heap,
            control_method_address
        );
        const current_environment_frame = new EnvironmentFrame(
            heap,
            current_environment_frame_address
        );

        const address = heap.allocate_object(
            TAG_COMPLEX_method,
            2,
            3 + control_method.get_number_of_params()
        );

        heap.set_field(address, 1, control_method.get_number_of_params());

        // Transfer the body
        heap.set_child(address, 0, control_method.get_body_address().reference().address);

        // Transfer the self name
        heap.set_child(address, 1, control_method.get_self_name_address().reference().address);

        // Transfer the parameter names
        for (let i = 0; i < control_method.get_number_of_params(); i++) {
            heap.set_child(address, 3 + i, control_method.get_param_name_address(i).reference().address);
        }

        // Create a new environment for the captures
        const environment_address = EnvironmentFrame.allocate(
            heap,
            PrimitiveNil.allocate()
        );
        heap.set_child(address, 2, environment_address);
        const environment = new EnvironmentFrame(heap, environment_address);

        // Transfer the captures
        for (let i = 0; i < control_method.get_number_of_captures(); i++) {
            const capture_name = control_method.get_capture_name_address(i);
            const capture_entry = current_environment_frame.lookup_entry(
                capture_name.address
            );
            if (capture_entry.is_nil()) {
                throw new Error("Capture does not exist in current scope.");
            }
            environment.insert_entry(capture_entry);
        }

        return address;
    }

    public stringify_i(): string {
        let result = "";
        result += this.address.toString() + " (method): ";
        result += "function(";
        result += this.get_self_name_address().stringify();
        for (let i = 0; i < this.get_number_of_params(); i++) {
          result += ", ";
          result += this.get_param_name_address(i).stringify();
        }
        result += ")";
        result += " [";
        result += this.get_environment_address().stringify();
        result += "]";
        return result;
    }

    public to_object(): any {
        let result = "(";
        result += this.get_self_name_address().to_object();
        result += ") func (";
        for (let i = 0; i < this.get_number_of_params(); i++) {
            result += this.get_param_name_address(i).get_string();
            if (i < this.get_number_of_params() - 1) {
                result += ", ";
            }
        }
        result += ") ";
        result += this.get_body_address().to_object();
        return result;
    }
}

export { ComplexMethod };
