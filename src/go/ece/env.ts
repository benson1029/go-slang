import { Heap } from "../heap";

class Env {
    // TODO: Implement this.
}

function create_global_environment(heap: Heap, imports: Array<string>): Env {
    return new Env();
}

export { Env, create_global_environment };
