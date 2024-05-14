import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeaderSection.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import parseUnicodeLayerName, { UnicodeLayerName } from "~/parse/AdditionalLayerInformation/UnicodeLayerName.ts";
import parseUnsupportedData, { UnsupportedData } from "~/parse/AdditionalLayerInformation/Unsupported.ts";
import parseLayerId, { LayerId } from "~/parse/AdditionalLayerInformation/LayerId.ts";
import parseBlendClippingElements, { BlendClippingElements } from "~/parse/AdditionalLayerInformation/BlendClippingElements.ts";

export default function parse(ctx: ParseContext, dataSize: number, key: SuportedAdjustmentLayerKey, _version: Version) {
    switch (key) {
        case SuportedAdjustmentLayerKey.UnicodeLayerName:
            return parseUnicodeLayerName(ctx);
        case SuportedAdjustmentLayerKey.Unsupported:
            return parseUnsupportedData(ctx, dataSize);
        case SuportedAdjustmentLayerKey.LayerId:
            return parseLayerId(ctx);
        case SuportedAdjustmentLayerKey.BlendClippingElements:
            return parseBlendClippingElements(ctx);
    }
}

type AdjustmentLayerKeyMap = {
    [SuportedAdjustmentLayerKey.Unsupported]: UnsupportedData;
    [SuportedAdjustmentLayerKey.UnicodeLayerName]: UnicodeLayerName;
    [SuportedAdjustmentLayerKey.LayerId]: LayerId;
    [SuportedAdjustmentLayerKey.BlendClippingElements]: BlendClippingElements;
};

export type AdditionalLayerData = AdjustmentLayerKeyMap[SuportedAdjustmentLayerKey];