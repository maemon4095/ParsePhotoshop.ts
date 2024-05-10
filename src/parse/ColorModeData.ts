import { ColorMode, FileHeader } from "~/parse/FileHeader.ts";
import { ParseContext } from "~/util/parse/mod.ts";

export function parse(ctx: ParseContext, fileHeader: FileHeader) {
    const length = ctx.peekUint32();
    switch (fileHeader.colorMode) {
        case ColorMode.Bitmap:
        case ColorMode.Grayscale:
        case ColorMode.RGB:
        case ColorMode.CMYK:
        case ColorMode.Multichannel:
        case ColorMode.Lab:
            if (length !== 0) {
                throw new ColorModeDataMustBeEmptyError(ctx.byteOffset);
            }
            break;
        case ColorMode.Indexed:
            if (length != IndexedColorModeDataLength) {
                throw new ColorModeDataLengthMustBe768Error(ctx.byteOffset);
            }
            break;
        case ColorMode.Duotone:
            // Duotone color specification is not documented. image are treated as a gray image.
            break;
    }



}

const IndexedColorModeDataLength = 768;

export class ColorModeDataMustBeEmptyError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = "Color mode data must be empty when color mode is other than Indexed or Duotone.";
    }
}

export class ColorModeDataLengthMustBe768Error extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = `Color mode data length must be ${IndexedColorModeDataLength} when color mode is Indexed.`;
    }
}