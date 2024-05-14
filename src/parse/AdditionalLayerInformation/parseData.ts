import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeaderSection.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import parseUnicodeLayerName, { UnicodeLayerName } from "~/parse/AdditionalLayerInformation/UnicodeLayerName.ts";
import parseUnsupportedData, { UnsupportedData } from "~/parse/AdditionalLayerInformation/Unsupported.ts";
import parseLayerId, { LayerId } from "~/parse/AdditionalLayerInformation/LayerId.ts";
import parseBlendClippingElements, { BlendClippingElements } from "~/parse/AdditionalLayerInformation/BlendClippingElements.ts";
import parseBlendInteriorElements, { BlendInteriorElements } from "~/parse/AdditionalLayerInformation/BlendInteriorElements.ts";
import parseKnockoutSetting, { KnockoutSetting } from "~/parse/AdditionalLayerInformation/KnockoutSetting.ts";
import parseProtectedSetting, { ProtectedSetting } from "~/parse/AdditionalLayerInformation/ProtectedSetting.ts";
import parseSheetColorSetting, { SheetColorSetting } from "~/parse/AdditionalLayerInformation/SheetColorSetting.ts";
import parseSectionDividerSetting, { SectionDividerSetting } from "~/parse/AdditionalLayerInformation/SectionDividerSetting.ts";

export default function parse(ctx: ParseContext, dataSize: number, key: SuportedAdjustmentLayerKey, _version: Version): AdditionalLayerData {
    switch (key) {
        case SuportedAdjustmentLayerKey.Unsupported:
            return parseUnsupportedData(ctx, dataSize);
        case SuportedAdjustmentLayerKey.UnicodeLayerName:
            return parseUnicodeLayerName(ctx);
        case SuportedAdjustmentLayerKey.LayerId:
            return parseLayerId(ctx);
        case SuportedAdjustmentLayerKey.BlendClippingElements:
            return parseBlendClippingElements(ctx);
        case SuportedAdjustmentLayerKey.BlendInteriorElements:
            return parseBlendInteriorElements(ctx);
        case SuportedAdjustmentLayerKey.KnockoutSetting:
            return parseKnockoutSetting(ctx);
        case SuportedAdjustmentLayerKey.ProtectedSetting:
            return parseProtectedSetting(ctx);
        case SuportedAdjustmentLayerKey.SheetColorSetting:
            return parseSheetColorSetting(ctx);
        case SuportedAdjustmentLayerKey.SectionDividerSetting:
            return parseSectionDividerSetting(ctx, dataSize);
    }
}

type AdjustmentLayerKeyMap = {
    [SuportedAdjustmentLayerKey.Unsupported]: UnsupportedData;
    [SuportedAdjustmentLayerKey.UnicodeLayerName]: UnicodeLayerName;
    [SuportedAdjustmentLayerKey.LayerId]: LayerId;
    [SuportedAdjustmentLayerKey.BlendClippingElements]: BlendClippingElements;
    [SuportedAdjustmentLayerKey.BlendInteriorElements]: BlendInteriorElements;
    [SuportedAdjustmentLayerKey.KnockoutSetting]: KnockoutSetting;
    [SuportedAdjustmentLayerKey.ProtectedSetting]: ProtectedSetting;
    [SuportedAdjustmentLayerKey.SheetColorSetting]: SheetColorSetting;
    [SuportedAdjustmentLayerKey.SectionDividerSetting]: SectionDividerSetting;
};

export type AdditionalLayerData = AdjustmentLayerKeyMap[SuportedAdjustmentLayerKey];