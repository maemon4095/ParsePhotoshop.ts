import { ColorMode } from "~/parse/FileHeaderSection.ts";
import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

export default function parse(ctx: ParseContext, colorMode: ColorMode): ColorModeDataSection {
    const length = ctx.peekUint32();
    switch (colorMode) {
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
    ctx.takeUint32();
    const data = ctx.takeUint8Array(length);
    return { data };
}

/** The second section of Photoshop file */
export type ColorModeDataSection = {
    data: Uint8Array;
};

export const IndexedColorModeDataLength = 768;

export class ColorModeDataMustBeEmptyError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Color mode data must be empty when color mode is other than Indexed or Duotone.";
    }
}

export class ColorModeDataLengthMustBe768Error extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = `Color mode data length must be ${IndexedColorModeDataLength} when color mode is Indexed.`;
    }
}