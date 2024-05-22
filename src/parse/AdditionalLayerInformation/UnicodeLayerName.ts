import parseUnicodeString from "../UnicodeString.ts";
import { AdjustmentLayerKey } from "./mod.ts";
import { ParseContext } from "../../util/parse/mod.ts";

export default function parse(ctx: ParseContext): UnicodeLayerName {
    const name = parseUnicodeString(ctx);
    return { key: AdjustmentLayerKey.UnicodeLayerName, name };
}

export type UnicodeLayerName = {
    key: AdjustmentLayerKey.UnicodeLayerName;
    name: string;
};
