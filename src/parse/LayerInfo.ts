import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeader.ts";
import { LayerRecords, parse as parseLayerRecord } from "~/parse/LayerRecords.ts";
import { ChannelImageData, parse as parseImageData } from "~/parse/ChannelImageData.ts";

export function parse(ctx: ParseContext, version: Version): LayerInfo {
    const sectionLength = (() => {
        switch (version) {
            case Version.PSD:
                return BigInt(ctx.takeUint32());
            case Version.PSB:
                return ctx.takeUint64();
        }
    })();

    const [layerCount, isFirstLayerContainsTransparencyData] = (() => {
        const layerCount = ctx.takeInt16();
        if (layerCount < 0) {
            return [-layerCount, true];
        } else {
            return [layerCount, false];
        }
    })();

    const layerRecords: LayerRecords[] = new Array(layerCount);
    for (let i = 0; i < layerCount; ++i) {
        const record = parseLayerRecord(ctx, version);
        layerRecords[i] = record;
    }

    const imageData: ChannelImageData[] = new Array(layerCount);
    for (let i = 0; i < layerCount; ++i) {
        const record = parseImageData(ctx, version);
        imageData[i] = record;
    }

    return {
        sectionLength,
        isFirstLayerContainsTransparencyData,
        layerCount,
        layerRecords,
        imageData
    };
}

export type LayerInfo = {
    sectionLength: bigint,
    isFirstLayerContainsTransparencyData: boolean,
    layerCount: number,
    layerRecords: LayerRecords[];
    imageData: ChannelImageData[];
};