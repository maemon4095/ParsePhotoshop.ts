import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

export default function parse(ctx: ParseContext): ImageDataCompression {
    const compression = ctx.peekUint16();
    if (compression >= 4) {
        throw new InvalidImageDataCompressionError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return compression;
}
export class InvalidImageDataCompressionError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Image data compression must be 0 = raw data, 1 = RLE, 2 = ZIP, 3 = ZIP with prediction.";
    }
}

export enum ImageDataCompression {
    Raw = 0,
    RLE = 1,
    ZIP = 2,
    ZIP_Prediction = 3
}
