import { PhotoshopStrucuture } from "~/mod.ts";
import { BlendMode } from "~/structure/mod.ts";
import { Blender, ColorBlendMethod, ColorBlendMethods, CompositeMethods } from "./blender/mod.ts";

export function createImageData(ps: PhotoshopStrucuture) {
    const layers = ps.layers;
    const blender = new Blender(ps.width, ps.height);

    // clipping layerをどうするか。
    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        if (layer.visible) {
            console.log("layer", layer.name, "is not visible.");
            continue;
        }
        console.log("render layer", layer.name);
        const compositeOperation = getBlendMethod(layer.blendMode);
        if (compositeOperation === undefined) {
            console.warn("Unsupported blend mode was detected and treated as normal blend mode.");
        }
        const method = compositeOperation ?? ColorBlendMethods.normal;
        if (layer.imageData === null) {
            continue;
        }

        blender.blend(layer.imageData, layer.left, layer.top, CompositeMethods.sourceOver(method));
    }

    return blender.intoImageData();
}

function getBlendMethod(blendMode: BlendMode): undefined | ColorBlendMethod {
    switch (blendMode) {
        case BlendMode.Unknown:
            throw new Error("Unknown blend mode.");
        case BlendMode.PassThrough:
            throw new Error("Invalid blend mode.");
        case BlendMode.Normal:
            return ColorBlendMethods.normal;
        case BlendMode.Darken:
            return ColorBlendMethods.darken;
        case BlendMode.Multiply:
            return ColorBlendMethods.multiply;
        case BlendMode.ColorBurn:
            return ColorBlendMethods.colorBurn;
        case BlendMode.Lighten:
            return ColorBlendMethods.lighten;
        case BlendMode.Screen:
            return ColorBlendMethods.screen;
        case BlendMode.ColorDodge:
            return ColorBlendMethods.colorDodge;
        case BlendMode.Overlay:
            return ColorBlendMethods.overlay;
        case BlendMode.SoftLight:
            return ColorBlendMethods.softLight;
        case BlendMode.HardLight:
            return ColorBlendMethods.hardLight;
        case BlendMode.Exclusion:
            return ColorBlendMethods.exclusion;
        case BlendMode.Difference:
            return ColorBlendMethods.difference;
        case BlendMode.Hue:
            return ColorBlendMethods.hue;
        case BlendMode.Saturation:
            return ColorBlendMethods.saturation;
        case BlendMode.Color:
            return ColorBlendMethods.color;
        case BlendMode.Luminosity:
            return ColorBlendMethods.luminosity;
        default: return undefined;
    }
}