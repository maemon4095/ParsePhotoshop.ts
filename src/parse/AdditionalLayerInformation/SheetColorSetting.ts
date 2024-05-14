import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): SheetColorSetting {
    const color = ctx.takeUint32();
    ctx.advance(4);
    return { key: SuportedAdjustmentLayerKey.SheetColorSetting, color };
}

export type SheetColorSetting = {
    key: SuportedAdjustmentLayerKey.SheetColorSetting;
    color: number;
};