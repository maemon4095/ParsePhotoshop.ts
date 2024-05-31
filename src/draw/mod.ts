import { Photoshop, BlendMode, Group, Layer, ClippingMode } from "../structure/mod.ts";
import { Blender, BlendShader, CompositeMethod } from "jsr:@maemon4095/imagedata-blender-gl@0.1";

export function blendTo(blender: Blender, ps: Photoshop, dx: number, dy: number) {
    const layers = ps.layers;
    // FIXME: クリッピングには直前のレイヤのみ影響すべき
    // FIXME: クリッピングされるレイヤは、クリッピングレイヤが不可視のときは非表示になるべき
    for (let i = layers.length - 1; i >= 0; --i) {
        const layer = layers[i];
        if (!isLayerVisible(layer) || layer.imageData === null) {
            continue;
        }
        let blendShader = getBlendShader(layer.blendMode);
        if (blendShader === undefined) {
            console.warn("Unsupported blend mode was detected and treated as normal blend mode.");
            blendShader = BlendShader.normal;
        }
        if (layer.clippingMode === ClippingMode.NonBase) {
            blendShader = blendShader.withCompositeMethod(CompositeMethod.sourceAtop);
        }
        blender.blend(layer.imageData, layer.left + dx, layer.top + dy, blendShader);
    }
}

export function render(ps: Photoshop): ImageData {
    const blender = new Blender(ps.width, ps.height);
    blendTo(blender, ps, 0, 0);
    const image = blender.createImageData();
    blender.cleanUp();
    return image;
}

function getBlendShader(blendMode: BlendMode): undefined | BlendShader {
    switch (blendMode) {
        case BlendMode.Unknown:
            throw new Error("Unknown blend mode.");
        case BlendMode.PassThrough:
            throw new Error("Invalid blend mode.");
        case BlendMode.Normal:
            return BlendShader.normal;
        case BlendMode.Darken:
            return BlendShader.darken;
        case BlendMode.Multiply:
            return BlendShader.multiply;
        case BlendMode.ColorBurn:
            return BlendShader.colorBurn;
        case BlendMode.Lighten:
            return BlendShader.lighten;
        case BlendMode.Screen:
            return BlendShader.screen;
        case BlendMode.ColorDodge:
            return BlendShader.colorDodge;
        case BlendMode.Overlay:
            return BlendShader.overlay;
        case BlendMode.SoftLight:
            return BlendShader.softLight;
        case BlendMode.HardLight:
            return BlendShader.hardLight;
        case BlendMode.Exclusion:
            return BlendShader.exclusion;
        case BlendMode.Difference:
            return BlendShader.difference;
        case BlendMode.Hue:
            return BlendShader.hue;
        case BlendMode.Saturation:
            return BlendShader.saturation;
        case BlendMode.Color:
            return BlendShader.color;
        case BlendMode.Luminosity:
            return BlendShader.luminosity;
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