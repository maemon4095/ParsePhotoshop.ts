import { ParseContext } from "../util/parse/mod.ts";
import { ImageDataSection, PhotoshopFile, ColorMode, FileHeaderSection, ImageDataCompression } from "../parse/mod.ts";
import { decompressRLE } from "../Compression.ts";

export function decodeImageDataSection(file: PhotoshopFile): ImageData {
    if (file.imageDataSection === null) {
        throw new Error("image data section is null.");
    }
    switch (file.imageDataSection.compression) {
        case ImageDataCompression.Raw: {
            switch (file.fileHeader.colorMode) {
                case ColorMode.Indexed:
                    return decodeImageDataSectionRawIndexed(file);
                case ColorMode.RGB:
                    return decodeImageDataSectionRaw(file.imageDataSection, file.fileHeader);
                case ColorMode.Bitmap:
                case ColorMode.Grayscale:
                case ColorMode.CMYK:
                case ColorMode.Multichannel:
                case ColorMode.Duotone:
                case ColorMode.Lab:
                    throw new Error("Unsupported color mode");
            }
            break;
        }
        case ImageDataCompression.RLE: return decodeImageDataSectionRLE(file.imageDataSection, file.fileHeader);
        case ImageDataCompression.ZIP:
        case ImageDataCompression.ZIP_Prediction:
            throw new Error("TODO");
    }
}

function decodeImageDataSectionRaw(imageDataSection: ImageDataSection, fileHeader: FileHeaderSection): ImageData {
    const bin = imageDataSection.data;
    const imageData = new Uint8ClampedArray(fileHeader.width * fileHeader.height * 4);
    const channelCount = Math.min(fileHeader.channelCount, 4);
    const channelLen = fileHeader.width * fileHeader.height;
    for (let c = 0; c < channelCount; ++c) {
        for (let i = 0; i < channelLen; ++i) {
            imageData[i * 4 + c] = bin[i + channelLen * c];
        }
    }

    if (channelCount < 4) {
        for (let i = 0; i < channelLen; ++i) {
            imageData[i * 4 + 3] = 255;
        }
    }

    return new ImageData(imageData, fileHeader.width, fileHeader.height);;
}

function decodeImageDataSectionRawIndexed(file: PhotoshopFile): ImageData {
    const { imageDataSection, fileHeader, colorModeData } = file;
    // length always 768 = 256 * 3
    const table = colorModeData.data; // non-interleaved order: RRR... GGG... BBB...
    const bin = imageDataSection!.data;
    const imageData = new Uint8ClampedArray(fileHeader.width * fileHeader.height * 4);
    const channelCount = Math.min(fileHeader.channelCount, 4);
    const channelLen = fileHeader.width * fileHeader.height;
    for (let c = 0; c < channelCount; ++c) {
        for (let i = 0; i < channelLen; ++i) {
            const index = bin[i + channelLen * c];
            imageData[i * 4 + c] = table[index + 256 * c];
        }
    }

    for (let i = 0; i < channelLen; ++i) {
        imageData[i * 4 + 3] = 255;
    }

    return new ImageData(imageData, fileHeader.width, fileHeader.height);
}
function decodeImageDataSectionRLE(imageDataSection: ImageDataSection, fileHeader: FileHeaderSection): ImageData {
    // FIXME: non 8 bit color support
    const bin = imageDataSection.data;
    const ctx = ParseContext.create(bin.buffer, bin.byteOffset);
    const imageData = new Uint8ClampedArray(fileHeader.width * fileHeader.height * 4);
    const channelCount = Math.min(fileHeader.channelCount, 4);
    const perChannelScanLineSizes = new Array<number[]>(channelCount);

    for (let i = 0; i < perChannelScanLineSizes.length; ++i) {
        const scanLineSizes = new Array<number>(fileHeader.height);
        perChannelScanLineSizes[i] = scanLineSizes;
        for (let j = 0; j < scanLineSizes.length; ++j) {
            scanLineSizes[j] = ctx.takeUint16();
        }
    }

    for (let i = 0; i < perChannelScanLineSizes.length; ++i) {
        const scanLineSizes = perChannelScanLineSizes[i];
        for (let j = 0; j < scanLineSizes.length; ++j) {
            const bin = ctx.takeUint8Array(scanLineSizes[j]);
            const raw = decompressRLE(bin);
            const offset = i + fileHeader.width * 4 * j;
            for (let k = 0; k < raw.length; ++k) {
                imageData[k * 4 + offset] = raw[k];
            }
        }
    }

    if (channelCount < 4) {
        for (let i = 3; i < imageData.length; i += 4) {
            imageData[i] = 255;
        }
    }

    return new ImageData(imageData, fileHeader.width, fileHeader.height);;
}