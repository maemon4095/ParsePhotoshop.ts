import { ParseContext } from "~/util/parse/mod.ts";
import { ColorDepth, Version } from "~/parse/FileHeaderSection.ts";
import parseLayerInfo, { LayerInfo } from "~/parse/LayerInfo.ts";
import parseGlobalLayerMaskInfo, { GlobalLayerMaskInfo } from "~/parse/GlobalLayerMaskInfo.ts";
import parseAdditionalLayerInfo, { AdditionalLayerInformation } from "~/parse/AdditionalLayerInformation/mod.ts";

export default function parse(ctx: ParseContext, colorDepth: ColorDepth, version: Version): LayerAndMaskInformationSection {
    const sectionLength = (() => {
        switch (version) {
            case Version.PSD:
                return ctx.takeUint32();
            case Version.PSB:
                return Number(ctx.takeUint64());
        }
    })();
    const start = ctx.byteOffset;
    const layerInfo = (() => {
        if (sectionLength === 0) {
            return null;
        }
        return parseLayerInfo(ctx, colorDepth, version);
    })();
    const globalLayerMaskInfo = (() => {
        if (sectionLength === ctx.byteOffset - start) {
            return null;
        }
        return parseGlobalLayerMaskInfo(ctx);
    })();
    const additionalLayerInformations: AdditionalLayerInformation[] = [];
    let spaceLeft = sectionLength - (ctx.byteOffset - start);
    while (spaceLeft > 0) {
        const start = ctx.byteOffset;
        const info = parseAdditionalLayerInfo(ctx, version);
        additionalLayerInformations.push(info);
        const consumed = ctx.byteOffset - start;
        spaceLeft -= consumed;
    }

    return { layerInfo, globalLayerMaskInfo, additionalLayerInformations };
}


/** The fourth section of a Photoshop file */
export type LayerAndMaskInformationSection = {
    layerInfo: LayerInfo | null;
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
    additionalLayerInformations: AdditionalLayerInformation[];
};