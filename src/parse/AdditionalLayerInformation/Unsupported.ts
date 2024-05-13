import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext, size: number): UnsupportedData {
    const data = ctx.takeUint8Array(size);
    return { key: SuportedAdjustmentLayerKey.Unsupported, data };
}

export type UnsupportedData = {
    key: SuportedAdjustmentLayerKey.Unsupported;
    data: Uint8Array;
};
