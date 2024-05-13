import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeader.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { ColorDepth } from "~/parse/FileHeader.ts";

export function parse(ctx: ParseContext, depth: ColorDepth, version: Version, layerRecords: LayerRecords): ChannelImage {
    const compression = parseChannelImageCompression(ctx);
    switch (compression) {
        case ChannelImageCompression.Raw: return parseImageRaw(ctx, depth, layerRecords);
        case ChannelImageCompression.RLE: return parseImageRLE(ctx, version, layerRecords);
        case ChannelImageCompression.ZIP:
        case ChannelImageCompression.ZIP_Prediction:
            throw new Error("TODO");
    }
}

function parseChannelImageCompression(ctx: ParseContext): ChannelImageCompression {
    const compression = ctx.peekUint16();
    if (compression >= 4) {
        throw new InvalidChannelImageDataCompressionError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return compression;
}

function parseImageRaw(ctx: ParseContext, depth: ColorDepth, layerRecords: LayerRecords): ChannelImageRaw {
    const rect = layerRecords.enclosingRectangle;
    const imageSize = (rect.bottom - rect.top) * (rect.right - rect.left);
    const dataLength = (() => {
        if (depth === 1) {
            return Math.ceil(imageSize / 8);
        }
        return imageSize * Math.floor(depth / 8);
    })();
    const data = ctx.takeUint8Array(dataLength);
    return { compression: ChannelImageCompression.Raw, data };
}
function parseImageRLE(ctx: ParseContext, version: Version, layerRecords: LayerRecords): ChannelImageRLE {
    const imageRect = layerRecords.enclosingRectangle;
    const scanLineCount = imageRect.bottom - imageRect.top;
    const lineSizes = new Array<number>(scanLineCount);
    const scanLines = new Array(scanLineCount);
    const readScanLineSize = (() => {
        switch (version) {
            case Version.PSD:
                return (ctx: ParseContext) => ctx.takeUint16();
            case Version.PSB:
                return (ctx: ParseContext) => ctx.takeUint32();
        }
    })();
    for (let i = 0; i < lineSizes.length; ++i) {
        lineSizes[i] = readScanLineSize(ctx);
    }
    for (let i = 0; i < scanLines.length; ++i) {
        const scanLineSize = lineSizes[i];
        const scanline = ctx.takeUint8Array(scanLineSize);
        scanLines[i] = scanline;
    }

    return { compression: ChannelImageCompression.RLE, scanLines };
}

type ChannelImageMap = {
    [ChannelImageCompression.RLE]: ChannelImageRLE;
    [ChannelImageCompression.Raw]: ChannelImageRaw;
    [ChannelImageCompression.ZIP]: never;
    [ChannelImageCompression.ZIP_Prediction]: never;
};

export type ChannelImageRaw = {
    compression: ChannelImageCompression.Raw;
    data: Uint8Array;
};

export type ChannelImageRLE = {
    compression: ChannelImageCompression.RLE;
    scanLines: Uint8Array[];
};

export type ChannelImage = ChannelImageMap[ChannelImageCompression];

export enum ChannelImageCompression {
    Raw = 0,
    RLE = 1,
    ZIP = 2,
    ZIP_Prediction = 3
}

export class InvalidChannelImageDataCompressionError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Channel image data compression must be 0 = raw data, 1 = RLE, 2 = ZIP, 3 = ZIP with prediction.";
    }
}


