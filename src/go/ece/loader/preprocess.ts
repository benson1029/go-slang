import { get_builtin_type } from "../microcode/builtin";
import {
  ArrayType,
  BoolType,
  BuiltinType,
  ChannelType,
  Float32Type,
  FunctionType,
  Int32Type,
  NilType,
  SliceType,
  StructType,
  Type,
  isEqual,
  toType
} from "./typeUtil";

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

const microcode_preprocess: {
  [key: string]: (comp: any, scope: Scope, type_check: boolean) => Type;
} = {
  name: (
    comp: {
      tag: string;
      name: string;
    },
    scope: Scope,
    type_check: boolean
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
    if (!type_check) {
      return new NilType();
    }
    return t.type;
  },

  index: (
    comp: {
      tag: string;
      array: any;
      index: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const idx_t = preprocess(comp.index, scope, type_check);
    const arr_t = preprocess(comp.array, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
    if (!idx_t.isInt32()) {
      throw new Error("Indexing with non-int32 type.");
    }
    if (arr_t.isArray()) {
      return (arr_t as ArrayType).type;
    } else {
      throw new Error("Indexing non-array type.");
    }
  },

  slice: (
    comp: {
      tag: string;
      array: any;
      left: any;
      right: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const left_t = preprocess(comp.left, scope, type_check);
    const right_t = preprocess(comp.right, scope, type_check);
    const arr_t = preprocess(comp.array, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    const t = preprocess(comp.object, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess({ tag: "name", name: comp.name }, scope, type_check);
  },

  "index-address": (
    comp: {
      tag: string;
      array: any;
      index: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(
      { tag: "index", array: comp.array, index: comp.index },
      scope,
      type_check
    );
  },

  "slice-address": (
    comp: {
      tag: string;
      array: any;
      left: any;
      right: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(
      { tag: "slice", array: comp.array, left: comp.left, right: comp.right },
      scope,
      type_check
    );
  },

  "member-address": (
    comp: {
      tag: string;
      object: any;
      member: string;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(
      { tag: "member", object: comp.object, member: comp.member },
      scope,
      type_check
    );
  },

  literal: (
    comp: {
      tag: string;
      type: string;
      value: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    if (!type_check) {
      return new NilType();
    }
    return toType(comp.type);
  },

  var: (
    comp: {
      tag: string;
      name: string;
      type: any;
      value: any;
    },
    scope: Scope,
    type_check
  ) => {
    if (comp.value == null) {
      if (comp.type == null) {
        if (type_check) {
          throw new Error(`VariableObject ${comp.name} must have a type.`);
        }
      }
    } else {
      const v = preprocess(comp.value, scope, type_check);
      if (type_check) {
        if (comp.type == null) {
          comp.type = v.toObject();
        }
        if (!isEqual(v.toObject(), comp.type)) {
          throw new Error("VariableObject type mismatch.");
        }
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
    scope: Scope,
    type_check: boolean
  ) => {
    scope.current_declaration = new DeclarationObject([]);
    const v = preprocess(comp.value, scope, type_check);
    if (comp.return_captures != null) {
      comp.return_captures.captures = scope.current_declaration.captures;
    }
    scope.current_declaration = null;
    const n = preprocess(comp.name, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
    if (!isEqual(n.toObject(), v.toObject())) {
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
    scope: Scope,
    type_check: boolean
  ) => {
    const o = preprocess(comp.operand, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    const o = preprocess(comp.operand, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    const left = preprocess(comp.leftOperand, scope, type_check);
    const right = preprocess(comp.rightOperand, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    let t = new NilType();
    for (let exp of comp.body) {
      t = preprocess(exp, scope, type_check);
    }
    if (!type_check) {
      return new NilType();
    }
    return t;
  },

  block: (
    comp: {
      tag: string;
      body: any[];
    },
    scope: Scope,
    type_check: boolean
  ) => {
    scope.newFrame();
    preprocess(comp.body, scope, type_check);
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
    scope: Scope,
    type_check: boolean
  ) => {
    const c = preprocess(comp.condition, scope, type_check);
    preprocess(comp.then_body, scope, type_check);
    preprocess(comp.else_body, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
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
    scope: Scope,
    type_check: boolean
  ) => {
    scope.newFrame();
    preprocess(comp.init, scope, type_check);
    const c = preprocess(comp.condition, scope, type_check);
    preprocess(comp.update, scope, type_check);
    preprocess(comp.body, scope, type_check);
    scope.popFrame();
    if (!type_check) {
      return new NilType();
    }
    if (!c.isBool()) {
      throw new Error("For condition must be a bool type.");
    }
    return new NilType();
  },

  break: (
    comp: {
      tag: string;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    // nothing to do
    return new NilType();
  },

  continue: (
    comp: {
      tag: string;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    // nothing to do
    return new NilType();
  },

  return: (
    comp: {
      tag: string;
      value: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const v = preprocess(comp.value, scope, type_check);
    if (scope.function_declaration_stack.length === 0) {
      throw new Error("Return statement outside of function.");
    }
    const f =
      scope.function_declaration_stack[
        scope.function_declaration_stack.length - 1
      ];
    if (!type_check) {
      return new NilType();
    }
    if (!isEqual(f.type.returnType.toObject(), v.toObject())) {
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
    scope: Scope,
    type_check: boolean
  ) => {
    const func_type = new FunctionType(
      comp.params.map((p: { name: string; type: any }) => toType(p.type)),
      toType(comp.returnType)
    );

    // Initialize captures
    comp.captures = [];

    scope.newFrame();
    scope.function_declaration_stack.push(
      new FunctionObject(comp, func_type, scope.level())
    );
    for (let param of comp.params) {
      scope.addVariable(param.name, toType(param.type));
    }
    scope.newFrame();
    preprocess(comp.body, scope, type_check);
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

    if (!type_check) {
      return new NilType();
    }

    return func_type;
  },

  "call-stmt": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(comp.body, scope, type_check);
  },

  "go-call-stmt": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(comp.body, scope, type_check);
  },

  call: (
    comp: {
      tag: string;
      func: any;
      args: any[];
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const f = preprocess(comp.func, scope, type_check);
    if (f.isBuiltin()) {
      const args = comp.args.map((arg) => preprocess(arg, scope, type_check));
      if (!type_check) {
        return new NilType();
      }
      return get_builtin_type((f as BuiltinType).name, args);
    }
    for (let i = 0; i < comp.args.length; i++) {
      const actual_t = preprocess(comp.args[i], scope, type_check);
      if (!type_check) {
        continue;
      }
      if (!(f instanceof FunctionType)) {
        throw new Error("Call on non-function type.");
      }
      const expected_t = f.params[i];
      if (!isEqual(actual_t.toObject(), expected_t.toObject())) {
        throw new Error("Call argument type mismatch.");
      }
    }
    if (!type_check) {
      return new NilType();
    }
    if (!(f instanceof FunctionType)) {
      throw new Error("Call on non-function type.");
    }
    return f.returnType;
  },

  constructor: (
    comp: {
      tag: string;
      type: string;
      args: any[];
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const t = toType(comp.type);
    for (let arg of comp.args) {
      const actual_t = preprocess(arg, scope, type_check);
      if (!type_check) {
        continue;
      }
      if (!t.isArray()) {
        throw new Error("Constructor on non-array type.");
      }
      const expected_t = (t as ArrayType).type;
      if (!isEqual(actual_t.toObject(), expected_t.toObject())) {
        throw new Error("Constructor argument type mismatch.");
      }
    }
    if (!type_check) {
      return new NilType();
    }
    return t;
  },

  make: (
    comp: {
      tag: string;
      type: any;
      args: any[];
    },
    scope: Scope,
    type_check: boolean
  ) => {
    for (let arg of comp.args) {
      preprocess(arg, scope, type_check);
    }
    if (!type_check) {
      return new NilType();
    }
    return toType(comp.type);
  },

  "chan-send": (
    comp: {
      tag: string;
      name: any;
      value: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const t = preprocess(comp.name, scope, type_check);
    const v = preprocess(comp.value, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
    if (!t.isChannel()) {
      throw new Error("Channel send on non-channel type.");
    }
    if (!isEqual((t as ChannelType).type.toObject(), v.toObject())) {
      throw new Error("Channel send type mismatch.");
    }
    return new NilType();
  },

  "chan-receive": (
    comp: {
      tag: string;
      name: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    const t = preprocess(comp.name, scope, type_check);
    if (!type_check) {
      return new NilType();
    }
    if (!t.isChannel()) {
      throw new Error("Channel receive on non-channel type.");
    }
    return (t as ChannelType).type;
  },

  "chan-receive-stmt": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    return preprocess(comp.body, scope, type_check);
  },
  
  select: (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    for (let exp of comp.body) {
      preprocess(exp, scope, type_check);
    }
    return new NilType();
  },

  "select-case": (
    comp: {
      tag: string;
      case: any;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    preprocess(comp.case, scope, type_check);
    preprocess(comp.body, scope, type_check);
    return new NilType();
  },

  "select-default": (
    comp: {
      tag: string;
      body: any;
    },
    scope: Scope,
    type_check: boolean
  ) => {
    preprocess(comp.body, scope, type_check);
    return new NilType();
  },

  program: (
    comp: {
      tag: string;
      package: string;
      imports: string[];
      body: any[];
    },
    scope: Scope,
    type_check: boolean
  ) => {
    if (!type_check) {
      for (let exp of comp.body) {
        if (exp.tag === "var") {
          preprocess({ tag: "var", name: exp.name }, scope, type_check);
        } else if (exp.tag === "function") {
          preprocess(
            {
              tag: "var",
              name: exp.name,
            },
            scope,
            type_check
          );
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
            scope,
            type_check
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
            scope,
            type_check
          );
        }
      }
    } else {
      for (let exp of comp.body) {
        if (exp.tag === "var") {
          // nothing to do
        } else if (exp.tag === "function") {
          preprocess(
            {
              tag: "var",
              name: exp.name,
              type: {
                tag: "function-type",
                params: exp.params.map(
                  (p: { name: string; type: any }) => p.type
                ),
                returnType: exp.returnType,
              },
            },
            scope,
            type_check
          );
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
          preprocess(exp, scope, type_check);
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
            scope,
            type_check
          );
        }
      }
    }
    return new NilType();
  },
};

function preprocess(comp: any, scope: Scope, type_check: boolean): Type {
  if (comp === null || comp === undefined) {
    return new NilType();
  }
  if (comp.tag in microcode_preprocess) {
    return microcode_preprocess[comp.tag](comp, scope, type_check);
  }
  throw new Error(`Invalid tag ${comp.tag}`);
}

function preprocess_program(
  program: any,
  imports: any[],
  default_imports: any[],
  type_check: boolean = false
) {
  let scope = new Scope();
  for (let imp of imports) {
    scope.addStruct("IMPORT." + imp.name, imp.value.map((f: any) => {
      return { name: f.name, type: new BuiltinType(f.value) };
    }))
    scope.addVariable(imp.name, new StructType("IMPORT." + imp.name));
  }
  for (let imp of default_imports) {
    scope.addVariable(imp.name, new BuiltinType(imp.value));
  }
  preprocess(program, scope, type_check);
}

export { preprocess_program };
