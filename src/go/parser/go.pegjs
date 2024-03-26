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
    = "func" __ "(" __ params:FunctionTypeList __ ")" __ returnType:Type { return { tag: "function-type", params: params, returnType: returnType }; }
    / "func" __ "(" __ ")" __ returnType:Type { return { tag: "function-type", params: [], returnType: returnType }; }
    / "func" __ "(" __ params:FunctionTypeList __ ")" { return { tag: "function-type", params: params, returnType: null }; }
    / "func" __ "(" __ ")" { return { tag: "function-type", params: [], returnType: null }; }

ChannelType "channelType"
    = "chan" WhiteSpace __ type:Type { return { tag: "channel-type", type: type }; }

Type "type"
    = "int32" { return "int32"; }
    / "float32" { return "float32"; }
    / "bool" { return "bool"; }
    / "string" { return "string"; }
    / type:FunctionType { return type; }
    / type:ChannelType { return type; }
    / identifier:IdentifierWithPackage { return identifier; }
    / type:ArrayType { return type; }
    / type:SliceType { return type; }

ArrayLength "array length"
    = lit:IntegerLiteral { return lit.value; }

ArrayType "array type"
    = "[" __ len:ArrayLength __ "]" __ type:Type { return { tag: "array-type", len: len, type: type }; }

SliceType "slice type"
    = "[" __ "]" __ type:Type { return { tag: "slice-type", type: type }; }

ExpressionListElements
    = __ exp0:(Expression / ExpressionList) __ exps:((__ "," __ (Expression / ExpressionList)))* __ { return [exp0].concat(exps.map(x => x[3])); }
    / __ exp0:(Expression / ExpressionList) __ { return [exp0]; }
    / __ { return []; }

ExpressionList
    = "{" __ elements:ExpressionListElements __ "}" { return elements; }

ArrayConstructor
    = type:(ArrayType / SliceType) __ elements:ExpressionList { return { tag: "array-literal", type: type, elements: elements }; }

PrimaryExpression "PrimaryExpression"
    = Literal
    / Name
    / ArrayConstructor
    / ChannelReceiveExpression
    / AnonymousFunctionDeclaration
    / "(" __ exp:Expression __ ")" { return exp; }

ArrayOperator
    = "[" __ expr:Expression __ "]" { return { tag: "index", index: expr }; }

SliceExpression
    = expr:Expression { return expr; }
    / __ { return null; }

SliceOperator
    = "[" __ expr:SliceExpression __ ":" __ expr2:SliceExpression __ "]" { return { tag: "slice", left: expr, right: expr2 }; }

CallOperator
    = "(" __ args:FunctionArgList __ ")" { return buildFunctionCall(null, args); }

MemberOperator
    = "." __ member:Identifier { return { tag: "member", member: member }; }

PostfixExpression
    = PostfixExpressionCompulsory
    / exp:PrimaryExpression
    / "(" __ exp:Expression __ ")" { return exp; }

PostfixExpressionCompulsory
    = exp:PrimaryExpression __ posts:(ArrayOperator / SliceOperator / CallOperator / MemberOperator)+ {
        return posts.reduce(function(result, element) {
            if (element.tag === "index") {
                return { tag: "index", array: result, index: element.index };
            } else if (element.tag === "slice") {
                return { tag: "slice", array: result, left: element.left, right: element.right };
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
    = identifier:Identifier __ posts:(ArrayOperator / SliceOperator / MemberOperator)+ {
        return posts.reduce(function(result, element) {
            if (element.tag === "index") {
                return { tag: "index-address", array: result, index: element.index };
            } else if (element.tag === "slice") {
                return { tag: "slice-address", array: result, left: element.left, right: element.right };
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

MakeExpression
    = "make" __ "(" __ type:Type __ "," __ args:FunctionArgList __ ")" { return { tag: "make", type: type, args: args }; }
    / "make" __ "(" __ type:Type __ ")" { return { tag: "make", type: type, args: [] }; }

Expression
    = MakeExpression
    / LogicalOrExpression
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
    = name:VariableAddress __ "=" __ exp:Expression { return { tag: "assign", name: name, value: exp }; }

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

PostfixStatement "postfix"
    = identifier:Identifier __ operator:PostfixOperator {
        return {
            tag: "assign",
            name: identifier,
            value: {
                tag: "binary",
                operator: (operator === "++") ? "+" : "-",
                leftOperand: {
                    tag: "name",
                    name: identifier
                },
                rightOperand: makeLiteral("int32", 1)
            }
        }
    }

ChannelSendStatement "channel send"
    = name:VariableAddress __ "<-" __ exp:Expression { return { tag: "chan-send", name: name, value: exp }; }

ChannelReceiveExpression "channel receive"
    = "<-" __ name:VariableAddress { return { tag: "chan-receive", name: name }; }

// ===== 4. Sequences, Control Structures and Blocks =====

StatementList
    = __ stmt:Statement __ ";" __ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / __ stmt:Statement __ stmts:StatementList { return { tag: "sequence", body: [stmt].concat(stmts.body) }; }
    / __ stmt:Statement __ ";" { return { tag: "sequence", body: [stmt] }; }
    / __ stmt:Statement __ { return { tag: "sequence", body: [stmt] }; }
    / __ { return { tag: "sequence", body: [] }; }

Block
    = "{" __ body:StatementList __ "}" { return { tag: "block", body: body }; }

IfStatement "if"
    = "if" WhiteSpace __ condition:Expression __ body:Block __ "else" WhiteSpace __ elseBody:IfStatement { return { tag: "if", condition: condition, then_body: body, else_body: elseBody }; }
    / "if" WhiteSpace __ condition:Expression __ body:Block __ "else" WhiteSpace __ elseBody:Block { return { tag: "if", condition: condition, then_body: body, else_body: elseBody }; }
    / "if" WhiteSpace __ condition:Expression __ body:Block { return { tag: "if", condition: condition, then_body: body }; }

ForInitStatement "statement"
    = VariableDeclaration
    / Assignment
    / __ { return null; }

ForUpdateStatement "statement"
    = Assignment
    / PostfixStatement
    / __ { return null; }

ForStatement "for"
    = "for" WhiteSpace __ init: ForInitStatement __ ";" __ condition:Expression __ ";" __ update:ForUpdateStatement __ body:Block { return { tag: "for", init: init, condition: condition, update: update, body: body }; }

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

StructMethodDeclaration
    = "func" WhiteSpace __ "(" __ self:Identifier __ "*" __ type:Type __ ")" __ name:Identifier __ "(" params:FunctionParamList __ ")" __
        returnType:Type __ body:Block { return buildStructMethodDeclaration(name, self, type, params, returnType, body); }
    / "func" WhiteSpace __ "(" __ self:Identifier __ "*" __ type:Type __ ")" __ name:Identifier __ "(" params:FunctionParamList __ ")" __
        body:Block { return buildStructMethodDeclaration(name, self, type, params, null, body); }

FunctionArgList
    = __ arg0:Expression args:((__ "," __ Expression)*) __ { return [arg0].concat(args.map(x => x[3])); }
    / __ arg0:Expression __ { return [arg0]; }
    / __ { return []; }

FunctionCall
    = func:CallExpression { return { tag: "call-stmt", body: func }; }

AnonymousFunctionDeclaration
    = "func" __ "(" __ params:FunctionParamList __ ")" __ returnType:Type __ body:Block { return buildFunctionDeclaration(null, params, returnType, body); }
    / "func" __ "(" __ params:FunctionParamList __ ")" __ body:Block { return buildFunctionDeclaration(null, params, null, body); }

GoFunctionCall
    = "go" WhiteSpace __ func:CallExpression { return { tag: "go-call-stmt", body: func }; }


// ===== 6. Struct Declaration =====

StructField "struct field"
    = identifier:Identifier __ type:Type { return { name: identifier, type: type }; }

StructFieldList "struct field list"
    = __ field0:StructField __ fields:((__ StructField)*) __ { return [field0].concat(fields.map(x => x[1])); }
    / __ field0:StructField __ { return [field0]; }
    / __ { return []; }

StructDeclaration
    = "type" WhiteSpace __ name:Name WhiteSpace __ "struct" __ "{" __ fields:StructFieldList __ "}" { return { tag: "struct", name: name, fields: fields }; }

// ===== 7. Select Statements =====

SelectStatement
    = "select" WhiteSpace __ "{" __ cases:SelectCaseList __ "}" { return { tag: "select", body: cases }; }

SelectCase
    = "case" WhiteSpace __ stmt:ChannelSendStatement __ ":" __ body:StatementList { return { tag: "select-case", case: stmt, body: body }; }
    / "case" WhiteSpace __ stmt:Assignment __ ":" __ body:StatementList { return { tag: "select-case", case: stmt, body: body }; }
    / "default" __ ":" __ body:StatementList { return { tag: "select-default", body: body }; }

SelectCaseList
    = __ case0:SelectCase __ cases:((__ SelectCase)*) __ { return [case0].concat(cases.map(x => x[1])); }
    / __ case0:SelectCase __ { return [case0]; }
    / __ { return []; }

// ===== 8. Program =====

GlobalScopeStatements
    = StructDeclaration
    / StructMethodDeclaration
    / FunctionDeclaration
    / VariableDeclaration

GlobalScopeStatementList
    = __ stmt:GlobalScopeStatements __ ";" __ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / __ stmt:GlobalScopeStatements __ stmts:GlobalScopeStatementList { return [stmt].concat(stmts); }
    / __ stmt:GlobalScopeStatements __ ";" { return [stmt]; }
    / __ stmt:GlobalScopeStatements { return [stmt]; }
    / __ { return []; }

Program
    = __ pack:PackageStatement imports:((__ ImportStatement)*) __ stmts:GlobalScopeStatementList __ { return buildProgram(pack, imports, stmts); }
