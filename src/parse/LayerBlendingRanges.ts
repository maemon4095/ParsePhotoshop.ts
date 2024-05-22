import { ParseContext } from "../util/parse/mod.ts";

export default function parse(ctx: ParseContext): LayerBlendingRanges {
    const length = ctx.takeUint32();
    const data = ctx.takeUint8Array(length);
    return { data };
}

// TODO: support layer blending ranges
export type LayerBlendingRanges = {
    data: Uint8Array;
};

