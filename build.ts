import ts from "npm:typescript";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import { transform, SourceGenerator } from "./tools/SourceGenerator/mod.ts";
import { TrieGenerator } from "./tools/GenerateTrie/mod.ts";

const distDir = "./dist";
await fs.ensureDir(distDir);

const generators: SourceGenerator[] = [
    TrieGenerator()
];

const sourceDir = "src";

for await (const entry of fs.walk(sourceDir)) {
    if (!entry.isFile) continue;

    const sourceCode = await Deno.readTextFile(entry.path);
    const sourceFile = ts.createSourceFile(entry.path, sourceCode, ts.ScriptTarget.ESNext);
    const generated = await transform(sourceFile, generators);
    const relativePath = path.relative(sourceDir, entry.path);
    const distPath = path.join(distDir, relativePath);
    await fs.ensureDir(path.dirname(distPath));
    await Deno.writeTextFile(distPath, generated.text);
}
