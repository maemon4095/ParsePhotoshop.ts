import ts from "npm:typescript";
import * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";
import { transform, SourceGenerator } from "https://raw.githubusercontent.com/maemon4095/SourceGenerator.ts/main/mod.ts";
import { TrieGenerator } from "./tools/GenerateTrie/mod.ts";

const mode = Deno.args[0];

const generators: SourceGenerator[] = [
    TrieGenerator()
];

const generatedFileHeader = `/*
    this file is generated by source generator.
                DO NOT EDIT.
*/\n`;

const srcDir = "./src";

for await (const entry of fs.expandGlob(`${srcDir}/**/*.gen.ts`)) {
    if (!entry.isFile) continue;
    await Deno.remove(entry.path);
}

switch (mode) {
    case "build": {
        await generateAll((async function* () {
            for await (const e of fs.walk(srcDir)) {
                yield e.path;
            }
        })());
        break;
    }
    case "watch": {
        await generateAll((async function* () {
            for await (const e of fs.walk(srcDir)) {
                yield e.path;
            }

            for await (const e of Deno.watchFs("./src")) {
                yield* e.paths;
            }
        })());
    }
}

async function generateAll(paths: AsyncIterable<string>) {
    const pattern = /^.*\.src\.ts$/;
    for await (const path of paths) {
        if (!path.match(pattern)) {
            continue;
        }
        await generate(path);
    }
}

async function generate(path: string) {
    const sourceCode = await Deno.readTextFile(path);
    const sourceFile = ts.createSourceFile(path, sourceCode, ts.ScriptTarget.ESNext);
    const generated = await transform(sourceFile, generators);
    if (generated === sourceFile) {
        return;
    }
    const distPath = replaceExt(path, ".gen.ts");
    const content = generatedFileHeader + generated.getFullText();
    console.log("Generated:", distPath);
    await Deno.writeTextFile(distPath, content);
}

function replaceExt(p: string, ext: string) {
    const pattern = /^.*?(?<ext>(\.[^/\\\.]+)*)$/;
    const matches = p.match(pattern);
    const oldExtLen = matches?.groups?.ext?.length ?? 0;
    const withoutExt = p.substring(0, p.length - oldExtLen);
    return `${withoutExt}${ext}`;
}

