import { ParseContext } from "~/util/parse/mod.ts";
import { ColorDepth, Version } from "~/parse/FileHeader.ts";
import { LayerRecords, parse as parseLayerRecord } from "~/parse/LayerRecords.ts";
import { ChannelImage, parse as parseImageData } from "~/parse/ChannelImage.ts";

export function parse(ctx: ParseContext, colorDepth: ColorDepth, version: Version): LayerInfo | null {
    const sectionLength = (() => {
        switch (version) {
            case Version.PSD:
                return BigInt(ctx.takeUint32());
            case Version.PSB:
                return ctx.takeUint64();
        }
    })();
    if (sectionLength === 0n) {
        return null;
    }

    const [layerCount, isFirstLayerContainsTransparencyData] = (() => {
        const layerCount = ctx.takeInt16();
        if (layerCount < 0) {
            return [-layerCount, true];
        } else {
            return [layerCount, false];
        }
    })();

    const layerRecords: LayerRecords[] = new Array(layerCount);
    const perLayerImages: ChannelImage[][] = new Array(layerCount);
    for (let i = 0; i < layerCount; ++i) {
        const record = parseLayerRecord(ctx, version);
        layerRecords[i] = record;
        perLayerImages[i] = new Array(record.channelCount);
    }

    for (let i = 0; i < layerCount; ++i) {
        const imageDataArray = perLayerImages[i];
        for (let j = 0; j < imageDataArray.length; ++j) {
            const data = parseImageData(ctx, colorDepth, version, layerRecords[i]);
            imageDataArray[j] = data;
        }
    }

    return {
        sectionLength,
        isFirstLayerContainsTransparencyData,
        layerCount,
        layerRecords,
        perLayerImages
    };
}

export type LayerInfo = {
    sectionLength: bigint,
    isFirstLayerContainsTransparencyData: boolean,
    layerCount: number,
    layerRecords: LayerRecords[];
    perLayerImages: ChannelImage[][];
};