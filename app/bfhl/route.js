import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const data = body.data || [];

    if (!Array.isArray(data)) {
        return NextResponse.json({ 
            is_success: false, 
            message: "Invalid input format. 'data' must be an array." 
        }, { status: 400 });
    }

    const invalid_entries = [];
    const valid_format_edges = [];
    const seen_edges = new Set();
    const duplicates_set = new Set();
    const duplicate_edges = [];

    data.forEach(original => {
        const str = typeof original === 'string' ? original.trim() : "";
        
        if (typeof original !== 'string' || !/^[A-Z]->[A-Z]$/.test(str) || str[0] === str[3]) {
            invalid_entries.push(original);
        } else {
            if (seen_edges.has(str)) {
                 if (!duplicates_set.has(str)) {
                     duplicates_set.add(str);
                     duplicate_edges.push(str);
                 }
            } else {
                 seen_edges.add(str);
                 valid_format_edges.push(str);
            }
        }
    });

    const allNodes = new Set();
    const adj = {};
    const parentMap = {};
    const dsu = new Map();

    const find = (i) => {
        if (!dsu.has(i)) dsu.set(i, i);
        if (dsu.get(i) === i) return i;
        dsu.set(i, find(dsu.get(i)));
        return dsu.get(i);
    };

    const union = (i, j) => {
        let rootI = find(i);
        let rootJ = find(j);
        if (rootI !== rootJ) dsu.set(rootI, rootJ);
    };

    valid_format_edges.forEach(edge => {
        const u = edge[0];
        const v = edge[3];
        allNodes.add(u);
        allNodes.add(v);
        
        if (!adj[u]) adj[u] = [];
        if (!adj[v]) adj[v] = [];
        
        if (parentMap[v] === undefined) {
            parentMap[v] = u;
            adj[u].push(v);
            union(u, v);
        }
    });

    const groups = new Map();
    allNodes.forEach(node => {
        const root = find(node);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(node);
    });

    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = undefined;
    let max_depth = 0;

    const buildTreeCore = (node) => {
        const treeObj = {};
        const children = adj[node] || [];
        children.sort(); // Lexicographical sort of children
        for (const child of children) {
            treeObj[child] = buildTreeCore(child);
        }
        return treeObj;
    };

    const getDepth = (node) => {
        const children = adj[node] || [];
        if (children.length === 0) return 1;
        let p_max = 0;
        for (const child of children) {
            p_max = Math.max(p_max, getDepth(child));
        }
        return 1 + p_max;
    };

    const sortedGroups = Array.from(groups.values());
    
    sortedGroups.forEach((nodesInGroup) => {
        const roots = nodesInGroup.filter(n => parentMap[n] === undefined);
        
        if (roots.length === 0) {
            nodesInGroup.sort();
            const root = nodesInGroup[0];
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            // Tree
            const root = roots[0]; // Guaranteed to be 1 root per logic
            const depth = getDepth(root);
            hierarchies.push({
                root: root,
                tree: { [root]: buildTreeCore(root) },
                depth: depth
            });
            total_trees++;

            // Track largest tree
            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth) {
                if (!largest_tree_root || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }
    });

    const responsePayload = {
      is_success: true,
      user_id: "adityakumarverma_19052004",
      email_id: "av1753@srmist.edu.in",
      college_roll_number: "RA2311056030152",
      hierarchies: hierarchies,
      invalid_entries: invalid_entries,
      duplicate_edges: duplicate_edges,
      summary: {
        total_trees: total_trees,
        total_cycles: total_cycles,
        largest_tree_root: largest_tree_root || ""
      }
    };

    return NextResponse.json(responsePayload, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ 
        is_success: false, 
        message: "Internal Server Error" 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
