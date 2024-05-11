import { ParseContext } from "~/util/parse/mod.ts";
import { Version } from "~/parse/FileHeader.ts";
import { parse as parseLayerInfo } from "~/parse/LayerInfo.ts";

export function parse(ctx: ParseContext, version: Version) {
    const sectionSize = (() => {
        switch (version) {
            case Version.PSD:
                return BigInt(ctx.takeUint32());
            case Version.PSB:
                return ctx.takeUint64();
        }
    })();

    const layerInfo = parseLayerInfo(ctx, version);
}