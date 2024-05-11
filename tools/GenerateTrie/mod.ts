import ts from "npm:typescript";
import { SourceGenerator } from "$/tools/SourceGenerator/mod.ts";
import { generateFunction } from "$/tools/GenerateTrie/generator.ts";

export function TrieGenerator(): SourceGenerator<ts.SyntaxKind.MethodDeclaration> {
    return {
        targetType: [ts.SyntaxKind.MethodDeclaration],
        targetAttribute: "trie",
        generate(context) {
            const attr = context.getAttributeText();
            const obj: unknown = attr !== null ? JSON.parse(attr) : null;
            if (typeof obj !== "object") {
                throw new Error("Trie decorator must have object argument.");
            }

            const entries = Object.entries(obj!);
            const map = entries.map(([key, value]) => {
                const seq = Array.from(key, c => c.codePointAt(0)!);
                return [seq, value] as const;
            });

            const target = context.target;
            const paramText = target.parameters[0].name.getText(context.sourceFile);

            // collect modifiers other than decorator
            const modifiers: ts.Modifier[] = [];
            for (const mod of target.modifiers ?? []) {
                if (mod.kind !== ts.SyntaxKind.Decorator) {
                    modifiers.push(mod);
                }
            }

            const sig = ts.factory.createMethodSignature(modifiers, target.name, undefined, undefined, target.parameters, target.type);
            let sigText = context.printer.printNode(ts.EmitHint.Unspecified, sig, context.sourceFile);
            sigText = sigText.replace(/;$/, ""); // remove trailing semicollon

            const fn = generateFunction(map);

            return `${sigText} { return (${fn})(${paramText}); }`;
        }
    };
}