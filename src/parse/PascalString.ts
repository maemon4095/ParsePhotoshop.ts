import { ParseContext } from "~/util/parse/mod.ts";
export function parse(ctx: ParseContext) {
    const length = ctx.takeUint8();
    return ctx.takeUint8Array(length);
}