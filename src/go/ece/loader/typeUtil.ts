abstract class Type {
    tag: string;
    constructor() {
      this.tag = "";
    }
  
    public isNil(): boolean {
      return false;
    }
  
    public isInt32(): boolean {
      return false;
    }
  
    public isFloat32(): boolean {
      return false;
    }
  
    public isBool(): boolean {
      return false;
    }
  
    public isString(): boolean {
      return false;
    }
  
    public isFunction(): boolean {
      return false;
    }
  
    public isArray(): boolean {
      return false;
    }
  
    public isSlice(): boolean {
      return false;
    }
  
    public isChannel(): boolean {
      return false;
    }
  
    public isStruct(): boolean {
      return false;
    }

    public isBuiltin(): boolean {
      return false;
    }
  
    public isAny(): boolean {
      return false;
    }
  
    abstract toObject(): any;
  }
  
  class NilType extends Type {
    constructor() {
      super();
      this.tag = "nil";
    }
  
    public isNil(): boolean {
      return true;
    }
  
    public toObject(): any {
      return null;
    }
  }
  
  class Int32Type extends Type {
    constructor() {
      super();
      this.tag = "int32";
    }
  
    public isInt32(): boolean {
      return true;
    }
  
    public toObject(): any {
      return { tag: "int32-type" };
    }
  }
  
  class Float32Type extends Type {
    constructor() {
      super();
      this.tag = "float32";
    }
  
    public isFloat32(): boolean {
      return true;
    }
  
    public toObject(): any {
      return { tag: "float32-type" };
    }
  }
  
  class BoolType extends Type {
    constructor() {
      super();
      this.tag = "bool";
    }
  
    public isBool(): boolean {
      return true;
    }
  
    public toObject(): any {
      return { tag: "bool-type" };
    }
  }
  
  class StringType extends Type {
    constructor() {
      super();
      this.tag = "string";
    }
  
    public isString(): boolean {
      return true;
    }
  
    public toObject(): any {
      return { tag: "string-type" };
    }
  }
  
  class FunctionType extends Type {
    params: Type[];
    returnType: Type;
  
    constructor(params: Type[], returnType: Type) {
      super();
      this.tag = "function-type";
      this.params = params;
      this.returnType = returnType;
    }
  
    public isFunction(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "function-type",
        params: this.params.map((p: Type) => p.toObject()),
        returnType: this.returnType.toObject(),
      };
    }
  }

  class ArrayType extends Type {
    len: number;
    type: Type;
  
    constructor(len: number, type: Type) {
      super();
      this.tag = "array-type";
      this.len = len;
      this.type = type;
    }
  
    public isArray(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "array-type",
        len: this.len,
        type: this.type.toObject(),
      };
    }
  }
  
  class SliceType extends Type {
    type: Type;
  
    constructor(type: Type) {
      super();
      this.tag = "slice-type";
      this.type = type;
    }
  
    public isSlice(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "slice-type",
        type: this.type.toObject(),
      };
    }
  }
  
  class ChannelType extends Type {
    type: Type;
  
    constructor(type: Type) {
      super();
      this.tag = "channel-type";
      this.type = type;
    }
  
    public isChannel(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "channel-type",
        type: this.type.toObject(),
      };
    }
  }
  
  class StructType extends Type {
    constructor(tag: string) {
      super();
      this.tag = tag;
    }
  
    public isStruct(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "struct-type",
        name: this.tag,
      };
    }
  }

  class BuiltinType extends Type {
    name: string;
    constructor(name: string) {
      super();
      this.tag = "builtin";
      this.name = name;
    }
  
    public isBuiltin(): boolean {
      return true;
    }
  
    public toObject(): any {
      return {
        tag: "builtin-type",
        name: this.name,
      };
    }
  }

  class MutexType extends Type {
    constructor() {
      super();
      this.tag = "mutex";
    }
  
    public toObject(): any {
      return { tag: "mutex-type" };
    }
  }

  class WaitGroupType extends Type {
    constructor() {
      super();
      this.tag = "wait-group";
    }
  
    public toObject(): any {
      return { tag: "wait-group-type" };
    }
  }
  
  class AnyType extends Type {
    constructor() {
      super();
      this.tag = "any";
    }
  
    public isAny(): boolean {
      return true;
    }
  
    public toObject(): any {
      return { tag: "any-type" };
    }
  }
  
  function toType(comp: any): Type {
    if (comp === null || comp === undefined) {
      return new NilType();
    }
    // if comp is a string
    if (typeof comp === "string") {
      switch (comp) {
        case "int32":
          return new Int32Type();
        case "float32":
          return new Float32Type();
        case "bool":
          return new BoolType();
        case "string":
          return new StringType();
        default:
          throw new Error(`Invalid type (string) ${comp}.`);
      }
    }
    // if comp does not have a tag
    if (!("tag" in comp)) {
      throw new Error(`Invalid type ${comp}.`);
    }
    switch (comp.tag) {
      case "int32-type":
        return new Int32Type();
      case "float32-type":
        return new Float32Type();
      case "bool-type":
        return new BoolType();
      case "string-type":
        return new StringType();
      case "function-type":
        return new FunctionType(
          comp.params.map((p: any) => toType(p)),
          toType(comp.returnType)
        );
      case "array-type":
        return new ArrayType(comp.len, toType(comp.type));
      case "slice-type":
        return new SliceType(toType(comp.type));
      case "channel-type":
        return new ChannelType(toType(comp.type));
      case "struct-decl-type":
        return new StructType(comp.name);
      case "mutex-type":
        return new MutexType();
      case "wait-group-type":
        return new WaitGroupType();
      default:
        throw new Error(`Invalid type tag ${comp.tag}.`);
    }
  }
  
  function isEqual(a: any, b: any): boolean {
    if (a === null || a === undefined) {
      return b === null || b === undefined;
    }
    if (b === null || b === undefined) {
      return false;
    }
    // if a and b are not objects
    if (typeof a !== "object" || typeof b !== "object") {
      return a === b;
    }
    // Check if all keys in a are in b
    for (let key in a) {
      if (b.hasOwnProperty(key) === false) {
        return false;
      }
      if (!isEqual(a[key], b[key])) {
        return false;
      }
      break;
    }
    // Check if all keys in b are in a
    for (let key in b) {
      if (a.hasOwnProperty(key) === false) {
        return false;
      }
    }
    return true;
  }

  export {
    Type,
    NilType,
    Int32Type,
    Float32Type,
    BoolType,
    StringType,
    FunctionType,
    ArrayType,
    SliceType,
    ChannelType,
    StructType,
    BuiltinType,
    AnyType,
    toType,
    isEqual,
  }