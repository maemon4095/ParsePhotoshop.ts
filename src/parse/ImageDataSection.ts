import { ParseContext } from "~/util/parse/mod.ts";
import parseImageDataCompression, { ImageDataCompression } from "~/parse/ImageCompression.ts";
import { FileHeaderSection } from "~/parse/FileHeaderSection.ts";
export default function parse(ctx: ParseContext, fileHeader: FileHeaderSection) {
    const compression = parseImageDataCompression(ctx);
    switch (compression) {
        case ImageDataCompression.Raw:
            return parseImageDataRaw(ctx, fileHeader.channelCount);
        case ImageDataCompression.RLE:
            return parseImageDataRLE(ctx, fileHeader.channelCount, fileHeader.height);
        case ImageDataCompression.ZIP:
        case ImageDataCompression.ZIP_Prediction:
            throw new Error("TODO");
    }
}

function parseImageDataRaw(ctx: ParseContext, channelCount: number): ImageDataRaw {
    const bytesLeft = ctx.bytesLeft;
    const perChannelDataLength = bytesLeft / channelCount;
    const perChannelData = new Array(channelCount);
    for (let i = 0; i < perChannelData.length; ++i) {
        const data = ctx.takeUint8Array(perChannelDataLength);
        perChannelData[i] = data;
    }
    return { compression: ImageDataCompression.Raw, perChannelData };
}

function parseImageDataRLE(ctx: ParseContext, channelCount: number, height: number): ImageDataRLE {
    const perChannelScanLines = new Array(channelCount);
    for (let i = 0; i < perChannelScanLines.length; ++i) {
        const scanLines = new Array(height);
        perChannelScanLines[i] = scanLines;
        for (let j = 0; j < scanLines.length; ++j) {
            scanLines[j] = new Uint8Array(ctx.takeUint16());
        }
    }
    for (let i = 0; i < perChannelScanLines.length; ++i) {
        const scanLines = perChannelScanLines[i];
        for (let j = 0; j < scanLines.length; ++j) {
            ctx.takeUint8Into(scanLines[j]);
        }
    }


    return { compression: ImageDataCompression.RLE, perChannelScanLines };
}

type ImageDataMap = {
    [ImageDataCompression.Raw]: ImageDataRaw;
    [ImageDataCompression.RLE]: ImageDataRLE;
    [ImageDataCompression.ZIP]: never;
    [ImageDataCompression.ZIP_Prediction]: never;
};

export type ImageDataSection = ImageDataMap[ImageDataCompression];

export type ImageDataRLE = {
    readonly compression: ImageDataCompression.RLE;
    readonly perChannelScanLines: Uint8Array[][];
};

export type ImageDataRaw = {
    readonly compression: ImageDataCompression.Raw;
    readonly perChannelData: Uint8Array[];
};