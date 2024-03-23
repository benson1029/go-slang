class VariableObject {
  name: string;
  type: string;
  level: number;

  constructor(name: string, type: string, level: number) {
    this.name = name;
    this.type = type;
    this.level = level;
  }
}

class FunctionObject {
  comp: any;
  level: number;

  constructor(comp: any, level: number) {
    this.comp = comp;
    this.level = level;
  }
}

class DeclarationObject {
  captures: any[];

  constructor(captures: any[]) {
    this.captures = captures;
  }
}

class Scope {
  frames: Array<Map<string, VariableObject>>;
  variables: Map<string, Array<VariableObject>>;
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

  addVariable(name: string, type: string): void {
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

  getVariableType(name: string): VariableObject {
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
    const t = scope.getVariableType(comp.name);
    if (t === undefined) {
      throw new Error(`VariableObject ${comp.name} not declared.`);
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
  },

  literal: (
    comp: {
      tag: string;
      type: string;
      value: any;
    },
    scope: Scope
  ) => {
    // nothing to do
  },

  var: (
    comp: {
      tag: string;
      name: string;
      type: string | null;
      value: any;
    },
    scope: Scope
  ) => {
    if (comp.value === null) {
      if (comp.type === null) {
        throw new Error(`VariableObject ${comp.name} must have a type.`);
      }
    }
    preprocess(comp.value, scope);
    scope.addVariable(comp.name, comp.type);
  },

  assign: (
    comp: {
      tag: string;
      name: string;
      value: any;
      return_captures: any | null;
    },
    scope: Scope
  ) => {
    scope.current_declaration = new DeclarationObject([]);
    preprocess(comp.value, scope);
    if (comp.return_captures != null) {
      comp.return_captures.captures = scope.current_declaration.captures;
    }
    scope.current_declaration = null;
    preprocess({ tag: "name", name: comp.name }, scope);
  },

  unary: (
    comp: {
      tag: string;
      operator: string;
      operand: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.operand, scope);
  },

  postfix: (
    comp: {
      tag: string;
      operator: string;
      operand: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.operand, scope);
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
    preprocess(comp.leftOperand, scope);
    preprocess(comp.rightOperand, scope);
  },

  sequence: (
    comp: {
      tag: string;
      body: any[];
    },
    scope: Scope
  ) => {
    for (let exp of comp.body) {
      preprocess(exp, scope);
    }
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
    preprocess(comp.condition, scope);
    preprocess(comp.then_body, scope);
    preprocess(comp.else_body, scope);
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
    preprocess(comp.condition, scope);
    preprocess(comp.update, scope);
    preprocess(comp.body, scope);
    scope.popFrame();
  },

  break: (
    comp: {
      tag: string;
    },
    scope: Scope
  ) => {
    // nothing to do
  },

  continue: (
    comp: {
      tag: string;
    },
    scope: Scope
  ) => {
    // nothing to do
  },

  return: (
    comp: {
      tag: string;
      value: any;
    },
    scope: Scope
  ) => {
    preprocess(comp.value, scope);
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
      new FunctionObject(comp, scope.level())
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
  },

  "call-stmt":
    (
      comp: {
        tag: string;
        body: any;
      },
      scope: Scope
    ) => {
      preprocess(comp.body, scope);
    },

    "go-call-stmt":
    (
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
        preprocess({ tag: "var", name: exp.name }, scope);
      } else if (exp.tag === "function") {
        preprocess({ tag: "var", name: exp.name }, scope);
      } else {
        throw new Error(`Invalid tag ${exp.tag} in global namespace.`);
      }
    }
    for (let exp of comp.body) {
      if (exp.tag === "var") {
        preprocess({ tag: "assign", name: exp.name, value: exp.value, return_captures: exp }, scope);
      } else if (exp.tag === "function") {
        preprocess({ tag: "assign", name: exp.name, value: exp }, scope);
      }
    }
  },
};

function preprocess(comp: any, scope: Scope) {
  if (comp === null || comp === undefined) {
    return;
  }
  if (comp.tag in microcode_preprocess) {
    return microcode_preprocess[comp.tag](comp, scope);
  }
  throw new Error(`Invalid tag ${comp.tag}`);
}

function preprocess_program(program: any, imports: any[]) {
  let scope = new Scope();
  for (let imp of imports) {
    scope.addVariable(imp.name, undefined);
  }
  preprocess(program, scope);
}

export { preprocess_program };
