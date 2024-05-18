import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { _trie } from "$/tools/GenerateTrie/mod.ts";
import { Version } from "~/parse/FileHeaderSection.ts";
import parseData, { AdditionalLayerData } from "./parseData.ts";
import { Determine } from "~/parse/AdditionalLayerInformation/helper.gen.ts";


export default function parse(ctx: ParseContext, version: Version): AdditionalLayerInformation {
    void parseSigneture(ctx);
    const [key, rawKey] = parseKey(ctx);
    console.log("additional info", String.fromCodePoint(...rawKey));
    const dataSize = parseDataSize(ctx, rawKey, version);
    console.log("additional info size", dataSize);
    const start = ctx.byteOffset;
    const data = parseData(ctx, dataSize, key, version);
    console.log("additional info: ", data);
    const consumed = ctx.byteOffset - start;
    ctx.advance(dataSize - consumed);
    return { ...data, rawKey };
}

function parseSigneture(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    if (Determine.signeture(bin) === undefined) {
        console.error("Invalid additional layer information signeture:", bin);
        throw new InvalidAdditionalLayerSigneture(ctx.byteOffset);
    }
    ctx.advance(bin.byteLength);
}

function parseKey(ctx: ParseContext): [AdjustmentLayerKey, Uint8Array] {
    const bin = ctx.takeUint8Array(4);
    const key = Determine.adjustmentLayerKey(bin);
    if (key === undefined) {
        console.warn("Unknown adjustment layer key was detected.", String.fromCodePoint(...bin));
    }
    return [key ?? AdjustmentLayerKey.Unknown, bin];
}

function parseDataSize(ctx: ParseContext, rawKey: Uint8Array, version: Version): number {
    if (version === Version.PSB) {
        if (Determine.lengthDataCouldBeLarge(rawKey)) {
            return Number(ctx.takeUint64());
        }
    }
    return ctx.takeUint32();
}

export type AdditionalLayerInformation = { rawKey: Uint8Array; } & AdditionalLayerData;

export enum AdjustmentLayerKey {
    Unknown,
    UnicodeLayerName,
    LayerId,
    BlendClippingElements,
    BlendInteriorElements,
    KnockoutSetting,
    ProtectedSetting,
    SheetColorSetting,
    SectionDividerSetting,
}

export class InvalidAdditionalLayerSigneture extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Additional layer signeture must be `8BIM` or `8B64`.";
    }
}