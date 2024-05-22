import { ParseContext } from "../../util/parse/mod.ts";
import { Version } from "../FileHeaderSection.ts";
import { AdjustmentLayerKey } from "./mod.ts";
import parseUnicodeLayerName, { UnicodeLayerName } from "./UnicodeLayerName.ts";
import parseUnsupportedData, { UnsupportedData } from "./Unsupported.ts";
import parseLayerId, { LayerId } from "./LayerId.ts";
import parseBlendClippingElements, { BlendClippingElements } from "./BlendClippingElements.ts";
import parseBlendInteriorElements, { BlendInteriorElements } from "./BlendInteriorElements.ts";
import parseKnockoutSetting, { KnockoutSetting } from "./KnockoutSetting.ts";
import parseProtectedSetting, { ProtectedSetting } from "./ProtectedSetting.ts";
import parseSheetColorSetting, { SheetColorSetting } from "./SheetColorSetting.ts";
import parseSectionDividerSetting, { SectionDividerSetting } from "./SectionDividerSetting.ts";

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