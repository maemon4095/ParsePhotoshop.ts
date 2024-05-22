import { ParseContext, measured } from "../util/parse/mod.ts";
import { ChannelInfo } from "./LayerRecords.ts";
import parseImageDataCompression, { ImageDataCompression } from "./ImageCompression.ts";

export default function parse(ctx: ParseContext, channelInfo: ChannelInfo): ImageChannel {
    const [compression, consumed] = measured(parseImageDataCompression)(ctx);
    const dataLength = Number(channelInfo.dataLength) - consumed;
    const data = ctx.takeUint8Array(dataLength);
    return {
        compression,
        data
    };
}

export type ImageChannel = {
    compression: ImageDataCompression;
    data: Uint8Array;
};