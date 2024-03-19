import { Heap } from "../heap";
import { EnvironmentFrame } from "../heap/types/environment/frame";

/**
 * A mutuable wrapper for the environment address.
 */
class Env {
    private heap: Heap;

    private env: EnvironmentFrame;
    
    /**
     * Create a new empty environment.
     *
     * @param heap The heap to allocate the environment in.
     */
    constructor(heap: Heap) {
        this.heap = heap;
        const env_address = this.heap.allocate_any({ tag: "frame", parent_frame_address: 0 });
        this.env = new EnvironmentFrame(this.heap, env_address);
    }

    /**
     * Get the environment frame object.
     *
     * @returns The environment frame object.
     */
    public get_frame(): EnvironmentFrame {
        return this.env;
    }

    /**
     * Set the environment frame object.
     *
     * @param env The environment frame object.
     */

    public set_frame(env: EnvironmentFrame): void {
        const new_env = env.reference() as EnvironmentFrame;
        this.env.free();
        this.env = new_env;
    }
}

function create_global_environment(heap: Heap, imports: Array<string>): Env {
    return new Env(heap);
}

export { Env, create_global_environment };
