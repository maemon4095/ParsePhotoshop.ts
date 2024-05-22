import { ParseContext } from "../util/parse/mod.ts";
import { Version } from "./FileHeaderSection.ts";
import parseLayerInfo, { LayerInfo } from "./LayerInfo.ts";
import parseGlobalLayerMaskInfo, { GlobalLayerMaskInfo } from "./GlobalLayerMaskInfo.ts";
import parseAdditionalLayerInfo, { AdditionalLayerInformation } from "./AdditionalLayerInformation/mod.ts";
import { SyntaxError } from "./SyntaxError.ts";

export default function parse(ctx: ParseContext, version: Version): LayerAndMaskInformationSection {
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
        return parseLayerInfo(ctx, version);
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
        const paddingSize = (Math.ceil(consumed / 4) * 4) - consumed;
        ctx.advance(paddingSize);
        spaceLeft -= consumed + paddingSize;
    }
    if (spaceLeft < 0) {
        throw new LayerAndMaskInformationSectionOverflowError(ctx.byteOffset);
    }

    return { layerInfo, globalLayerMaskInfo, additionalLayerInformations };
}


/** The fourth section of a Photoshop file */
export type LayerAndMaskInformationSection = {
    layerInfo: LayerInfo | null;
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
    additionalLayerInformations: AdditionalLayerInformation[];
};

export class LayerAndMaskInformationSectionOverflowError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Layer and mask information section is overflowed.";
    }
} 