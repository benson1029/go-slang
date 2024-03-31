abstract class Type {
  tag: string;
  constructor() {
    this.tag = "";
  }

  isNil(): boolean {
    return false;
  }

  isInt32(): boolean {
    return false;
  }

  isFloat32(): boolean {
    return false;
  }

  isBool(): boolean {
    return false;
  }

  isString(): boolean {
    return false;
  }

  isFunction(): boolean {
    return false;
  }

  isArray(): boolean {
    return false;
  }

  isSlice(): boolean {
    return false;
  }

  isChannel(): boolean {
    return false;
  }

  isStruct(): boolean {
    return false;
  }

  toObject(): any {

  }
}

class NilType extends Type {
  constructor() {
    super();
    this.tag = "nil";
  }

  isNil(): boolean {
    return true;
  }

  toObject(): any {
    return null;
  }
}

class Int32Type extends Type {
  constructor() {
    super();
    this.tag = "int32";
  }

  isInt32(): boolean {
    return true;
  }

  toObject(): any {
    return { tag: "int32-type" };
  }
}

class Float32Type extends Type {
  constructor() {
    super();
    this.tag = "float32";
  }

  isFloat32(): boolean {
    return true;
  }

  toObject(): any {
    return { tag: "float32-type" };
  }
}

class BoolType extends Type {
  constructor() {
    super();
    this.tag = "bool";
  }

  isBool(): boolean {
    return true;
  }

  toObject(): any {
    return { tag: "bool-type" };
  }
}

class StringType extends Type {
  constructor() {
    super();
    this.tag = "string";
  }

  isString(): boolean {
    return true;
  }

  toObject(): any {
    return { tag: "string-type" };
  }
}

class FunctionType extends Type {
  params: Type[];
  returnType: null | Type;

  constructor(params: Type[], returnType: Type) {
    super();
    this.tag = "function-type";
    this.params = params;
    this.returnType = returnType;
  }

  isFunction(): boolean {
    return true;
  }

  toObject(): any {
    return {
      tag: "function-type",
      params: this.params.map((p) => p.toObject()),
      returnType: this.returnType.toObject(),
    };
  }
}

class ArrayType extends Type {
  len: number;
  type: Type;

  constructor(type: Type) {
    super();
    this.tag = "array-type";
    this.type = type;
  }

  isArray(): boolean {
    return true;
  }

  toObject(): any {
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

  isSlice(): boolean {
    return true;
  }

  toObject(): any {
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

  isChannel(): boolean {
    return true;
  }

  toObject(): any {
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

  isStruct(): boolean {
    return true;
  }

  toObject(): any {
    return {
      tag: "struct-type",
      name: this.tag,
    };
  }
}

class AddressType extends Type {
  type: Type;

  constructor(type: Type) {
    super();
    this.tag = "address-type";
    this.type = type;
  }

  toObject(): any {
    return {
      tag: "address-type",
      type: this.type.toObject(),
    };
  }
}

function toType(comp: any): Type {
  return new Int32Type();
  // switch (type) {
  //   case "int32":
  //     return new PrimitiveType("int32");
  //   case "float32":
  //     return new PrimitiveType("float32");
  //   case "bool":
  //     return new PrimitiveType("bool");
  //   case "string":
  //     return new PrimitiveType("string");
  //   case
  //   default:
  //     throw new Error(`Invalid type ${type}`);
  // }
}

class VariableObject {
  name: string;
  type: Type;
  level: number;

  constructor(name: string, type: Type, level: number) {
    this.name = name;
    this.type = type;
    this.level = level;
  }
}

class FunctionObject {
  comp: any;
  type: FunctionType;
  level: number;

  constructor(comp: any, type: FunctionType, level: number) {
    this.comp = comp;
    this.type = type;
    this.level = level;
  }
}

class DeclarationObject {
  captures: any[];

  constructor(captures: any[]) {
    this.captures = captures;
  }
}

class StructObject {
  name: string;
  fields: Map<string, Type>;
  methods: Map<string, FunctionType>;

  constructor(name: string, fields: Array<{ name: string; type: Type }>) {
    this.name = name;
    this.fields = new Map();
    this.methods = new Map();
    for (let field of fields) {
      this.fields.set(field.name, field.type);
    }
  }

  addMethod(name: string, type: FunctionType) {
    if (this.methods.has(name)) {
      throw new Error(`Method ${name} already declared in struct.`);
    }
    this.methods.set(name, type);
  }

  getMethod(name: string): FunctionType {
    let method = this.methods.get(name);
    if (method === undefined) {
      throw new Error(`Method ${name} not declared in struct.`);
    }
    return method;
  }

  getField(name: string): Type {
    let field = this.fields.get(name);
    if (field === undefined) {
      throw new Error(`Field ${name} not declared in struct.`);
    }
    return field;
  }
}

class Scope {
  frames: Array<Map<string, VariableObject | StructObject>>;
  variables: Map<string, Array<VariableObject | StructObject>>;
  function_declaration_stack: Array<FunctionObject>;
  current_declaration: DeclarationObject | null;

  constructor() {
    this.frames = [new Map()];
    this.variables = new Map();
    this.function_declaration_stack = [];
    this.current_declaration = null;
  }

  level(): number {
    return this.frames.length - 1;
  }

  newFrame(): void {
    this.frames.push(new Map());
  }

  popFrame(): void {
    let frame = this.frames.pop();
    frame.forEach((value, key) => {
      let types = this.variables.get(key);
      types.pop();
      if (types.length === 0) {
        this.variables.delete(key);
      }
    });
  }

  addVariable(name: string, type: Type): void {
    let frame = this.frames[this.frames.length - 1];
    if (frame.has(name)) {
      throw new Error(
        `VariableObject ${name} already declared in current scope.`
      );
    }
    frame.set(name, new VariableObject(name, type, this.frames.length - 1));
    if (!this.variables.has(name)) {
      this.variables.set(name, []);
    }
    this.variables
      .get(name)
      .push(new VariableObject(name, type, this.frames.length - 1));
  }

  addStruct(name: string, fields: Array<{ name: string; type: Type }>): void {
    let frame = this.frames[this.frames.length - 1];
    if (frame.has(name)) {
      throw new Error(
        `StructObject ${name} already declared in current scope.`
      );
    }
    frame.set(name, new StructObject(name, fields));
    if (!this.variables.has(name)) {
      this.variables.set(name, []);
    }
    this.variables.get(name).push(new StructObject(name, fields));
  }

  getType(name: string): VariableObject | StructObject {
    let types = this.variables.get(name);
    if (types === undefined) {
      throw new Error(`VariableObject ${name} not declared.`);
    }
    return types[types.length - 1];
  }
}

const microcode_preprocess = {
  name: (
    comp: {
      tag: string;
      name: string;
    },
    scope: Scope
  ) => {
    const t = scope.getType(comp.name);
    if (t === undefined) {
      throw new Error(`VariableObject ${comp.name} not declared.`);
    }
    if (!(t instanceof VariableObject)) {
      throw new Error(`VariableObject ${comp.name} is not a variable.`);
    }
    if (scope.current_declaration != null) {
      scope.current_declaration.captures.push({ name: t.name, type: t.type });
    }
    for (let i = scope.function_declaration_stack.length - 1; i >= 0; i--) {
      let f = scope.function_declaration_stack[i];
      if (f.level > t.level) {
        // f needs to capture t
        f.comp.captures.push({ name: t.name, type: t.type });
      } else {
        break;
      }
    }
    return t.type;
  },

  index: (
    comp: {
      tag: string;
      array: any;
      index: any;
    },
    scope: Scope
  ) => {
    const idx_t = preprocess(comp.index, scope);
    const arr_t = preprocess(comp.array, scope);
    if (!arr_t.isArray()) {
      throw new Error("Indexing non-array type.");
    }
    if (!idx_t.isInt32()) {
      throw new Error("Indexing with non-int32 type.");
    }
    return (arr_t as ArrayType).type;
  },

  slice: (
    comp: {
      tag: string;
      array: any;
      left: any;
      right: any;
    },
    scope: Scope
  ) => {
    const left_t = preprocess(comp.left, scope);
    const right_t = preprocess(comp.right, scope);
    const arr_t = preprocess(comp.array, scope);
    if (!arr_t.isArray()) {
      throw new Error("Slicing non-array type.");
    }
    if (!left_t.isInt32()) {
      throw new Error("Slicing with non-int32 type.");
    }
    if (!right_t.isInt32()) {
      throw new Error("Slicing with non-int32 type.");
    }
    return new SliceType((arr_t as ArrayType).type);
  },

  member: (
    comp: {
      tag: string;
      object: any;
      member: string;
    },
    scope: Scope
  ) => {
    const t = preprocess(comp.object, scope);
    if (!t.isStruct()) {
      throw new Error("Member access on non-user-defined type.");
    }
    const obj_t = scope.getType(t.tag) as StructObject;
    return obj_t.getField(comp.member);
  },

  "name-address": (
    comp: {
      tag: string;
      name: string;
    },
    scope: Scope
  ) => {
    const t = preprocess({ tag: "name", name: comp.name }, scope);
    return new AddressType(t);
  },

  "index-address": (
    comp: {
      tag: string;
      array: any;
      index: any;
    },
    scope: Scope
  ) => {
    const t = preprocess({ tag: "index", array: comp.array, index: comp.index }, scope);
    return new AddressType(t);
  },

  "slice-address": (
    comp: {
      tag: string;
      array: any;
      left: any;
      right: any;
    },
    scope: Scope
  ) => {
    const t = preprocess(
      { tag: "slice", array: comp.array, left: comp.left, right: comp.right },
      scope
    );
    return new AddressType(t);
  },

  "member-address": (
    comp: {
      tag: string;
      object: any;
      member: string;
    },
    scope: Scope
  ) => {
    const t = preprocess(
      { tag: "member", object: comp.object, member: comp.member },
      scope
    );
    return new AddressType(t);
  },

  literal: (
    comp: {
      tag: string;
      type: string;
      value: any;
    },
    scope: Scope
  ) => {
    return toType(comp.type);
  },

  var: (
    comp: {
      tag: string;
      name: string;
      type: any;
      value: any;
    },
    scope: Scope
  ) => {
    if (comp.value == null) {
      if (comp.type == null) {
        throw new Error(`VariableObject ${comp.name} must have a type.`);
      }
    } else {
      const v = preprocess(comp.value, scope);
      if (comp.type == null) {
        comp.type = v.toObject();
      }
      if (comp.value.toObject() !== comp.type) {
        throw new Error("VariableObject type mismatch.");
      }
    }
    scope.addVariable(comp.name, toType(comp.type));
    return new NilType();
  },

  assign: (
    comp: {
      tag: string;
      name: any;
      value: any;
      return_captures: any | null;
    },
    scope: Scope
  ) => {
    scope.current_declaration = new DeclarationObject([]);
    const v = preprocess(comp.value, scope);
    if (comp.return_captures != null) {
      comp.return_captures.captures = scope.current_declaration.captures;
    }
    scope.current_declaration = null;
    const n = preprocess(comp.name, scope);
    if (n.toObject() !== v.toObject()) {
      throw new Error("Assignment type mismatch.");
    }
    return v;
  },

  unary: (
    comp: {
      tag: string;
      operator: string;
      operand: any;
    },
    scope: Scope
  ) => {
    const o = preprocess(comp.operand, scope);
    switch (comp.operator) {
      case "+":
      case "-":
        if (!o.isInt32() && !o.isFloat32()) {
          throw new Error("Unary operator on non-numeric type.");
        }
        return o;
      case "!":
        if (!o.isBool()) {
          throw new Error("Unary operator ! on non-bool type.");
        }
        return o;
      default:
        throw new Error(`Invalid unary operator ${comp.operator}.`);
    }
  },

  postfix: (
    comp: {
      tag: string;
      operator: string;
      operand: any;
    },
    scope: Scope
  ) => {
    const o = preprocess(comp.operand, scope);
    switch (comp.operator) {
      case "++":
      case "--":
        if (!o.isInt32() && !o.isFloat32()) {
          throw new Error("Postfix operator on non-numeric type.");
        }
        return o;
      default:
        throw new Error(`Invalid postfix operator ${comp.operator}.`);
    }
  },

  binary: (
    comp: {
      tag: string;
      operator: string;
      leftOperand: any;
      rightOperand: any;
    },
    scope: Scope
  ) => {
    const left = preprocess(comp.leftOperand, scope);
    const right = preprocess(comp.rightOperand, scope);
    switch (comp.operator) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        if (!left.isInt32() && !left.isFloat32()) {
          throw new Error("Binary operator on non-numeric type.");
        }
        if (!right.isInt32() && !right.isFloat32()) {
          throw new Error("Binary operator on non-numeric type.");
        }
        if (left.isFloat32() || right.isFloat32()) {
          return new Float32Type();
        }
        return new Int32Type();
      case "==":
      case "!=":
      case "<":
      case "<=":
      case ">":
      case ">=":
        if (!left.isInt32() && !left.isFloat32()) {
          throw new Error("Binary operator on non-numeric type.");
        }
        if (!right.isInt32() && !right.isFloat32()) {
          throw new Error("Binary operator on non-numeric type.");
        }
        return new BoolType();
      case "&&":
      case "||":
        if (!left.isBool()) {
          throw new Error("Binary operator on non-bool type.");
        }
        if (!right.isBool()) {
          throw new Error("Binary operator on non-bool type.");
        }
        return new BoolType();
      default:
        throw new Error(`Invalid binary operator ${comp.operator}.`);
    }
  },

  sequence: (
    comp: {
      tag: string;
      body: any[];
    },
    scope: Scope
  ) => {
    let t = new NilType();
    for (let exp of comp.body) {
      t = preprocess(exp, scope);
    }
    return t;
  },

  block: (
    comp: {
      tag: string;
      body: any[];
    },
    scope: Scope
  ) => {
    scope.newFrame();
    preprocess(comp.body, scope);
    scope.popFrame();
    return new NilType();
  },

  if: (
    comp: {
      tag: string;
      condition: any;
      then_body: any;
      else_body: any;
    },
    scope: Scope
  ) => {
    const c = preprocess(comp.condition, scope);
    preprocess(comp.then_body, scope);
    preprocess(comp.else_body, scope);
    if (!c.isBool()) {
      throw new Error("If condition must be a bool type.");
    }
    return new NilType();
  },

  for: (
    comp: {
      tag: string;
      init: any | null;
      condition: any;
      update: any | null;
      body: any;
    },
    scope: Scope
  ) => {
    scope.newFrame();
    preprocess(comp.init, scope);
    const c = preprocess(comp.condition, scope);
    preprocess(comp.update, scope);
    preprocess(comp.body, scope);
    scope.popFrame();
    if (!c.isBool()) {
      throw new Error("For condition must be a bool type.");
    }
    return new NilType();
  },

  break: (
    comp: {
      tag: string;
    },
    scope: Scope
  ) => {
    // nothing to do
    return new NilType();
  },

  continue: (
    comp: {
      tag: string;
    },
    scope: Scope
  ) => {
    // nothing to do
    return new NilType();
  },

  return: (
    comp: {
      tag: string;
      value: any;
    },
    scope: Scope
  ) => {
    const v = preprocess(comp.value, scope);
    if (scope.function_declaration_stack.length === 0) {
      throw new Error("Return statement outside of function.");
    }
    const f = scope.function_declaration_stack[scope.function_declaration_stack.length - 1];
    if (f.type.returnType !== v.toObject()) {
      throw new Error("Return type mismatch.");
    }
    return new NilType();
  },

  function: (
    comp: {
      tag: string;
      name: string;
      params: any[];
      captures: any[];
      returnType: string | null;
      body: any;
    },
    scope: Scope
  ) => {
    // Initialize captures
    comp.captures = [];

    scope.newFrame();
    scope.function_declaration_stack.push(
      new FunctionObject(comp, toType(comp) as FunctionType, scope.level())
    );
    for (let param of comp.params) {
      scope.addVariable(param.name, param.type);
    }
    scope.newFrame();
    preprocess(comp.body, scope);
    scope.popFrame();
    scope.function_declaration_stack.pop();
    scope.popFrame();

    // Postprocess captures
    // Remove duplicates
    let captures = new Map();
    for (let c of comp.captures) {
      captures.set(c.name, c);
    }
    comp.captures = Array.from(captures.values());

    return new FunctionType(
      comp.params.map((p) => toType(p.type)),
      toType(comp.returnType)
    );
  },

  "call-stmt": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.body, scope);
  },

  "go-call-stmt": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.body, scope);
  },

  call: (
    comp: {
      tag: string;
      func: any;
      args: any[];
    },
    scope: Scope
  ) => {
    preprocess(comp.func, scope);
    for (let arg of comp.args) {
      preprocess(arg, scope);
    }
  },

  make: (
    comp: {
      tag: string;
      type: any;
      args: any[];
    },
    scope: Scope
  ) => {
    for (let arg of comp.args) {
      preprocess(arg, scope);
    }
  },

  "channel-send": (
    comp: {
      tag: string;
      name: any;
      expression: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.name, scope);
    preprocess(comp.expression, scope);
  },

  "channel-receive": (
    comp: {
      tag: string;
      name: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.name, scope);
  },

  select: (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope
  ) => {
    for (let exp of comp.body) {
      preprocess(exp, scope);
    }
  },

  "select-case": (
    comp: {
      tag: string;
      case: any;
      body: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.case, scope);
    preprocess(comp.body, scope);
  },

  "select-default": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.body, scope);
  },

  program: (
    comp: {
      tag: string;
      package: string;
      imports: string[];
      body: any[];
    },
    scope: Scope
  ) => {
    for (let exp of comp.body) {
      if (exp.tag === "var") {
        preprocess({ tag: "var", name: exp.name, type: toType(exp.type) }, scope);
      } else if (exp.tag === "function") {
        preprocess({ tag: "var", name: exp.name, type: toType(exp) }, scope);
      } else if (exp.tag === "struct") {
        // nothing to do
      } else if (exp.tag === "struct-method") {
        throw new Error("Not implemented.");
      } else {
        throw new Error(`Invalid tag ${exp.tag} in global namespace.`);
      }
    }
    for (let exp of comp.body) {
      if (exp.tag === "var") {
        preprocess(
          {
            tag: "assign",
            name: {
              tag: "name-address",
              name: exp.name,
            },
            value: exp.value,
            return_captures: exp,
          },
          scope
        );
      } else if (exp.tag === "function") {
        preprocess(
          {
            tag: "assign",
            name: {
              tag: "name-address",
              name: exp.name,
            },
            value: exp,
          },
          scope
        );
      }
    }
  },
};

function preprocess(comp: any, scope: Scope): Type {
  if (comp === null || comp === undefined) {
    return new NilType();
  }
  if (comp.tag in microcode_preprocess) {
    return microcode_preprocess[comp.tag](comp, scope);
  }
  throw new Error(`Invalid tag ${comp.tag}`);
}

function preprocess_program(
  program: any,
  imports: any[],
  default_imports: any[]
) {
  let scope = new Scope();
  for (let imp of imports) {
    scope.addVariable(imp.name, undefined);
  }
  for (let imp of default_imports) {
    scope.addVariable(imp.name, undefined);
  }
  preprocess(program, scope);
}

export { preprocess_program };
