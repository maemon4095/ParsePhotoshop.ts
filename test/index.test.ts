import { parse } from "~/mod.ts";

const file = await Deno.readFile(Deno.args[0]);
parse(file.buffer);
