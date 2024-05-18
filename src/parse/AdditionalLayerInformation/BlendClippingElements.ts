import { AdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): BlendClippingElements {
    const blendClippingElements = ctx.takeUint8() !== 0;
    ctx.advance(3);
    return { key: AdjustmentLayerKey.BlendClippingElements, blendClippingElements };
}

export type BlendClippingElements = {
    key: AdjustmentLayerKey.BlendClippingElements;
    blendClippingElements: boolean;
};
