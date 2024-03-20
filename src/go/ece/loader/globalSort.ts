/**
 * Sorts the (variable and function) declarations in the global scope
 * so that the dependencies are satisfied. We only satisfy dependencies
 * for variable declarations. Functions recursively calling each other is
 * not treated as a dependency, unless they reference a global variable
 * and the reference is involved in a cycle of dependencies.
 * 
 * The preprocessor already computes the dependencies as the {@code captures}
 * field of each declaration in {@code program.body}. It then computes the
 * strongly connected components of the dependency graph. There is cyclic
 * dependency if and only if there is a strongly connected component with
 * more than one variable declaration. We then do a topological sort of the
 * strongly connected components. Within each strongly connected component,
 * we place the function declarations before the variable declarations.
 */
function sort_global_declarations(program: any): void {
    // Compute the edges and back edges of the dependency graph.
    let edges: { [key: string]: string[] } = {};
    let back_edges: { [key: string]: string[] } = {};

    for (let stmt of program.body) {
        edges[stmt.name] = [];
    }

    for (let stmt of program.body) {
        back_edges[stmt.name] = stmt.captures.map((ref: any) => ref.name);
        for (let ref of stmt.captures) {
            if (ref.name === stmt.name && stmt.tag === 'var') {
                throw new Error(`cyclic dependency in global declarations: ` +
                    `${stmt.name} refers to itself`);
            }
            edges[ref.name].push(stmt.name);
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
        type_lookup[stmt.name] = stmt.tag;
    }
    for (let component of scc) {
        let count_var = 0;
        let var_names = [];
        for (let node of component) {
            if (type_lookup[node] === 'var') {
                count_var++;
                var_names.push(node);
            }
        }
        if (count_var > 1) {
            throw new Error(`cyclic dependency in global declarations: ` +
                `${var_names[0]} refers to ${var_names[1]} and vice versa`);
        }
        let count_func = 0;
        for (let node of component) {
            if (type_lookup[node] === 'function') {
                count_func++;
            }
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
        const a_index = scc_index[a.name];
        const b_index = scc_index[b.name];
        if (a_index !== b_index) {
            return decl_order.indexOf(a_index) - decl_order.indexOf(b_index);
        }
        if (a.tag === 'function' && b.tag === 'var') {
            return -1;
        }
        if (a.tag === 'var' && b.tag === 'function') {
            return 1;
        }
        return 0;
    });
}

export { sort_global_declarations };
