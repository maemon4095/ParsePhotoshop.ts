import ts from "npm:typescript";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import { transform, SourceGenerator } from "./tools/SourceGenerator/mod.ts";
import { TrieGenerator } from "./tools/GenerateTrie/mod.ts";

const generators: SourceGenerator[] = [
    TrieGenerator()
];

for await (const entry of fs.expandGlob("./src/**/*.src.ts")) {
    if (!entry.isFile) continue;

    const sourceCode = await Deno.readTextFile(entry.path);
    const sourceFile = ts.createSourceFile(entry.path, sourceCode, ts.ScriptTarget.ESNext);
    const generated = await transform(sourceFile, generators);
    if (generated === sourceFile) {
        continue;
    }
    const distPath = replaceExt(entry.path, ".gen.ts");
    await Deno.writeTextFile(distPath, generated.getFullText());
}


function replaceExt(p: string, ext: string) {
    const pattern = /^.*?(?<ext>(\.[^/\.]+)*)$/;
    const matches = p.match(pattern);
    const oldExtLen = matches?.groups?.ext?.length ?? 0;
    const withoutExt = p.substring(0, p.length - oldExtLen);
    return `${withoutExt}${ext}`;
}

