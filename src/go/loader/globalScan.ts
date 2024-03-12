
function scan_global_declarations(program) {
    let refs = {};
    let refCount = {};
    for (let i = 0; i < program.body.length; i++) {
        let stmt = program.body[i];
        console.assert(stmt.tag === 'var' || stmt.tag === 'function');
        refs[stmt.name] = [];
        refCount[stmt.name] = 0;
    }
    for (let i = 0; i < program.body.length; i++) {
        let ref_stmt = program.body[i];
        if (ref_stmt.tag === 'var') {
            let scan_expression = (stmt) => {
                if (stmt.name != null) {
                    refs[stmt.name].push(ref_stmt.name);
                    refCount[ref_stmt.name]++;
                }
                if (stmt.tag === 'literal') {
                    return;
                }
                if (stmt.value != null) {
                    scan_expression(stmt.value);
                } else if (stmt.operand != null) {
                    scan_expression(stmt.operand);
                } else if (stmt.leftOperand != null) {
                    scan_expression(stmt.leftOperand);
                    scan_expression(stmt.rightOperand);
                }
                if (stmt.tag === 'call') {
                    stmt.args.forEach(scan_expression);
                }
            }
            scan_expression(ref_stmt.value);
        }
    }
    let declOrder = [];
    let dfs = (decl) => {
        refCount[decl] = -1;
        declOrder.push(decl);
        refs[decl].forEach((ref) => {
            refCount[ref]--;
            if (refCount[ref] === 0) {
                dfs(ref);
            }
        })
    }
    for (let decl in refCount) {
        if (refCount[decl] === 0) {
            dfs(decl);
        }
    }
    if (declOrder.length !== Object.keys(refs).length) {
        throw new Error('cyclic dependency in global declarations');
    }
    return declOrder;
}

export { scan_global_declarations };
