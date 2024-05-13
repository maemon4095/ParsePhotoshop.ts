import { ParseContext } from "~/util/parse/mod.ts";
import { ColorDepth, Version } from "~/parse/FileHeaderSection.ts";
import parseLayerInfo, { LayerInfo } from "~/parse/LayerInfo.ts";
import parseGlobalLayerMaskInfo, { GlobalLayerMaskInfo } from "~/parse/GlobalLayerMaskInfo.ts";

export default function parse(ctx: ParseContext, colorDepth: ColorDepth, version: Version): LayerAndMaskInformationSection | null {
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
    // NOTE: 仕様書には additional layer information があることになっているが、layer records に存在するためドキュメントの誤りと思われる。
    return { layerInfo, globalLayerMaskInfo };
}


/** The fourth section of a Photoshop file */
export type LayerAndMaskInformationSection = {
    layerInfo: LayerInfo | null;
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
};