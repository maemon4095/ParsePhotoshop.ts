import { PhotoshopStrucuture } from "~/mod.ts";
import { BlendMode } from "~/structure/mod.ts";
import { ClippingMode } from "~/parse/LayerRecords.ts";

export function createImageData(ps: PhotoshopStrucuture) {
    const offscreenCanvas = new OffscreenCanvas(ps.width, ps.height);
    const context = offscreenCanvas.getContext("2d")!;
    const layers = ps.layers;

    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        console.log("render layer", layer.name);
        console.log("clipping base", layer.clippingMode == ClippingMode.Base);
        const compositeOperation = getCompositionOption(layer.blendMode);
        if (compositeOperation === undefined) {
            console.warn("Unsupported blend mode was detected and treated as normal blend mode.");
        }
        console.log(compositeOperation);
        context.globalCompositeOperation = compositeOperation ?? "source-over";
        if (layer.imageData === null) {
            continue;
        }
        context.putImageData(layer.imageData, layer.left, layer.top);
    }

    return context.getImageData(0, 0, ps.width, ps.height);
}

function getCompositionOption(blendMode: BlendMode): undefined | GlobalCompositeOperation {
    switch (blendMode) {
        case BlendMode.Unknown:
            throw new Error("Unknown blend mode.");
        case BlendMode.PassThrough:
            throw new Error("Invalid blend mode.");
        case BlendMode.Normal:
            return "source-over";
        case BlendMode.Darken:
            return "darken";
        case BlendMode.Multiply:
            return "multiply";
        case BlendMode.ColorBurn:
            return "color-burn";
        case BlendMode.Lighten:
            return "lighten";
        case BlendMode.Screen:
            return "screen";
        case BlendMode.ColorDodge:
            return "color-dodge";
        case BlendMode.LighterColor:
            return "lighter";
        case BlendMode.Overlay:
            return "overlay";
        case BlendMode.SoftLight:
            return "soft-light";
        case BlendMode.HardLight:
            return "hard-light";
        case BlendMode.Exclusion:
            return "exclusion";
        case BlendMode.Subtract:
            return "difference"; // NOTE: "difference" is not same method of BlendMode.Difference.
        case BlendMode.Hue:
            return "hue";
        case BlendMode.Saturation:
            return "saturation";
        case BlendMode.Color:
            return "color";
        case BlendMode.Luminosity:
            return "luminosity";
        default: return undefined;
    }
}