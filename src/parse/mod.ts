// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_72092
import { ParseContext } from "~/util/parse/mod.ts";
import parseFileHeader, { FileHeaderSection } from "~/parse/FileHeaderSection.ts";
import parseColorModeData, { ColorModeDataSection } from "~/parse/ColorModeDataSection.ts";
import parseImageResources, { ImageResourcesSection } from "~/parse/ImageResourcesSection.ts";
import parseLayerAndMaskInformation, { LayerAndMaskInformationSection } from "~/parse/LayerAndMaskInformationSection.ts";
import parseImageDataSection, { ImageDataSection } from "~/parse/ImageDataSection.ts";

export default function parse(buffer: ArrayBuffer, options?: ParseOptions): PhotoshopFile {
    const ctx = new ParseContext(new DataView(buffer), 0);
    const fileHeader = parseFileHeader(ctx);
    const colorModeData = parseColorModeData(ctx, fileHeader.colorMode);
    const imageResources = parseImageResources(ctx);
    const layerAndMaskInformation = parseLayerAndMaskInformation(ctx, fileHeader.version);
    const imageDataSection = (() => {
        if (options?.skipImageDataSection) {
            return null;
        }
        return parseImageDataSection(ctx);
    })();

    return {
        fileHeader,
        colorModeData,
        imageResources,
        layerAndMaskInformation,
        imageDataSection
    };
}

export type ParseOptions = {
    skipImageDataSection?: boolean;
};

export type PhotoshopFile = {
    fileHeader: FileHeaderSection;
    colorModeData: ColorModeDataSection;
    imageResources: ImageResourcesSection;
    layerAndMaskInformation: LayerAndMaskInformationSection;
    imageDataSection: ImageDataSection | null;
};