import ts from "npm:typescript";
import { SourceGenerator } from "$/tools/SourceGenerator/mod.ts";
import { generateFunction } from "$/tools/GenerateTrie/generator.ts";
import { createMarkerDecorator } from "$/tools/SourceGenerator/util.ts";

export const _trie = createMarkerDecorator();

export function TrieGenerator(): SourceGenerator<ts.SyntaxKind.MethodDeclaration> {
    return {
        targetType: [ts.SyntaxKind.MethodDeclaration],
        targetAttribute: "_trie",
        generate(context) {
            const attr = context.attribute?.[0];
            if (attr?.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                throw new Error("Trie decorator must have object argument.");
            }
            const attrAsObj = attr as ts.ObjectLiteralExpression;
            const entries: [string, string][] = [];
            for (const prop of attrAsObj.properties) {
                if (prop.kind !== ts.SyntaxKind.PropertyAssignment) continue;
                const propname = prop.name as ts.StringLiteral;
                const name = propname.text;
                const value = prop.initializer.getText(context.sourceFile);
                entries.push([name, value]);
            }

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