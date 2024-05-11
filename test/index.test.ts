import { parse } from "~/mod.ts";
const test_file = Deno.env.get("TEST_FILE")!;
const file = await Deno.readFile(test_file);
parse(file.buffer);
