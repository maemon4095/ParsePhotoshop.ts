import { ParseContext } from "~/util/parse/mod.ts";
import { ColorDepth, Version } from "~/parse/FileHeader.ts";
import { LayerInfo, parse as parseLayerInfo } from "~/parse/LayerInfo.ts";
import { GlobalLayerMaskInfo, parse as parseGlobalLayerMaskInfo } from "~/parse/GlobalLayerMaskInfo.ts";

export function parse(ctx: ParseContext, colorDepth: ColorDepth, version: Version): LayerAndMaskInformation | null {
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
    const layerInfo = parseLayerInfo(ctx, colorDepth, version);
    const globalLayerMaskInfo = parseGlobalLayerMaskInfo(ctx);
    return { layerInfo, globalLayerMaskInfo };
}


/** The fourth section of a Photoshop file */
export type LayerAndMaskInformation = {
    layerInfo: LayerInfo | null;
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
};