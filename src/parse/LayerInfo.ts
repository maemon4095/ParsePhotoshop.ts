import { ParseContext } from "../util/parse/mod.ts";
import { Version } from "./FileHeaderSection.ts";
import parseLayerRecord, { LayerRecords } from "./LayerRecords.ts";
import parseImageChannel, { ImageChannel } from "./ImageChannel.ts";

export default function parse(ctx: ParseContext, version: Version): LayerInfo | null {
    const sectionLength = (() => {
        switch (version) {
            case Version.PSD:
                return ctx.takeUint32();
            case Version.PSB:
                return Number(ctx.takeUint64());
        }
    })();
    if (sectionLength === 0) {
        return null;
    }
    const sectionStart = ctx.byteOffset;
    const [layerCount, isFirstLayerContainsTransparencyData] = (() => {
        const layerCount = ctx.takeInt16();
        if (layerCount < 0) {
            return [-layerCount, true];
        } else {
            return [layerCount, false];
        }
    })();

    const layerRecords: LayerRecords[] = new Array(layerCount);
    const perLayerChannels: ImageChannel[][] = new Array(layerCount);
    for (let i = 0; i < layerCount; ++i) {
        const record = parseLayerRecord(ctx, version);
        layerRecords[i] = record;
        perLayerChannels[i] = new Array(record.channelCount);
    }

    for (let i = 0; i < layerCount; ++i) {
        const imageDataArray = perLayerChannels[i];
        const layerRecord = layerRecords[i];
        for (let j = 0; j < imageDataArray.length; ++j) {
            const data = parseImageChannel(ctx, layerRecord.channelInfos[j]);
            imageDataArray[j] = data;
        }
    }
    const sectionEnd = ctx.byteOffset;
    const sectionConsumed = sectionEnd - sectionStart;
    const paddingSize = sectionLength - sectionConsumed;
    ctx.advance(paddingSize);

    return {
        isFirstLayerContainsTransparencyData,
        layerCount,
        layerRecords,
        perLayerChannels
    };
}

export type LayerInfo = {
    isFirstLayerContainsTransparencyData: boolean,
    layerCount: number,
    layerRecords: LayerRecords[];
    perLayerChannels: ImageChannel[][];
};