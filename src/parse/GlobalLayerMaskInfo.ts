import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): GlobalLayerMaskInfo | null {
    const length = ctx.takeUint32();
    if (length === 0) {
        return null;
    }

    const overlayColorSpace = ctx.takeUint16();
    const colorComponent0 = ctx.takeUint32();
    const colorComponent1 = ctx.takeUint32();
    const opacity = ctx.takeUint16();
    const kind = ctx.takeUint8();
    void ctx.takeUint8Array(length - (2 + 8 + 2 + 1));
    return {
        overlayColorSpace,
        colorComponents: [colorComponent0, colorComponent1],
        opacity,
        kind
    };
}

export type GlobalLayerMaskInfo = {
    /** undocumented  */
    overlayColorSpace: number,
    colorComponents: [number, number];
    /** 0 is transparent, 100 is opaque */
    opacity: number;
    /** 0 is color selected -- i.e. inverted, 1 is color protected, 128 is use value stored per layer.  */
    kind: number;
};

