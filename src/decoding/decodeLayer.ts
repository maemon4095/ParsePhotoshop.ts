import { PhotoshopFile } from "~/parse/mod.ts";
import { ColorMode } from "../parse/FileHeaderSection.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import { ImageChannel } from "~/structure/mod.ts";
import { decodeImageChannel } from "~/decoding/channel.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export function decodeLayer(file: PhotoshopFile, layer: LayerRecords, channels: ImageChannel[]): null | ImageData {
    const colorMode = file.fileHeader.colorMode;
    switch (colorMode) {
        case ColorMode.RGB:
            return decodeLayerRGB(file, layer, channels);
        case ColorMode.Indexed:
            return decodeLayerIndexed(file, layer, channels);
        case ColorMode.Bitmap:
        case ColorMode.Grayscale:
        case ColorMode.CMYK:
        case ColorMode.Multichannel:
        case ColorMode.Duotone:
        case ColorMode.Lab:
            throw new Error("Unsupported color mode.");
    }
}

function decodeLayerRGB(file: PhotoshopFile, layer: LayerRecords, channels: ImageChannel[]): null | ImageData {
    const colorDepth = file.fileHeader.colorDepth;
    if (colorDepth === 1) {
        throw new Error("Unsupported color format.");
    }
    const readChannel: (ctx: ParseContext) => number = (() => {
        switch (colorDepth) {
            case 8:
                return (ctx) => ctx.takeUint8();
            case 16:
                return (ctx) => ctx.takeUint16() * (0xF / 0xFF);
            case 32:
                return (ctx) => ctx.takeUint32() * (0xF / 0xFFFF);
        }
    })();

    const width = layer.enclosingRectangle.right - layer.enclosingRectangle.left;
    const height = layer.enclosingRectangle.bottom - layer.enclosingRectangle.top;
    if (width === 0 || height === 0) {
        return null;
    }
    const buffer = new Uint8ClampedArray(height * width * 4);
    for (let ch = 0; ch < channels.length; ++ch) {
        const info = layer.channelInfos[ch];
        if (info.id < -1) {
            continue;
        }
        const segments = decodeImageChannel(file.fileHeader.version, layer, channels[ch]);
        let pixelIndex = info.id < 0 ? 3 : info.id;
        if (pixelIndex === 3) {
            for (const seg of segments) {
                const ctx = ParseContext.create(seg.buffer, seg.byteOffset);
                while (ctx.bytesLeft > 0) {
                    buffer[pixelIndex] = readChannel(ctx) * layer.opacity;
                    pixelIndex += 4;
                }
            }
        } else {
            for (const seg of segments) {
                const ctx = ParseContext.create(seg.buffer, seg.byteOffset);
                while (ctx.bytesLeft > 0) {
                    buffer[pixelIndex] = readChannel(ctx);
                    pixelIndex += 4;
                }
            }
        }

    }

    return new ImageData(buffer, width, height);
}

function decodeLayerIndexed(file: PhotoshopFile, layer: LayerRecords, channels: ImageChannel[]): ImageData {
    const colorDepth = file.fileHeader.colorDepth;
    if (colorDepth !== 1) {
        throw new Error("Unsupported color format.");
    }

    // length always 768 = 256 * 3
    const palette = file.colorModeData.data;// non-interleaved order: RRR... GGG... BBB...
    const height = file.fileHeader.height;
    const width = file.fileHeader.width;
    const buffer = new Uint8ClampedArray(height * width * 4);
    buffer.fill(layer.opacity);

    for (let ch = 0; ch < channels.length; ++ch) {
        const segments = decodeImageChannel(file.fileHeader.version, layer, channels[ch]);
        let pixelIndex: number = layer.channelInfos[ch].id;
        const paletteOffset = ch * 256;
        for (const seg of segments) {
            for (let i = 0; i < seg.length; ++i) {
                const idx = seg[i];
                const c = palette[idx + paletteOffset];
                buffer[pixelIndex] = c;
                pixelIndex += 4;
            }
        }
    }

    return new ImageData(buffer, width, height);
}   