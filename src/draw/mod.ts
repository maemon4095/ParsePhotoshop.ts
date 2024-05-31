import { Photoshop } from "../structure/mod.ts";
import { Blender } from "jsr:@maemon4095/imagedata-blender-gl@0.1";
import { blendLayerTo } from "./util.ts";

export function blendTo(blender: Blender, ps: Photoshop, dx: number, dy: number) {
    const layers = ps.layers;
    // FIXME: クリッピングには直前のレイヤのみ影響すべき
    // FIXME: クリッピングされるレイヤは、クリッピングレイヤが不可視のときは非表示になるべき
    for (let i = layers.length - 1; i >= 0; --i) {
        blendLayerTo(blender, layers[i], dx, dy);
    }
}

export function renderSync(ps: Photoshop): ImageData {
    const blender = new Blender(ps.width, ps.height);
    blendTo(blender, ps, 0, 0);
    const image = blender.createImageData();
    blender.cleanUp();
    return image;
}

export async function render(ps: Photoshop): Promise<ImageData> {
    throw null;
}