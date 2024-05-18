import { AdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): BlendInteriorElements {
    const blendInteriorElements = ctx.takeUint8() !== 0;
    ctx.advance(3);
    return { key: AdjustmentLayerKey.BlendInteriorElements, blendInteriorElements };
}

export type BlendInteriorElements = {
    key: AdjustmentLayerKey.BlendInteriorElements;
    blendInteriorElements: boolean;
};
