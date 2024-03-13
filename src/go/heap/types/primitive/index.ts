import { HeapObject } from "../objects";

abstract class Primitive extends HeapObject {
    public abstract get_type(): string;
    public abstract get_value(): any;
}

export { Primitive };
