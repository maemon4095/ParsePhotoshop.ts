import { bundle } from "https://deno.land/x/emit@0.38.2/mod.ts";
import denoConfig from "./deno.json" with { type: "json"};
const result = await bundle(
    "./src/index.ts", {
    importMap: denoConfig.imports,
    minify: true,
    compilerOptions: denoConfig.compilerOptions
});

const { code } = result;
console.log(code);