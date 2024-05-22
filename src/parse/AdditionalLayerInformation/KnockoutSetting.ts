import { AdjustmentLayerKey } from "./mod.ts";
import { ParseContext } from "../../util/parse/mod.ts";

export default function parse(ctx: ParseContext): KnockoutSetting {
    const knockout = ctx.takeUint8() !== 0;
    ctx.advance(3);
    return { key: AdjustmentLayerKey.KnockoutSetting, knockout };
}

export type KnockoutSetting = {
    key: AdjustmentLayerKey.KnockoutSetting;
    knockout: boolean;
};
