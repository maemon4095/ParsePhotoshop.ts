// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_72092
import { ParseContext } from "../util/parse/mod.ts";
import parseFileHeader, { FileHeaderSection } from "./FileHeaderSection.ts";
import parseColorModeData, { ColorModeDataSection } from "./ColorModeDataSection.ts";
import parseImageResources, { ImageResourcesSection } from "./ImageResourcesSection.ts";
import parseLayerAndMaskInformation, { LayerAndMaskInformationSection } from "./LayerAndMaskInformationSection.ts";
import parseImageDataSection, { ImageDataSection } from "./ImageDataSection.ts";

export { type AdditionalLayerInformation, AdjustmentLayerKey } from "./AdditionalLayerInformation/mod.ts";
export { type BlendMode } from "./BlendMode.gen.ts";
export { type ColorDepth, Version, ColorMode } from "./FileHeaderSection.ts";
export { type GlobalLayerMaskInfo } from "./GlobalLayerMaskInfo.ts";
export { type ImageChannel } from "./ImageChannel.ts";
export { ImageDataCompression } from "./ImageCompression.ts";
export { type ImageResourceBlock } from "./ImageResourceBlock.ts";
export { type LayerBlendingRanges } from "./LayerBlendingRanges.ts";
export { type LayerInfo } from "./LayerInfo.ts";
export { type LayerMask } from "./LayerMask.ts";
export { type LayerRecords, type ChannelInfo, ChannelId, ClippingMode, LayerFlags } from "./LayerRecords.ts";
export { type Rectangle } from "./Rectangle.ts";
export { SyntaxError as PhotoshopSyntaxError } from "./SyntaxError.ts";
export { type FileHeaderSection };
export { type ColorModeDataSection };
export { type ImageResourcesSection };
export { type LayerAndMaskInformationSection };

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