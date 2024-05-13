// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_72092

import { ParseContext } from "~/util/parse/mod.ts";
import parseFileHeader from "~/parse/FileHeaderSection.ts";
import parseColorModeData from "~/parse/ColorModeDataSection.ts";
import parseImageResources from "~/parse/ImageResourcesSection.ts";
import parseLayerAndMaskInformation from "~/parse/LayerAndMaskInformationSection.ts";
import parseImageDataSection from "~/parse/ImageDataSection.ts";

// 全データはbig-endianで保存される.
export function parse(buffer: ArrayBuffer) {
    const ctx = new ParseContext(new DataView(buffer), 0);
    const fileHeader = parseFileHeader(ctx);
    console.log("File Header:", fileHeader);
    const colorModeData = parseColorModeData(ctx, fileHeader.colorMode);
    console.log("ColorModeData:", colorModeData);
    const imageResources = parseImageResources(ctx);
    console.log("imageResources:", imageResources);
    const layerAndMaskInformation = parseLayerAndMaskInformation(ctx, fileHeader.colorDepth, fileHeader.version);
    console.log("layerAndMaskInformation:", layerAndMaskInformation);
    const imageDataSection = parseImageDataSection(ctx, fileHeader);
    console.log("imageData:", imageDataSection);
}
