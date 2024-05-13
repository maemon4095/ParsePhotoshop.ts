import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { Version } from "~/parse/FileHeader.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { ColorDepth } from "~/parse/FileHeader.ts";

export function parse(ctx: ParseContext, depth: ColorDepth, version: Version, layerRecords: LayerRecords): ChannelImage {
    const channelImageDataCompression = parseChannelImageDataCompression(ctx);
    parseImageData(ctx, channelImageDataCompression, depth, version, layerRecords);
    throw new Error("TODO");
}

function parseChannelImageDataCompression(ctx: ParseContext): ChannelImageDataCompression {
    const compression = ctx.peekUint16();
    if (compression >= 4) {
        throw new InvalidChannelImageDataCompressionError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return compression;
}

function parseImageData(ctx: ParseContext, compression: ChannelImageDataCompression, depth: ColorDepth, version: Version, layerRecords: LayerRecords) {
    switch (compression) {
        case ChannelImageDataCompression.RawData: {
            const rect = layerRecords.enclosingRectangle;
            const imageSize = (rect.bottom - rect.top) * (rect.right - rect.left);
            console.log(imageSize);
            const dataLength = (() => {
                if (depth === 1) {
                    return Math.ceil(imageSize / 8);
                }
                return imageSize * Math.floor(depth / 8);
            })();
            const data = ctx.takeUint8Array(dataLength);

            break;
        }
        case ChannelImageDataCompression.RLE: {
            console.log("RLE");
            break;
        }
        case ChannelImageDataCompression.ZIP:
        case ChannelImageDataCompression.ZIP_Prediction:
    }
}

export type ChannelImage = {};

export enum ChannelImageDataCompression {
    RawData = 0,
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