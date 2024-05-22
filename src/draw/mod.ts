import { Photoshop, BlendMode, Group, Layer, ClippingMode } from "../structure/mod.ts";
import { Blender, ColorBlendMethod, ColorBlendMethods, CompositeMethods } from "jsr:@maemon4095/imagedata-blender";

export function render(ps: Photoshop): ImageData {
    const layers = ps.layers;
    const blender = new Blender(ps.width, ps.height);

    // FIXME: クリッピングには直前のレイヤのみ影響すべき
    // FIXME: クリッピングされるレイヤは、クリッピングレイヤが不可視のときは非表示になるべき
    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        if (!isLayerVisible(layer) || layer.imageData === null) {
            continue;
        }
        let blendMethod = getBlendMethod(layer.blendMode);
        if (blendMethod === undefined) {
            console.warn("Unsupported blend mode was detected and treated as normal blend mode.");
            blendMethod = ColorBlendMethods.normal;
        }
        const method = (() => {
            if (layer.clippingMode === ClippingMode.NonBase) {
                return CompositeMethods.sourceAtop(blendMethod);
            }
            return CompositeMethods.sourceOver(blendMethod);
        })();

        blender.blend(layer.imageData, layer.left, layer.top, method);
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

function isLayerVisible(layer: Layer): boolean {
    let current: Layer | Group | Photoshop = layer;
    while (current.type !== "Photoshop") {
        if (!current.visible) {
            return false;
        }
        current = current.parent;
    }
    return true;
}