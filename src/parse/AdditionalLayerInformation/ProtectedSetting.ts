import { AdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): ProtectedSetting {
    const flags = ctx.takeUint32();
    const transparencyProtected = (flags & (1 << 0)) === 1 << 0;
    const compositeProtected = (flags & (1 << 1)) === 1 << 1;
    const positionProtected = (flags & (1 << 2)) === 1 << 2;
    return { key: AdjustmentLayerKey.ProtectedSetting, transparencyProtected, compositeProtected, positionProtected };
}

export type ProtectedSetting = {
    key: AdjustmentLayerKey.ProtectedSetting;
    transparencyProtected: boolean;
    compositeProtected: boolean;
    positionProtected: boolean;
};
