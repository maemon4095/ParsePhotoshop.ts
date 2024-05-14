import { ParseOptions, PhotoshopFile } from "~/parse/mod.ts";
import { LayerRecords } from "~/parse/LayerRecords.ts";
import { ImageChannel } from "~/parse/ImageChannel.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { decode as decodeText } from "~/util/encoding/mod.ts";
import { SectionDividerSetting, SectionDividerType } from "~/parse/AdditionalLayerInformation/SectionDividerSetting.ts";
import { ImageDataRLE } from "~/parse/ImageDataSection.ts";
import { ImageDataRaw } from "~/parse/ImageDataSection.ts";
import { ImageResourceBlock } from "~/parse/ImageResourceBlock.ts";
import { ColorDepth, ColorMode, Version } from "~/parse/FileHeaderSection.ts";
import { AdditionalLayerInformation } from "~/parse/AdditionalLayerInformation/mod.ts";
import { GlobalLayerMaskInfo } from "~/parse/GlobalLayerMaskInfo.ts";
import { LayerFlags } from "~/parse/LayerRecords.ts";
import { SupportedBlendMode } from "~/parse/BlendMode.gen.ts";
import parsePhotoshop from "~/parse/mod.ts";
export type { Rectangle } from "~/parse/Rectangle.ts";
export type { ClippingMode } from "~/parse/LayerRecords.ts";
export type { LayerBlendingRanges } from "~/parse/LayerBlendingRanges.ts";

export type PhotoshopStrucuture = {
    height: number;
    width: number;
    channelCount: number;
    colorDepth: ColorDepth;
    colorMode: ColorMode;
    version: Version;
    colorModeData: Uint8Array;
    imageResources: ImageResources;
    imageData: PhotoshopImageData | null;
    children: (Group | Layer)[];
    layers: Layer[];
    additionalLayerInformations: AdditionalLayerInformation[];
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
};

export type PhotoshopImageData = ImageDataRLE | ImageDataRaw;
export type ImageResources = {
    blocks: ImageResourceBlock[];
};

const END_OF_GROUP = Symbol();

export function parse(buffer: ArrayBuffer, options?: ParseOptions): PhotoshopStrucuture {
    const file = parsePhotoshop(buffer, options);
    return constructPhotoshopStructureFrom(file);
}

export function constructPhotoshopStructureFrom(photoshopFile: PhotoshopFile): PhotoshopStrucuture {
    const colorModeData = photoshopFile.colorModeData.data;
    const { height, width, channelCount, colorDepth, colorMode, version } = photoshopFile.fileHeader;
    const imageData: PhotoshopImageData | null = photoshopFile.imageDataSection;
    const blocks = photoshopFile.imageResources.blocks;
    const layerRecords = photoshopFile.layerAndMaskInformation.layerInfo?.layerRecords ?? [];
    const perLayerImages = photoshopFile.layerAndMaskInformation.layerInfo?.perLayerChannels ?? [];
    const { roots: children, layers } = collectRoots(layerRecords, perLayerImages);
    const { additionalLayerInformations, globalLayerMaskInfo } = photoshopFile.layerAndMaskInformation;

    return {
        width, height, channelCount, colorDepth, colorMode, version,
        colorModeData,
        imageData,
        imageResources: { blocks },
        children,
        layers,
        additionalLayerInformations,
        globalLayerMaskInfo
    };
}

function collectRoots(layerRecords: LayerRecords[], perLayerChannels: ImageChannel[][]): {
    roots: (Group | Layer)[];
    layers: Layer[];
} {
    // layer は最も背面から並んでいる。
    layerRecords = layerRecords.toReversed();
    perLayerChannels = perLayerChannels.toReversed();
    const layers: Layer[] = [];
    const roots: (Group | Layer)[] = [];
    const groupStack: Group[] = [];

    for (let i = 0; i < layerRecords.length; ++i) {
        const node = processRecord(layerRecords[i], perLayerChannels[i]);

        if (node === END_OF_GROUP) {
            const group = groupStack.pop()!;
            const parent = (groupStack[0]?.children ?? roots);
            parent.push(group);
            continue;
        }

        if (node.type === "Layer") {
            const group = groupStack[groupStack.length - 1];
            const parent = (group?.children ?? roots);
            parent.push(node);
            layers.push(node);
        } else {
            groupStack.push(node);
        }
    }
    if (groupStack.length !== 0) {
        console.warn("group does not closed properly.");

        const g = groupStack.reduceRight((r, l) => {
            l.children.push(r);
            return l;
        });

        roots.push(g);
    }

    return { roots, layers };
}

function processRecord(records: LayerRecords, channels: ImageChannel[]): Layer | Group | typeof END_OF_GROUP {
    let name: string | null = null;
    let dividerSettings: SectionDividerSetting | null = null;
    for (const info of records.additionalLayerInformations) {
        switch (info.key) {
            case SuportedAdjustmentLayerKey.Unsupported:
                continue;
            case SuportedAdjustmentLayerKey.UnicodeLayerName: {
                name = info.name;
                break;
            }
            case SuportedAdjustmentLayerKey.SectionDividerSetting: {
                dividerSettings = info;
                break;
            }
            default: break;
        }
    }

    if (name === null) {
        name = decodeText(records.layerName);
    }
    const layerProps: LayerProperties = {
        name,
        channels,
        blendMode: records.blendMode,
        opacity: records.opacity,
        visible: (records.layerFlags & LayerFlags.Visible) === LayerFlags.Visible,
        ...records.enclosingRectangle,
    };
    if (dividerSettings === null || dividerSettings.type === SectionDividerType.Other) {
        return {
            type: "Layer",
            ...layerProps
        };
    }
    if (dividerSettings.type === SectionDividerType.BoundingSectionDivider) {
        return END_OF_GROUP;
    }

    // group's blend mode seems to be always BlendMode.Normal
    // Therefore override blend mode if set
    if (dividerSettings.blendMode !== undefined) {
        layerProps.blendMode = dividerSettings.blendMode;
    }
    return {
        type: "Group",
        isOpen: dividerSettings.type === SectionDividerType.OpenFolder,
        children: [],
        ...layerProps,
    };
}

export type LayerProperties = {
    name: string;
    visible: boolean;
    top: number;
    bottom: number;
    left: number;
    right: number;
    opacity: number;
    blendMode: SupportedBlendMode;
    channels: ImageChannel[];
};

export type Layer = {
    type: "Layer";
} & LayerProperties;

export type Group = {
    type: "Group";
    isOpen: boolean;
    children: (Layer | Group)[];
} & LayerProperties;

export type {
    ImageChannel,
    SuportedAdjustmentLayerKey, ImageDataRLE,
    ImageDataRaw, ImageResourceBlock,
    ColorDepth, ColorMode,
    Version, AdditionalLayerInformation,
    SupportedBlendMode,
    ParseOptions
};
