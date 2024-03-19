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

function buildFunctionCall(name, args) {
    return {
        tag: "call",
        name: name,
        args: args
    };
}

function buildAnonymousFunctionCall(func, args) {
    return {
        tag: "lambda-call",
        func: func,
        args: args
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
}}

Start
    = Program

// ===== 1. Characters and Comments =====

WhiteSpace "whitespace"
  = [ \t] / LineTerminator

__
    = (WhiteSpace / Comment)*

LineTerminator
  = "\n"

SingleLineCommentCharacter
    = [^\n]

SingleLineComment
    = "//" SingleLineCommentCharacter*

MultiLineCommentCharacter
    = [^*] / ("*" [^/])

MultiLineComment
    = "/*" MultiLineCommentCharacter* "*/"

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

IdentifierWithPackage "identifier"
    = packageName:PackageName __ "." __ identifier:IdentifierWithPackage { return packageName + "." + identifier; }
    / identifier:Identifier { return identifier; }

Name "name"
    = identifier:Identifier { return { tag: "name", name: identifier }; }

FunctionTypeList "functionTypeList"
    = __ param0:Type __ params:((__ "," __ Type)*) __ { return [param0].concat(params.map(x => x[3])); }
    / __ param0:Type __ { return [param0]; }
    / __ { return []; }

FunctionType "functionType"
    = "func" __ "(" __ params:FunctionTypeList __ ")" __ returnType:Type { return { tag: "functionType", params: params, returnType: returnType }; }
    / "func" __ "(" __ ")" __ returnType:Type { return { tag: "functionType", params: [], returnType: returnType }; }
    / "func" __ "(" __ params:FunctionTypeList __ ")" { return { tag: "functionType", params: params, returnType: null }; }
    / "func" __ "(" __ ")" { return { tag: "functionType", params: [], returnType: null }; }

Type "type"
    = "int32" { return "int32"; }
    / "float32" { return "float32"; }
    / "bool" { return "bool"; }
    / "string" { return "string"; }
    / FunctionType { return "function"; }
    / type:ArrayType { return type; }
    / type:SliceType { return type; }

ArrayLength "array length"
    = lit:IntegerLiteral { return lit.value; }

ArrayType "array type"
    = "[" __ len:ArrayLength __ "]" __ type:Type { return { tag: "arrayType", len: len, type: type }; }

SliceType "slice type"
    = "[" __ "]" __ type:Type { return { tag: "sliceType", type: type }; }

ExpressionListElements
    = __ exp0:(Expression / ExpressionList) __ exps:((__ "," __ (Expression / ExpressionList)))* __ { return [exp0].concat(exps.map(x => x[3])); }
    / __ exp0:(Expression / ExpressionList) __ { return [exp0]; }
    / __ { return []; }

ExpressionList
    = "{" __ elements:ExpressionListElements __ "}" { return elements; }

ArrayConstructor
    = type:(ArrayType / SliceType) __ elements:ExpressionList { return { tag: "arrayLiteral", type: type, elements: elements }; }

SliceExpression
    = expr:Expression { return expr; }
    / __ { return null; }

PrimaryExpression
    = expr:PrimaryExpressionWithoutArray __ index:(("[" __ Expression __ "]") / ("[" __ SliceExpression __ ":" __ SliceExpression __ "]"))+ {
        return index.reduce(function(result, element) {
            if (element.length > 5) {
                return { tag: "slice", array: result, left: element[2], right: element[6] };
            } else {
                return { tag: "index", array: result, index: element[2] };
            }
        }, expr);
    }
    / expr:PrimaryExpressionWithoutArray { return expr; }

PrimaryExpressionWithoutArray "PrimaryExpression"
    = AnonymousFunctionCall
    / FunctionCall
    / Literal
    / Name
    / ArrayConstructor
    / "(" __ exp:Expression __ ")" { return exp; }

PostfixOperator
    = "++" / "--"

PostfixExpression
    = exp:PrimaryExpression __ operator:PostfixOperator { return { tag: "postfix", operator: operator, operand: exp }; }
    / exp:PrimaryExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

UnaryOperator
    = "+" / "-" / "!"

UnaryExpression
    = operator:UnaryOperator __ exp:UnaryExpression { return { tag: "unary", operator: operator, operand: exp }; }
    / exp:PostfixExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

MultiplicativeOperator
    = "*" / "/" / "%"

MultiplicativeExpression
    = head:UnaryExpression tail:(__ MultiplicativeOperator __ UnaryExpression)* { return buildBinaryExpression(head, tail); }
    / exp:UnaryExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

AdditiveOperator
    = "+" / "-"

AdditiveExpression
    = head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* { return buildBinaryExpression(head, tail); }
    / exp:MultiplicativeExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

RelationalOperator
    = "<=" / "<" / ">=" / ">"

RelationalExpression
    = head:AdditiveExpression tail:(__ RelationalOperator __ AdditiveExpression)* { return buildBinaryExpression(head, tail); }
    / exp:AdditiveExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

EqualityOperator
    = "==" / "!="

EqualityExpression
    = head:RelationalExpression tail:(__ EqualityOperator __ RelationalExpression)* { return buildBinaryExpression(head, tail); }
    / exp:RelationalExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

LogicalAndOperator
    = "&&"

LogicalAndExpression
    = head:EqualityExpression tail:(__ LogicalAndOperator __ EqualityExpression)* { return buildBinaryExpression(head, tail); }
    / exp:EqualityExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

LogicalOrOperator
    = "||"

LogicalOrExpression
    = head:LogicalAndExpression tail:(__ LogicalOrOperator __ LogicalAndExpression)* { return buildBinaryExpression(head, tail); }
    / exp:LogicalAndExpression { return exp; }
    / "(" __ exp:Expression __ ")" { return exp; }

Expression
    = LogicalOrExpression
    / AnonymousFunctionDeclaration

// ===== 3. Statements =====

VariableDeclaration
    = "var" WhiteSpace __ identifier:Identifier __ type:Type __ "=" __ exp:Expression { return { tag: "var", name: identifier, type: type, value: exp }; }
    / "var" WhiteSpace __ identifier:Identifier __ type:Type { return { tag: "var", name: identifier, type: type }; }
    / "var" WhiteSpace __ identifier:Identifier __ "=" __ exp:Expression { return { tag: "var", name: identifier, value: exp }; }
    / "var" __ "(" __ identifier:Identifier __ type:Type __ "=" __ exp:Expression __ ")" { return { tag: "var", name: identifier, type: type, value: exp }; }
    / "var" __ "(" __ identifier:Identifier __ type:Type __ ")" { return { tag: "var", name: identifier, type: type }; }
    / "var" __ "(" __ identifier:Identifier __ "=" __ exp:Expression __ ")" { return { tag: "var", name: identifier, value: exp }; }
    / identifier:Identifier __ ":=" __ exp:Expression { return { tag: "var", name: identifier, value: exp }; }

Assignment
    = identifier:Identifier __ "=" __ exp:Expression { return { tag: "assign", name: identifier, value: exp }; }

Statement
    = FunctionDeclaration
    / VariableDeclaration
    / GoAnomymousFunctionCall
    / GoFunctionCall
    / Assignment
    / Block
    / IfStatement
    / ForStatement
    / DeferStatement
    / ReturnStatement
    / BreakStatement
    / ContinueStatement
    / Expression

PackageStatement "package"
    = "package" WhiteSpace __ identifier:Identifier { return { tag: "package", name: identifier }; }

ImportStatement "import"
    = "import" WhiteSpace __ lib:StringLiteral { return { tag: "import", libs: [lib] }; }
    / "import" WhiteSpace __ "(" __ lib:StringLiteral libs:((__ StringLiteral)*) __ ")" { return { tag: "import", libs: [lib].concat(libs.map(x => x[1])) }; }

DeferStatement "defer"
    = "defer" WhiteSpace __ stmt:Statement { return { tag: "defer", stmt: stmt }; }

ReturnStatement "return"
    = "return" WhiteSpace __ exp:Expression { return { tag: "return", value: exp }; }
    / "return" { return { tag: "return" }; }

// ===== 4. Sequences, Control Structures and Blocks =====

StatementList
    = __ stmt:Statement __ ";" __ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / __ stmt:Statement [ \t]* LineTerminator __ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / __ stmt:Statement __ ";" { return { tag: "sequence", body: [stmt] }; }
    / __ stmt:Statement __ { return { tag: "sequence", body: [stmt] }; }
    / __ { return { tag: "sequence", body: [] }; }

Block
    = "{" __ body:StatementList __ "}" { return { tag: "block", body: body }; }

IfStatement "if"
    = "if" WhiteSpace __ condition:Expression __ body:Block __ "else" WhiteSpace __ elseBody:IfStatement { return { tag: "if", condition: condition, body: body, elseBody: elseBody }; }
    / "if" WhiteSpace __ condition:Expression __ body:Block __ "else" WhiteSpace __ elseBody:Block { return { tag: "if", condition: condition, body: body, elseBody: elseBody }; }
    / "if" WhiteSpace __ condition:Expression __ body:Block { return { tag: "if", condition: condition, body: body }; }

ForInitPostStatement "statement"
    = VariableDeclaration
    / Assignment
    / __ { return null; }

ForStatement "for"
    = "for" WhiteSpace __ init: ForInitPostStatement __ ";" __ condition:Expression __ ";" __ post:ForInitPostStatement __ body:Block { return { tag: "for", init: init, condition: condition, post: post, body: body }; }

BreakStatement "break"
    = "break" { return { tag: "break" }; }

ContinueStatement "continue"
    = "continue" { return { tag: "continue" }; }

// ===== 5. Function Declaration =====

FunctionParamList
    = __ param0:(__ Identifier __ Type) __ params:((__ "," __ Identifier __ Type)*) __ {
        return [{name: param0[1], type: param0[3]}].concat(params.map(x => ({name: x[3], type: x[5]})));
    }
    / __ param0:(__ Identifier __ Type) __ { return [{name: param0[1], type: param0[3]}]; }
    / __ { return []; }

FunctionDeclaration
    = "func" WhiteSpace __ name:Identifier __ "(" params:FunctionParamList __ ")" __ returnType:Type __ body:Block { return buildFunctionDeclaration(name, params, returnType, body); }
    / "func" WhiteSpace __ name:Identifier __ "(" params:FunctionParamList __ ")" __ body:Block { return buildFunctionDeclaration(name, params, null, body); }

FunctionArgList
    = __ arg0:Expression args:((__ "," __ Expression)*) __ { return [arg0].concat(args.map(x => x[3])); }
    / __ arg0:Expression __ { return [arg0]; }
    / __ { return []; }

FunctionCall
    = name:IdentifierWithPackage __ "(" __ args:FunctionArgList __ ")" { return buildFunctionCall(name, args); }

AnonymousFunctionDeclaration
    = "func" __ "(" __ params:FunctionParamList __ ")" __ returnType:Type __ body:Block { return buildFunctionDeclaration(null, params, returnType, body); }
    / "func" __ "(" __ params:FunctionParamList __ ")" __ body:Block { return buildFunctionDeclaration(null, params, null, body); }

AnonymousFunctionCall
    = func:AnonymousFunctionDeclaration __ "(" __ args:FunctionArgList __ ")" { return buildAnonymousFunctionCall(func, args); }

GoFunctionCall
    = "go" WhiteSpace __ func:FunctionCall { func.tag = "go-call"; return func; }

GoAnomymousFunctionCall
    = "go" WhiteSpace __ func:AnonymousFunctionCall { func.tag = "go-lambda-call"; return func; }

// ===== 6. Program =====

GlobalScopeStatements
    = FunctionDeclaration
    / VariableDeclaration

GlobalScopeStatementList
    = __ stmt:GlobalScopeStatements __ ";" __ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / __ stmt:GlobalScopeStatements __ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / __ stmt:GlobalScopeStatements __ ";" { return [stmt]; }
    / __ stmt:GlobalScopeStatements { return [stmt]; }
    / __ { return []; }

Program
    = __ pack:PackageStatement imports:((__ ImportStatement)*) __ stmts:GlobalScopeStatementList __ { return buildProgram(pack, imports, stmts); }
