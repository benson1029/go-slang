/**
 * Sorts the (variable and function) declarations in the global scope
 * so that the dependencies are satisfied. We only satisfy dependencies
 * for variable declarations. Functions recursively calling each other is
 * not treated as a dependency, except that these recursive calls can form
 * part of the dependency cycle. For example, in the following program:
 * 
 * ```go
 * package main
 * var x = f(1);
 * func f() int32 { return g(); }
 * func g() int32 { return f() + x; }
 * ```
 * 
 * The variable `x` depends on `f`, and `f` depends on `g`. However, `g`
 * also depends on `x`. This forms a cyclic dependency from `x` to itself.
 * Note that the cycle between `f` and `g` is not treated as a cyclic
 * dependency.
 * 
 * We assume the preprocessor has already computed the dependencies as
 * the `captures` field of each declaration in `program.body`.
 * 
 * We then compute the strongly connected components of the dependency
 * graph. There is cyclic dependency if and only if there is a strongly
 * connected component with more than one variable declaration, or with
 * one variable declaration together with a function declaration. We then
 * do a topological sort of the strongly connected components. Within each
 * strongly connected component, we place the function declarations before
 * the variable declarations.
 * 
 * For struct declarations and struct methods, we place all struct declarations
 * at the beginning and treat struct methods as if they are function declarations.
 * 
 * @param ignore_structs If true, we ignore struct methods during the sorting. They
 * will be placed at the end of the program. This is to accomodate the two-stage
 * preprocessing and sorting algorithm.
 */
function sort_global_declarations(program: any, imports: any[], ignore_structs: boolean): void {
    // Utility functions
    const get_name = (stmt: any) => {
        if (stmt.tag === "struct") {
            return stmt.name.name;
        } else if (stmt.tag === "struct-method") {
            return "METHOD." + stmt.struct.name + "." + stmt.name;
        } else {
            return stmt.name;
        }
    };

    // Compute the edges and back edges of the dependency graph.
    let edges: { [key: string]: string[] } = {};
    let back_edges: { [key: string]: string[] } = {};

    for (let stmt of program.body) {
        if (stmt.tag === "struct" && ignore_structs) continue;
        if (stmt.tag === "struct-method" && ignore_structs) continue;
        edges[get_name(stmt)] = [];
        back_edges[get_name(stmt)] = [];
    }

    for (let stmt of program.body) {
        if (stmt.tag === "struct" && ignore_structs) continue;
        if (stmt.tag === "struct-method" && ignore_structs) continue;
        if (stmt.tag === "struct") {
            for (let ref of stmt.fields) {
                let dfs = (type: any) => {
                    if (type.tag === "struct-decl-type") {
                        if (imports.filter((imp) => imp.type === "struct" && imp.value.name === type.name).length > 0) {
                            return;
                        }
                        back_edges[get_name(stmt)].push(type.name);
                        edges[type.name].push(get_name(stmt));
                    } else if (type.tag === "array-type") {
                        dfs(type.type);
                    }
                }
                dfs(ref.type);
            }
            continue;
        }
        for (let ref of stmt.captures) {
            if (imports.filter((imp) => imp.name === ref.name).length > 0) {
                continue;
            }
            if (ref.name === get_name(stmt) && stmt.tag === 'var') {
                throw new Error(`cyclic dependency in global declarations: ` +
                    `${get_name(stmt)} refers to itself`);
            }
            back_edges[get_name(stmt)].push(ref.name);
            edges[ref.name].push(get_name(stmt));
        }
    }

    // Runs Kosaraju's algorithm to compute the strongly connected components.
    let visited: { [key: string]: boolean } = {};
    let post_order: string[] = [];

    let scc_first_dfs = (node: string) => {
        visited[node] = true;
        for (let neighbor of edges[node]) {
            if (!visited[neighbor]) {
                scc_first_dfs(neighbor);
            }
        }
        post_order.push(node);
    }

    for (let node in edges) {
        if (!visited[node]) {
            scc_first_dfs(node);
        }
    }

    let scc: string[][] = [];
    let scc_index: { [key: string]: number } = {};

    let scc_second_dfs = (node: string, index: number) => {
        visited[node] = true;
        scc_index[node] = index;
        if (scc[index] == null) {
            scc[index] = [];
        }
        scc[index].push(node);
        for (let neighbor of back_edges[node]) {
            if (!visited[neighbor]) {
                scc_second_dfs(neighbor, index);
            }
        }
    }

    visited = {};
    for (let i = post_order.length - 1; i >= 0; i--) {
        let node = post_order[i];
        if (!visited[node]) {
            scc_second_dfs(node, scc.length);
        }
    }

    // Check for cyclic dependencies.
    let type_lookup : { [key: string]: string } = {};
    for (let stmt of program.body) {
        if (stmt.tag === "struct" && ignore_structs) continue;
        if (stmt.tag === "struct-method" && ignore_structs) continue;
        type_lookup[get_name(stmt)] = stmt.tag;
    }
    for (let component of scc) {
        let count_var = 0;
        let count_func = 0;
        let count_struct = 0;
        let var_names = [];
        for (let node of component) {
            if (type_lookup[node] === 'struct') {
                count_struct++;
                var_names.push(node);
            } else if (type_lookup[node] === 'var') {
                count_var++;
                var_names.push(node);
            } else {
                count_func++;
            }
        }
        if (count_struct > 1) {
            throw new Error(`cyclic dependency in global declarations: ` +
                `struct declaration ${var_names[0]} refers to itself`);
        }
        if (count_var > 1) {
            throw new Error(`cyclic dependency in global declarations: ` +
                `${var_names[0]} refers to ${var_names[1]} and vice versa`);
        }
        if (count_var === 1 && count_func > 0) {
            throw new Error(`cyclic dependency in global declarations: ` +
                `${var_names[0]} refers to itself`);
        }
    }

    // Build a dependency graph of the strongly connected components.
    let scc_edges: { [key: number]: number[] } = {};
    let ref_count: { [key: number]: number } = {};

    for (let i = 0; i < scc.length; i++) {
        scc_edges[i] = [];
        ref_count[i] = 0;
    }

    for (let node in edges) {
        for (let neighbor of edges[node]) {
            if (scc_index[node] !== scc_index[neighbor]) {
                scc_edges[scc_index[node]].push(scc_index[neighbor]);
                ref_count[scc_index[neighbor]]++;
            }
        }
    }

    // Topologically sort the strongly connected components.
    let decl_order: number[] = [];

    let topo_dfs = (index: number) => {
        ref_count[index] = -1;
        decl_order.push(index);
        for (let neighbor of scc_edges[index]) {
            ref_count[neighbor]--;
            if (ref_count[neighbor] === 0) {
                topo_dfs(neighbor);
            }
        }
    }

    for (let i = 0; i < scc.length; i++) {
        if (ref_count[i] === 0) {
            topo_dfs(i);
        }
    }

    // Sort the declarations in the program.
    program.body.sort((a: any, b: any) => {
        if (a.tag === "struct" && b.tag === "struct") {
            if (ignore_structs) return 0;
            return decl_order.indexOf(scc_index[get_name(a)]) - decl_order.indexOf(scc_index[get_name(b)]);
        }
        if (a.tag === "struct") return -1;
        if (b.tag === "struct") return 1;
        if (a.tag === "struct-method" && b.tag === "struct-method" && ignore_structs) return 0;
        if (a.tag === "struct-method" && ignore_structs) return 1;
        if (b.tag === "struct-method" && ignore_structs) return -1;
        const a_index = scc_index[get_name(a)];
        const b_index = scc_index[get_name(b)];
        if (a_index !== b_index) {
            return decl_order.indexOf(a_index) - decl_order.indexOf(b_index);
        }
        if (a.tag !== 'var' && b.tag === 'var') {
            return -1;
        }
        if (a.tag === 'var' && b.tag !== 'var') {
            return 1;
        }
        return 0;
    });

    // Remove the METHOD. captures.
    for (let stmt of program.body) {
        if (stmt.tag === "struct") continue;
        stmt.captures = stmt.captures.filter((ref: any) => {
            return !ref.name.startsWith("METHOD.");
        });
    }
}

export { sort_global_declarations };
