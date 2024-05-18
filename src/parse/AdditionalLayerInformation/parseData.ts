import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeaderSection.ts";
import { AdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import parseUnicodeLayerName, { UnicodeLayerName } from "~/parse/AdditionalLayerInformation/UnicodeLayerName.ts";
import parseUnsupportedData, { UnsupportedData } from "~/parse/AdditionalLayerInformation/Unsupported.ts";
import parseLayerId, { LayerId } from "~/parse/AdditionalLayerInformation/LayerId.ts";
import parseBlendClippingElements, { BlendClippingElements } from "~/parse/AdditionalLayerInformation/BlendClippingElements.ts";
import parseBlendInteriorElements, { BlendInteriorElements } from "~/parse/AdditionalLayerInformation/BlendInteriorElements.ts";
import parseKnockoutSetting, { KnockoutSetting } from "~/parse/AdditionalLayerInformation/KnockoutSetting.ts";
import parseProtectedSetting, { ProtectedSetting } from "~/parse/AdditionalLayerInformation/ProtectedSetting.ts";
import parseSheetColorSetting, { SheetColorSetting } from "~/parse/AdditionalLayerInformation/SheetColorSetting.ts";
import parseSectionDividerSetting, { SectionDividerSetting } from "~/parse/AdditionalLayerInformation/SectionDividerSetting.ts";

export default function parse(ctx: ParseContext, dataSize: number, key: AdjustmentLayerKey, _version: Version): AdditionalLayerData {
    switch (key) {
        case AdjustmentLayerKey.Unknown:
            return parseUnsupportedData(ctx, dataSize);
        case AdjustmentLayerKey.UnicodeLayerName:
            return parseUnicodeLayerName(ctx);
        case AdjustmentLayerKey.LayerId:
            return parseLayerId(ctx);
        case AdjustmentLayerKey.BlendClippingElements:
            return parseBlendClippingElements(ctx);
        case AdjustmentLayerKey.BlendInteriorElements:
            return parseBlendInteriorElements(ctx);
        case AdjustmentLayerKey.KnockoutSetting:
            return parseKnockoutSetting(ctx);
        case AdjustmentLayerKey.ProtectedSetting:
            return parseProtectedSetting(ctx);
        case AdjustmentLayerKey.SheetColorSetting:
            return parseSheetColorSetting(ctx);
        case AdjustmentLayerKey.SectionDividerSetting:
            return parseSectionDividerSetting(ctx, dataSize);
    }
}

type AdjustmentLayerKeyMap = {
    [AdjustmentLayerKey.Unknown]: UnsupportedData;
    [AdjustmentLayerKey.UnicodeLayerName]: UnicodeLayerName;
    [AdjustmentLayerKey.LayerId]: LayerId;
    [AdjustmentLayerKey.BlendClippingElements]: BlendClippingElements;
    [AdjustmentLayerKey.BlendInteriorElements]: BlendInteriorElements;
    [AdjustmentLayerKey.KnockoutSetting]: KnockoutSetting;
    [AdjustmentLayerKey.ProtectedSetting]: ProtectedSetting;
    [AdjustmentLayerKey.SheetColorSetting]: SheetColorSetting;
    [AdjustmentLayerKey.SectionDividerSetting]: SectionDividerSetting;
};

export type AdditionalLayerData = AdjustmentLayerKeyMap[AdjustmentLayerKey];