import { ParseContext } from "~/util/parse/mod.ts";
import { ImageDataCompression } from "~/parse/ImageCompression.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import { Version } from "~/parse/FileHeaderSection.ts";
import { ImageChannel } from "~/parse/ImageChannel.ts";
import { decompressRLE } from "~/Compression.ts";

export type SegmentedChannelData = Iterable<Uint8Array>;

export function* decodeImageChannel(version: Version, layer: LayerRecords, ch: ImageChannel): SegmentedChannelData {
    const scanLineCount = layer.enclosingRectangle.bottom - layer.enclosingRectangle.top;
    switch (ch.compression) {
        case ImageDataCompression.Raw: {
            yield ch.data;
            return;
        }
        case ImageDataCompression.RLE: {
            yield* decodeImageChannelRLE(ch.data, scanLineCount, version);
            return;
        }
        case ImageDataCompression.ZIP:
        case ImageDataCompression.ZIP_Prediction:
            throw new Error("unsupported");
    }
}

function* decodeImageChannelRLE(bin: Uint8Array, scanLineCount: number, version: Version) {
    const ctx = ParseContext.create(bin.buffer, bin.byteOffset);
    const lineSizes = new Array(scanLineCount);
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
    for (let i = 0; i < lineSizes.length; ++i) {
        const scanLineSize = lineSizes[i];
        const scanline = ctx.takeUint8Array(scanLineSize);
        yield decompressRLE(scanline);
    }
}