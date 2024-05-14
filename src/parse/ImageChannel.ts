import { ParseContext } from "~/util/parse/mod.ts";
import { Version, ColorDepth } from "~/parse/FileHeaderSection.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import parseImageDataCompression, { ImageDataCompression } from "~/parse/ImageCompression.ts";

export default function parse(ctx: ParseContext, depth: ColorDepth, version: Version, layerRecords: LayerRecords): ImageChannel {
    const compression = parseImageDataCompression(ctx);
    switch (compression) {
        case ImageDataCompression.Raw: return parseImageRaw(ctx, depth, layerRecords);
        case ImageDataCompression.RLE: return parseImageRLE(ctx, version, layerRecords);
        case ImageDataCompression.ZIP:
        case ImageDataCompression.ZIP_Prediction:
            throw new Error("TODO");
    }
}

function parseImageRaw(ctx: ParseContext, depth: ColorDepth, layerRecords: LayerRecords): ImageChannelRaw {
    const rect = layerRecords.enclosingRectangle;
    const imageSize = (rect.bottom - rect.top) * (rect.right - rect.left);
    const dataLength = (() => {
        if (depth === 1) {
            return Math.ceil(imageSize / 8);
        }
        return imageSize * Math.floor(depth / 8);
    })();
    const data = ctx.takeUint8Array(dataLength);
    return { compression: ImageDataCompression.Raw, data };
}
function parseImageRLE(ctx: ParseContext, version: Version, layerRecords: LayerRecords): ImageChannelRLE {
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

    return { compression: ImageDataCompression.RLE, scanLines };
}

type ImageChannelMap = {
    [ImageDataCompression.RLE]: ImageChannelRLE;
    [ImageDataCompression.Raw]: ImageChannelRaw;
    [ImageDataCompression.ZIP]: never;
    [ImageDataCompression.ZIP_Prediction]: never;
};

export type ImageChannelRaw = {
    compression: ImageDataCompression.Raw;
    data: Uint8Array;
};

export type ImageChannelRLE = {
    compression: ImageDataCompression.RLE;
    scanLines: Uint8Array[];
};

export type ImageChannel = ImageChannelMap[ImageDataCompression];