import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { _trie } from "$/tools/GenerateTrie/mod.ts";
import { Version } from "~/parse/FileHeader.ts";
import { parse as parseUnicodeString } from "~/parse/UnicodeString.ts";

export function parse(ctx: ParseContext, version: Version): AdditionalLayerInformation {
    void parseSigneture(ctx);
    const [key, rawKey] = parseKey(ctx);
    const dataSize = parseDataSize(ctx, rawKey, version);
    const data = (() => {
        switch (key) {
            case SuportedAdjustmentLayerKey.UnicodeLayerName:
                return parseUnicodeLayerName(ctx);
            case SuportedAdjustmentLayerKey.Unsupported:
                return parseUnsupportedData(ctx, dataSize);
        }
    })();
    return { ...data, rawKey };
}

function parseSigneture(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    const sig = SignetureTrie.determine(bin);
    if (sig === undefined) {
        throw new InvalidAdditionalLayerSigneture(ctx.byteOffset);
    }
    ctx.advance(bin.byteLength);
}

function parseKey(ctx: ParseContext): [SuportedAdjustmentLayerKey, Uint8Array] {
    const bin = ctx.takeUint8Array(4);
    const key = Trie.determineAdjustmentLayerKey(bin);
    if (key === undefined) {
        console.warn("Unsupported adjustment layer key was detected.");
    }
    return [key ?? SuportedAdjustmentLayerKey.Unsupported, bin];
}

function parseDataSize(ctx: ParseContext, rawKey: Uint8Array, version: Version): number {
    if (version === Version.PSB) {
        if (Trie.lengthDataCouldBeLarge(rawKey)) {
            return Number(ctx.takeUint64());
        }
    }
    return ctx.takeUint32();
}

function parseUnicodeLayerName(ctx: ParseContext): UnicodeLayerName {
    const name = parseUnicodeString(ctx);
    return { key: SuportedAdjustmentLayerKey.UnicodeLayerName, name };
}

function parseUnsupportedData(ctx: ParseContext, size: number): UnsupportedData {
    const data = ctx.takeUint8Array(size);
    return { key: SuportedAdjustmentLayerKey.Unsupported, data };
}

type AdjustmentLayerKeyMap = {
    [SuportedAdjustmentLayerKey.Unsupported]: UnsupportedData;
    [SuportedAdjustmentLayerKey.UnicodeLayerName]: UnicodeLayerName;
};

export type AdditionalLayerInformation = { rawKey: Uint8Array; } & AdjustmentLayerKeyMap[SuportedAdjustmentLayerKey];

export enum SuportedAdjustmentLayerKey {
    Unsupported,
    UnicodeLayerName,
}

export type UnsupportedData = {
    key: SuportedAdjustmentLayerKey.Unsupported;
    data: Uint8Array;
};

export type UnicodeLayerName = {
    key: SuportedAdjustmentLayerKey.UnicodeLayerName;
    name: string;
};

export class InvalidAdditionalLayerSigneture extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Additional layer signeture must be `8BIM` or `8B64`.";
    }
}

class SignetureTrie {
    @_trie({
        "8BIM": 0,
        "8B64": 1
    })
    static determine(_array: Uint8Array): number | undefined {
        throw new Error("not generated");
    }
}

class Trie {
    @_trie({
        'luni': SuportedAdjustmentLayerKey.UnicodeLayerName,
    })
    static determineAdjustmentLayerKey(_array: Uint8Array): SuportedAdjustmentLayerKey | undefined {
        throw new Error("not generated");
    }
    @_trie({
        'LMsk': true, 'Lr16': true, 'Lr32': true, 'Layr': true, 'Mt16': true, 'Mt32': true, 'Mtrn': true, 'Alph': true,
        'FMsk': true, 'lnk2': true, 'FEid': true, 'FXid': true, 'PxSD': true
    })
    static lengthDataCouldBeLarge(_array: Uint8Array): boolean | undefined {
        throw new Error("not generated.");
    }
}

