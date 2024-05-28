import { serve } from "https://raw.githubusercontent.com/maemon4095/easyserve.ts/main/mod.ts";

await serve(import.meta.dirname + "/src/index.tsx", {
    denoConfigPath: import.meta.dirname + "/../../deno.json",
    sourcemap: true,
});