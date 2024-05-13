import { ParseContext } from "~/util/parse/mod.ts";
// charset is not obvious
export default function parse(ctx: ParseContext) {
    const length = ctx.takeUint8();
    return ctx.takeUint8Array(length);
}