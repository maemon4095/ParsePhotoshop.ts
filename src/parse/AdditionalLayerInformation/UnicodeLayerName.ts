import parseUnicodeString from "~/parse/UnicodeString.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): UnicodeLayerName {
    const name = parseUnicodeString(ctx);
    return { key: SuportedAdjustmentLayerKey.UnicodeLayerName, name };
}

export type UnicodeLayerName = {
    key: SuportedAdjustmentLayerKey.UnicodeLayerName;
    name: string;
};
