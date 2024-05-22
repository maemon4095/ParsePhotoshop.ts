import { ParseContext } from "../util/parse/mod.ts";
import parseImageDataCompression, { ImageDataCompression } from "./ImageCompression.ts";
export default function parse(ctx: ParseContext) {
    const compression = parseImageDataCompression(ctx);
    const data = ctx.takeUint8Array(ctx.bytesLeft);
    return { compression, data };
}

/** the fifth(last) section of Photoshop file. */
export type ImageDataSection = {
    compression: ImageDataCompression;
    data: Uint8Array;
};