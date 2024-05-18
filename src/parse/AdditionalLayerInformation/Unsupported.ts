import { AdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext, size: number): UnsupportedData {
    const data = ctx.takeUint8Array(size);
    return { key: AdjustmentLayerKey.Unknown, data };
}

export type UnsupportedData = {
    key: AdjustmentLayerKey.Unknown;
    data: Uint8Array;
};
