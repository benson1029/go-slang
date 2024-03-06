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

// ===== 1. Characters =====

WhiteSpace "whitespace"
  = [ \t] / LineTerminator

__
    = WhiteSpace*

LineTerminator
  = "\n"

// ===== 2. Literals and Expressions =====

IntegerLiteral "int"
    = [0-9]+ { return makeLiteral("int", parseInt(text(), 10)); }
    / "-" [0-9]+ { return makeLiteral("int", -parseInt(text(), 10)); }

FloatLiteral "float"
    = [0-9]+ "." [0-9]+ { return makeLiteral("float", parseFloat(text(), 10)); }
    / "-" [0-9]+ "." [0-9]+ { return makeLiteral("float", -parseFloat(text(), 10)); }

BooleanLiteral "bool"
    = "true" { return makeLiteral("bool", true); }
    / "false" { return makeLiteral("bool", false); }

StringLiteral "string"
    = "\"" str:([^\n"]*) "\"" { return makeLiteral("string", str.join("")); }

Literal "literal"
    = FloatLiteral
    / IntegerLiteral
    / BooleanLiteral

Identifier "identifier"
    = [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

Type "type"
    = "int" { return "int"; }
    / "float" { return "float"; }
    / "bool" { return "bool"; }

PrimaryExpression
    = Literal
    / Identifier
    / "(" __ exp:Expression __ ")" { return exp; }

UnaryOperator
    = "+" / "-" / "!"

UnaryExpression
    = operator:UnaryOperator __ exp:PrimaryExpression { return { tag: "unary", operator: operator, operand: exp }; }
    / exp:PrimaryExpression { return exp; }
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
    = "<" / "<=" / ">" / ">="

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

// ===== 3. Statements =====

VariableDeclaration
    = "var" WhiteSpace __ identifier:Identifier __ type:Type __ "=" __ exp:Expression { return { tag: "var", name: identifier, type: type, value: exp }; }
    / "var" WhiteSpace __ identifier:Identifier __ type:Type { return { tag: "var", name: identifier, type: type }; }
    / "var" WhiteSpace __ identifier:Identifier __ "=" __ exp:Expression { return { tag: "var", name: identifier, value: exp }; }
    / identifier:Identifier __ ":=" __ exp:Expression { return { tag: "var", name: identifier, value: exp }; }

Assignment
    = identifier:Identifier __ "=" __ exp:Expression { return { tag: "assign", name: identifier, value: exp }; }

Statement
    = VariableDeclaration
    / Assignment
    / Block
    / IfElseStatement
    / IfStatement

PackageStatement "package"
    = "package" WhiteSpace __ identifier:Identifier { return { tag: "package", name: identifier }; }

ImportStatement "import"
    = "import" WhiteSpace __ lib:StringLiteral { return { tag: "import", libs: [lib] }; }
    / "import" WhiteSpace __ "(" __ lib:StringLiteral libs:((__ StringLiteral)*) __ ")" { return { tag: "import", libs: [lib].concat(libs.map(x => x[1])) }; }

// ===== 4. Sequences and Blocks =====

StatementList
    = __ stmt:Statement __ ";" __ stmts:StatementList { return { tag: "sequence", stmts: [stmt].concat(stmts.stmts) }; }
    / __ stmt:Statement [ \t]* LineTerminator __ stmts:StatementList { return { tag: "sequence", stmts: [stmt].concat(stmts.stmts) }; }
    / __ stmt:Statement __ ";" { return { tag: "sequence", stmts: [stmt] }; }
    / __ stmt:Statement __ { return { tag: "sequence", stmts: [stmt] }; }
    / __ { return { tag: "sequence", stmts: [] }; }

Block
    = "{" __ body:StatementList __ "}" { return { tag: "block", body: body }; }

IfStatement "if"
    = "if" WhiteSpace __ condition:Expression __ body:Block { return { tag: "if", condition: condition, body: body }; }

IfElseStatement "if-else"
    = "if" WhiteSpace __ condition:Expression __ body:Block __ "else" WhiteSpace __ elseBody:Block { return { tag: "if-else", condition: condition, body: body, elseBody: elseBody }; }


// ===== 5. Program =====

Program
    = __ pack:PackageStatement imports:((__ ImportStatement)*) __ stmts:StatementList __ { return buildProgram(pack, imports, stmts); }
