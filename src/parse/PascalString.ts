import { ParseContext } from "~/util/parse/mod.ts";
export function parse(ctx: ParseContext) {
    const length = ctx.takeUint8();
    const buf = ctx.takeUint8Array(length);
    const decoder = new TextDecoder("utf-16be");
    const text = decoder.decode(buf);
    return text;
}