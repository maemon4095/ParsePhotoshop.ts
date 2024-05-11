export function generateFunction<T>(cases: readonly (readonly [readonly T[], unknown])[]) {
    const perLengthCases = new Map<number, [readonly T[], unknown][]>();

    for (const [sequence, proc] of cases) {
        let arr = perLengthCases.get(sequence.length);
        if (arr === undefined) {
            arr = [];
            perLengthCases.set(sequence.length, arr);
        }
        arr.push([sequence, proc]);
    }

    const trees = new Map<number, DecisionTree<T>>();
    for (const [len, cases] of perLengthCases) {
        trees.set(len, generateTree(cases));
    }

    const arrayName = "__array";
    const defaultCaseCode = "return undefined;";
    function genTrie(depth: number, tree: DecisionTree<T>): string {
        return generateSwitch(
            `${arrayName}[${depth}]`,
            Array.from(tree, ([c, sub]) => {
                if (sub instanceof DecisionTree) {
                    return [c, genTrie(depth + 1, sub)] as const;
                } else {
                    return [c, `return ${sub};`] as const;
                }
            }),
            defaultCaseCode
        );
    }

    const bodyCode = (() => {
        if (trees.size === 1) {
            // without length switch
            const { value } = trees.values().next();
            return genTrie(0, value);
        } else {
            return generateSwitch(
                `${arrayName}.length`,
                Array.from(trees, ([len, tree]) => {
                    return [len, genTrie(0, tree)] as const;
                }),
                defaultCaseCode
            );
        }
    })();

    return `(${arrayName}) => {${bodyCode}}`;
}

function generateTree<T>(cases: readonly (readonly [readonly T[], unknown])[]): DecisionTree<T> {
    const groups = new Map<T, [readonly T[], unknown][]>();
    for (const [sequence, proc] of cases) {
        if (sequence.length === 0) {
            throw new Error("invalid cases.");
        }
        const [head, ...rest] = sequence;
        const group = groups.get(head);
        if (group) {
            group.push([rest, proc]);
        } else {
            groups.set(head, [[rest, proc]]);
        }
    }

    const tree = new Map();
    for (const [char, group] of groups) {
        if (group.length === 1 && group[0][0].length === 0) { // leaf
            tree.set(char, group[0][1]);
        } else {
            tree.set(char, generateTree(group));
        }
    }
    return new DecisionTree(tree);
}

function generateSwitch<T>(char: string, cases: [T, string][], whenDefault?: string) {
    let code = `switch(${char}){`;
    for (const [c, p] of cases) {
        code += `case ${JSON.stringify(c)}:${p}`;
    }
    if (whenDefault !== undefined) {
        code += `default:${whenDefault}`;
    }
    code += "}";
    return code;
}

class DecisionTree<T> {
    #cases: Map<T, string | DecisionTree<T>>;
    constructor(cases: Map<T, string | DecisionTree<T>>) {
        this.#cases = cases;
    }

    get(char: T) {
        return this.#cases.get(char);
    }

    [Symbol.iterator]() {
        return this.#cases[Symbol.iterator]();
    }
}