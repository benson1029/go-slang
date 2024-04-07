// Syntax definition of our sublanguage of Go

{{
function makeLiteral(type, value) {
    return {
        tag: "literal",
        type: type,
        value: value
    };
}

function buildBinaryExpression(head, tail) {
    return tail.reduce(function(result, element) {
        return {
            tag: "binary",
            operator: element[1],
            leftOperand: result,
            rightOperand: element[3]
        };
    }, head);
}

function buildFunctionDeclaration(name, params, returnType, body) {
    return {
        tag: "function",
        name: name,
        params: params,
        returnType: returnType,
        body: body
    };
}

function buildStructMethodDeclaration(name, self, type, params, returnType, body) {
    return {
        tag: "struct-method",
        name: name,
        self: self,
        struct: type,
        params: params,
        returnType: returnType,
        body: body
    };
}

function buildFunctionCall(func, args) {
    return {
        tag: "call",
        func: func,
        args: args
    };
}

function buildConstructor(type, args) {
    let args_array = [];
    for (let arg of args) {
        if (arg instanceof Array) {
            args_array.push(buildConstructor(type.type, arg));
        } else {
            args_array.push(arg);
        }
    }
    return {
        tag: "constructor",
        type: type,
        args: args_array
    };
}

function buildProgram(pack, imports, body) {
    let import_array = [];
    for (let i = 0; i < imports.length; i++) {
        import_array = import_array.concat(imports[i][1].libs.map(x => x.value));
    }
    return {
        tag: "program",
        package: pack.name,
        imports: import_array,
        body: body
    };
}

function addressToValue(name) {
    if (name.tag === "name-address") {
        return { tag: "name", name: name.name };
    } else if (name.tag === "index-address") {
        return { tag: "index", array: addressToValue(name.array), index: name.index };
    } else if (name.tag === "slice-address") {
        return { tag: "slice", array: addressToValue(name.array), start: name.start, end: name.end };
    } else if (name.tag === "member-address") {
        return { tag: "member", object: addressToValue(name.object), member: name.member };
    }
}
}}

Start
    = Program

// ===== 1. Characters and Comments =====

WhiteSpace "whitespace"
  = [ \t]

__
    = (WhiteSpace / Comment)*

___
    = (WhiteSpace / LineTerminator / Comment)*

LineTerminator
  = "\n"

SingleLineCommentCharacter
    = [^\n]

SingleLineComment
    = "//" SingleLineCommentCharacter*

MultiLineComment
    = "/*" (!"*/" .)* "*/"

Comment
    = SingleLineComment
    / MultiLineComment

// ===== 2. Literals and Expressions =====

IntegerLiteral "int32"
    = [0-9]+ { return makeLiteral("int32", parseInt(text(), 10)); }

FloatLiteral "float32"
    = [0-9]+ "." [0-9]+ { return makeLiteral("float32", parseFloat(text(), 10)); }
    / "-" [0-9]+ "." [0-9]+ { return makeLiteral("float32", -parseFloat(text(), 10)); }

BooleanLiteral "bool"
    = "true" { return makeLiteral("bool", true); }
    / "false" { return makeLiteral("bool", false); }

StringLiteral "string"
    = "\"" str:([^\n"]*) "\"" { return makeLiteral("string", str.join("")); }

Literal "literal"
    = FloatLiteral
    / IntegerLiteral
    / BooleanLiteral
    / StringLiteral

ReservedWord "reserved"
    = "var" / "func" / "return" / "if" / "else" / "for" / "defer" / "go" / "package" / "import" / "break" / "continue"

PackageName "packageName"
    = [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

IdentifierAndReserved "identifier"
    = [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

Identifier "identifier"
    = content:((! ReservedWord) IdentifierAndReserved) { return content[1]; }
    / content1:ReservedWord content2:([a-zA-Z_][a-zA-Z0-9_]+) { return content1 + content2.map(x => (x instanceof Array) ? x.join("") : x).join(""); }

IdentifierWithPackage "identifier"
    = packageName:PackageName ___ "." ___ identifier:IdentifierWithPackage { return packageName + "." + identifier; }
    / identifier:Identifier { return identifier; }

Name "name"
    = identifier:Identifier { return { tag: "name", name: identifier }; }

FunctionTypeList "functionTypeList"
    = ___ param0:Type ___ params:((___ "," ___ Type)*) ___ { return [param0].concat(params.map(x => x[3])); }
    / ___ param0:Type ___ { return [param0]; }
    / ___ { return []; }

FunctionType "functionType"
    = "func" ___ "(" ___ params:FunctionTypeList ___ ")" ___ returnType:Type { return { tag: "function-type", params: params, returnType: returnType }; }
    / "func" ___ "(" ___ ")" ___ returnType:Type { return { tag: "function-type", params: [], returnType: returnType }; }
    / "func" ___ "(" ___ params:FunctionTypeList ___ ")" { return { tag: "function-type", params: params, returnType: null }; }
    / "func" ___ "(" ___ ")" { return { tag: "function-type", params: [], returnType: null }; }

ChannelType "channelType"
    = "chan" WhiteSpace ___ type:Type { return { tag: "channel-type", type: type }; }

Type "type"
    = "int32" { return { tag: "int32-type" }; }
    / "float32" { return { tag: "float32-type" }; }
    / "bool" { return { tag: "bool-type" }; }
    / "string" { return { tag: "string-type" }; }
    / type:FunctionType { return type; }
    / type:ChannelType { return type; }
    / identifier:IdentifierWithPackage { return { tag: "struct-decl-type", name: identifier }; }
    / type:ArrayType { return type; }
    / type:SliceType { return type; }

ArrayLength "array length"
    = lit:IntegerLiteral { return lit.value; }

ArrayType "array type"
    = "[" ___ len:ArrayLength ___ "]" ___ type:Type { return { tag: "array-type", len: len, type: type }; }

SliceType "slice type"
    = "[" ___ "]" ___ type:Type { return { tag: "slice-type", type: type }; }

ExpressionListElements
    = ___ exp0:(Expression / ExpressionList) ___ exps:((___ "," ___ (Expression / ExpressionList)))* ___ { return [exp0].concat(exps.map(x => x[3])); }
    / ___ exp0:(Expression / ExpressionList) ___ { return [exp0]; }
    / ___ { return []; }

ExpressionList
    = "{" ___ elements:ExpressionListElements ___ "}" { return elements; }

TypeConstructor
    = type:(Type) ___ args:ExpressionList { return buildConstructor(type, args); }

PrimaryExpression "PrimaryExpression"
    = AnonymousFunctionDeclaration
    / Literal
    / TypeConstructor
    / Name
    / ChannelReceiveExpression
    / "(" ___ exp:Expression ___ ")" { return exp; }

ArrayOperator
    = "[" ___ expr:Expression ___ "]" { return { tag: "index", index: expr }; }

SliceExpression
    = expr:Expression { return expr; }
    / ___ { return null; }

SliceOperator
    = "[" ___ expr:SliceExpression ___ ":" ___ expr2:SliceExpression ___ "]" { return { tag: "slice", start: expr, end: expr2 }; }

CallOperator
    = "(" ___ args:FunctionArgList ___ ")" { return buildFunctionCall(null, args); }

MemberOperator
    = "." ___ member:Identifier { return { tag: "member", member: member }; }

PostfixExpression
    = PostfixExpressionCompulsory
    / exp:PrimaryExpression
    / "(" ___ exp:Expression ___ ")" { return exp; }

PostfixExpressionCompulsory
    = exp:PrimaryExpression ___ posts:(ArrayOperator / SliceOperator / CallOperator / MemberOperator)+ {
        return posts.reduce(function(result, element) {
            if (element.tag === "index") {
                return { tag: "index", array: result, index: element.index };
            } else if (element.tag === "slice") {
                return { tag: "slice", array: result, start: element.start, end: element.end };
            } else if (element.tag === "call") {
                return { tag: "call", func: result, args: element.args };
            } else if (element.tag === "member") {
                return { tag: "member", object: result, member: element.member };
            }
        }, exp);
    }

CallExpression
    = expr:PostfixExpressionCompulsory

VariableAddress "variable"
    = identifier:Identifier ___ posts:(ArrayOperator / SliceOperator / MemberOperator)+ {
        return posts.reduce(function(result, element) {
            if (element.tag === "index") {
                return { tag: "index-address", array: result, index: element.index };
            } else if (element.tag === "slice") {
                return { tag: "slice-address", array: result, start: element.start, end: element.end };
            } else if (element.tag === "member") {
                return { tag: "member-address", object: result, member: element.member };
            }
        }, { tag: "name-address", name: identifier });
    }
    / identifier:Identifier { return { tag: "name-address", name: identifier }; }

PostfixOperator
    = "++" / "--"

UnaryOperator
    = "+" / "-" / "!"

UnaryExpression
    = operator:UnaryOperator ___ exp:UnaryExpression { return { tag: "unary", operator: operator, operand: exp }; }
    / exp:PostfixExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

MultiplicativeOperator
    = "*" / "/" / "%"

MultiplicativeExpression
    = head:UnaryExpression tail:(__ MultiplicativeOperator ___ UnaryExpression)* { return buildBinaryExpression(head, tail); }
    / exp:UnaryExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

AdditiveOperator
    = "+" / "-"

AdditiveExpression
    = head:MultiplicativeExpression tail:(__ AdditiveOperator ___ MultiplicativeExpression)* { return buildBinaryExpression(head, tail); }
    / exp:MultiplicativeExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

RelationalOperator
    = "<=" / "<" / ">=" / ">"

RelationalExpression
    = head:AdditiveExpression tail:(__ RelationalOperator ___ AdditiveExpression)* { return buildBinaryExpression(head, tail); }
    / exp:AdditiveExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

EqualityOperator
    = "==" / "!="

EqualityExpression
    = head:RelationalExpression tail:(__ EqualityOperator ___ RelationalExpression)* { return buildBinaryExpression(head, tail); }
    / exp:RelationalExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

LogicalAndOperator
    = "&&"

LogicalAndExpression
    = head:EqualityExpression tail:(__ LogicalAndOperator ___ EqualityExpression)* { return buildBinaryExpression(head, tail); }
    / exp:EqualityExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

LogicalOrOperator
    = "||"

LogicalOrExpression
    = head:LogicalAndExpression tail:(__ LogicalOrOperator ___ LogicalAndExpression)* { return buildBinaryExpression(head, tail); }
    / exp:LogicalAndExpression { return exp; }
    / "(" ___ exp:Expression ___ ")" { return exp; }

MakeExpression
    = "make" __ "(" ___ type:Type ___ "," ___ args:FunctionArgList ___ ")" { return { tag: "make", type: type, args: args }; }
    / "make" __ "(" ___ type:Type ___ ")" { return { tag: "make", type: type, args: [] }; }

Expression
    = MakeExpression
    / LogicalOrExpression
    / AnonymousFunctionDeclaration

// ===== 3. Statements =====

VariableDeclaration
    = "var" WhiteSpace __ identifier:Identifier __ type:Type __ "=" ___ exp:Expression { return { tag: "var", name: identifier, type: type, value: exp }; }
    / "var" WhiteSpace __ identifier:Identifier __ type:Type { return { tag: "var", name: identifier, type: type }; }
    / "var" WhiteSpace __ identifier:Identifier __ "=" ___ exp:Expression { return { tag: "var", name: identifier, value: exp }; }
    / identifier:Identifier __ ":=" ___ exp:Expression { return { tag: "var", name: identifier, value: exp }; }

Assignment
    = name:VariableAddress __ "=" ___ exp:Expression { return { tag: "assign", name: name, value: exp }; }

Statement
    = VariableDeclaration
    / GoFunctionCall
    / PostfixStatement
    / Assignment
    / Block
    / ChannelSendStatement
    / IfStatement
    / ForStatement
    / DeferStatement
    / ReturnStatement
    / BreakStatement
    / ContinueStatement
    / SelectStatement
    / FunctionCall
    / ChannelReceiveStatement

PackageStatement "package"
    = "package" WhiteSpace ___ identifier:Identifier { return { tag: "package", name: identifier }; }

ImportStatement "import"
    = "import" WhiteSpace ___ lib:StringLiteral { return { tag: "import", libs: [lib] }; }
    / "import" WhiteSpace ___ "(" ___ lib:StringLiteral libs:((___ StringLiteral)*) ___ ")" { return { tag: "import", libs: [lib].concat(libs.map(x => x[1])) }; }

DeferStatement "defer"
    = "defer" WhiteSpace __ stmt:Statement { return { tag: "defer", stmt: stmt }; }

ReturnStatement "return"
    = "return" WhiteSpace __ exp:Expression { return { tag: "return", value: exp }; }
    / "return" { return { tag: "return" }; }

PostfixStatement "postfix"
    = name:VariableAddress __ operator:PostfixOperator {
        return {
            tag: "assign",
            name: name,
            value: {
                tag: "binary",
                operator: (operator === "++") ? "+" : "-",
                leftOperand: addressToValue(name),
                rightOperand: makeLiteral("int32", 1)
            }
        }
    }

ChannelSendStatement "channel send"
    = name:VariableAddress __ "<-" ___ exp:Expression { return { tag: "chan-send", name: name, value: exp }; }

ChannelReceiveExpression "channel receive"
    = "<-" __ name:VariableAddress { return { tag: "chan-receive", name: name }; }

ChannelReceiveStatement "channel receive"
    = body:ChannelReceiveExpression { return { tag: "chan-receive-stmt", body: body }; }

// ===== 4. Sequences, Control Structures and Blocks =====

StatementList
    = ___ stmt:Statement __ ";" ___ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / ___ stmt:Statement ___ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / ___ stmt:Statement __ ";" { return { tag: "sequence", body: [stmt] }; }
    / ___ stmt:Statement ___ { return { tag: "sequence", body: [stmt] }; }
    / ___ { return { tag: "sequence", body: [] }; }

Block
    = "{" ___ body:StatementList ___ "}" { return { tag: "block", body: body }; }

IfStatement "if"
    = "if" WhiteSpace ___ condition:Expression ___ body:Block ___ "else" WhiteSpace ___ elseBody:IfStatement { return { tag: "if", condition: condition, then_body: body, else_body: elseBody }; }
    / "if" WhiteSpace ___ condition:Expression ___ body:Block ___ "else" ___ elseBody:Block { return { tag: "if", condition: condition, then_body: body, else_body: elseBody }; }
    / "if" WhiteSpace ___ condition:Expression ___ body:Block { return { tag: "if", condition: condition, then_body: body }; }

ForInitStatement "statement"
    = VariableDeclaration
    / Assignment
    / ___ { return null; }

ForUpdateStatement "statement"
    = Assignment
    / PostfixStatement
    / ___ { return null; }

ForStatement "for"
    = "for" WhiteSpace ___ init: ForInitStatement ___ ";" ___ condition:Expression ___ ";" ___ update:ForUpdateStatement ___ body:Block { return { tag: "for", init: init, condition: condition, update: update, body: body }; }

BreakStatement "break"
    = "break" { return { tag: "break" }; }

ContinueStatement "continue"
    = "continue" { return { tag: "continue" }; }

// ===== 5. Function Declaration =====

FunctionParamList
    = ___ param0:(___ Identifier ___ Type) ___ params:((___ "," ___ Identifier ___ Type)*) ___ {
        return [{name: param0[1], type: param0[3]}].concat(params.map(x => ({name: x[3], type: x[5]})));
    }
    / ___ param0:(___ Identifier ___ Type) ___ { return [{name: param0[1], type: param0[3]}]; }
    / ___ { return []; }

FunctionDeclaration
    = "func" WhiteSpace ___ name:Identifier ___ "(" params:FunctionParamList ___ ")" ___ returnType:Type ___ body:Block { return buildFunctionDeclaration(name, params, returnType, body); }
    / "func" WhiteSpace ___ name:Identifier ___ "(" params:FunctionParamList ___ ")" ___ body:Block { return buildFunctionDeclaration(name, params, null, body); }

StructMethodDeclaration
    = "func" WhiteSpace ___ "(" ___ self:Identifier ___ type:Type ___ ")" ___ name:Identifier ___ "(" params:FunctionParamList ___ ")" ___
        returnType:Type ___ body:Block { return buildStructMethodDeclaration(name, self, type, params, returnType, body); }
    / "func" WhiteSpace ___ "(" ___ self:Identifier ___ type:Type ___ ")" ___ name:Identifier ___ "(" params:FunctionParamList ___ ")" ___
        body:Block { return buildStructMethodDeclaration(name, self, type, params, null, body); }

FunctionArgList
    = ___ arg0:Expression args:((___ "," ___ Expression)*) ___ { return [arg0].concat(args.map(x => x[3])); }
    / ___ arg0:Expression ___ { return [arg0]; }
    / ___ { return []; }

FunctionCall
    = func:CallExpression { return { tag: "call-stmt", body: func }; }

AnonymousFunctionDeclaration
    = "func" ___ "(" ___ params:FunctionParamList ___ ")" ___ returnType:Type ___ body:Block { return buildFunctionDeclaration(null, params, returnType, body); }
    / "func" ___ "(" ___ params:FunctionParamList ___ ")" ___ body:Block { return buildFunctionDeclaration(null, params, null, body); }

GoFunctionCall
    = "go" WhiteSpace __ func:CallExpression { return { tag: "go-call-stmt", body: func }; }


// ===== 6. Struct Declaration =====

StructField "struct field"
    = identifier:Identifier __ type:Type { return { name: identifier, type: type }; }

StructFieldList "struct field list"
    = ___ field0:StructField ___ fields:((___ StructField)*) ___ { return [field0].concat(fields.map(x => x[1])); }
    / ___ field0:StructField ___ { return [field0]; }
    / ___ { return []; }

StructDeclaration
    = "type" WhiteSpace __ name:Name WhiteSpace __ "struct" ___ "{" ___ fields:StructFieldList ___ "}" { return { tag: "struct", name: name, fields: fields }; }

// ===== 7. Select Statements =====

SelectStatement
    = "select" WhiteSpace ___ "{" ___ cases:SelectCaseList ___ "}" { return { tag: "select", body: cases }; }

SelectCase
    = "case" WhiteSpace __ stmt:ChannelSendStatement __ ":" ___ body:StatementList { return { tag: "select-case", case: stmt, body: body }; }
    / "case" WhiteSpace __ stmt:Assignment __ ":" ___ body:StatementList { return { tag: "select-case", case: stmt, body: body }; }
    / "default" __ ":" ___ body:StatementList { return { tag: "select-default", body: body }; }

SelectCaseList
    = ___ case0:SelectCase ___ cases:((___ SelectCase)*) ___ { return [case0].concat(cases.map(x => x[1])); }
    / ___ case0:SelectCase ___ { return [case0]; }
    / ___ { return []; }

// ===== 8. Program =====

GlobalScopeStatements
    = StructDeclaration
    / StructMethodDeclaration
    / FunctionDeclaration
    / VariableDeclaration

GlobalScopeStatementList
    = ___ stmt:GlobalScopeStatements __ ";" ___ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / ___ stmt:GlobalScopeStatements LineTerminator ___ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / ___ stmt:GlobalScopeStatements __ ";" { return [stmt]; }
    / ___ stmt:GlobalScopeStatements { return [stmt]; }
    / ___ { return []; }

Program
    = ___ pack:PackageStatement imports:((___ ImportStatement)*) ___ stmts:GlobalScopeStatementList ___ { return buildProgram(pack, imports, stmts); }
