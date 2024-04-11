import { HeapObject } from "../objects";

abstract class ControlCase extends HeapObject {
  public abstract is_default(): boolean;
  public abstract is_send(): boolean;
  public abstract is_receive(): boolean;
  public abstract get_body_address(): HeapObject;
}

export { ControlCase };
