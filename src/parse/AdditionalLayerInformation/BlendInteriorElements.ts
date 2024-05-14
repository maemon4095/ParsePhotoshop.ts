import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): BlendInteriorElements {
    const blendInteriorElements = ctx.takeUint8() !== 0;
    ctx.advance(3);
    return { key: SuportedAdjustmentLayerKey.BlendInteriorElements, blendInteriorElements };
}

export type BlendInteriorElements = {
    key: SuportedAdjustmentLayerKey.BlendInteriorElements;
    blendInteriorElements: boolean;
};
