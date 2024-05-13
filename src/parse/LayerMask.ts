import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): LayerMask {
    const size = ctx.takeUint32();
    if (size === 0) {
        return { data: new Uint8Array(0) };
    }
    console.warn("Layer mask is partially supported.");
    const data = ctx.takeUint8Array(size);
    return {
        data
    };
}

// TODO: parse layer mask
export type LayerMask = {
    data: Uint8Array;
};