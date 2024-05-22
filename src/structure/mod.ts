import { decode as decodeText } from "../util/encoding/mod.ts";
import {
    AdjustmentLayerKey, ParseOptions, PhotoshopFile, ClippingMode,
    LayerRecords, ImageChannel, ImageResourceBlock, ColorDepth,
    ColorMode, Version, AdditionalLayerInformation, GlobalLayerMaskInfo,
    LayerFlags, BlendMode, ImageDataCompression, default as parsePhotoshop
} from "../parse/mod.ts";
import { SectionDividerSetting, SectionDividerType } from "../parse/AdditionalLayerInformation/SectionDividerSetting.ts";
import { decodeLayer } from "../decoding/mod.ts";

export type {
    AdditionalLayerInformation, ImageResourceBlock,
    ColorDepth, GlobalLayerMaskInfo,
};

export {
    BlendMode, ImageDataCompression, ClippingMode, Version, ColorMode,
};

const END_OF_GROUP = Symbol();

export function parse(buffer: ArrayBuffer, options?: ParseOptions): Photoshop {
    const file = parsePhotoshop(buffer, options);
    return constructPhotoshopStructureFrom(file);
}
// FIXME: クリッピングを構造に反映する。
export function constructPhotoshopStructureFrom(file: PhotoshopFile): Photoshop {
    const colorModeData = file.colorModeData.data;
    const { height, width, channelCount, colorDepth, colorMode, version } = file.fileHeader;
    const imageData: PhotoshopImageData | null = file.imageDataSection;
    const blocks = file.imageResources.blocks;
    const layerRecords = file.layerAndMaskInformation.layerInfo?.layerRecords ?? [];
    const perLayerImages = file.layerAndMaskInformation.layerInfo?.perLayerChannels ?? [];
    const { roots: children, layers } = collectRoots(file, layerRecords, perLayerImages);
    const { additionalLayerInformations, globalLayerMaskInfo } = file.layerAndMaskInformation;
    const psd = {
        type: "Photoshop",
        width, height, channelCount, colorDepth, colorMode, version,
        colorModeData,
        imageData,
        imageResources: { blocks },
        children,
        layers,
        additionalLayerInformations,
        globalLayerMaskInfo
    } as Photoshop;

    for (let i = 0; i < children.length; ++i) {
        children[i].parent = psd;
    }

    return psd;
}

export function getPhotoshop(node: Layer | Group | Photoshop): Photoshop {
    while (node.type !== "Photoshop") {
        node = node.parent;
    }
    return node;
}

type Optional<T, K extends keyof T> = Omit<T, K> & { [p in K]?: T[p] };

function collectRoots(file: PhotoshopFile, layerRecords: LayerRecords[], perLayerChannels: ImageChannel[][]): {
    roots: (Optional<Group, "parent"> | Optional<Layer, "parent">)[];
    layers: Layer[];
} {
    // layer は最も背面から並んでいるため、最上面からに並び替え。
    layerRecords = layerRecords.toReversed();
    perLayerChannels = perLayerChannels.toReversed();
    const layers: Layer[] = [];
    const roots: (Optional<Group, "parent"> | Optional<Layer, "parent">)[] = [];
    const groupStack: Optional<Group, "parent">[] = [];

    for (let i = 0; i < layerRecords.length; ++i) {
        const node = processRecord(file, layerRecords[i], perLayerChannels[i]);

        if (node === END_OF_GROUP) {
            const group = groupStack.pop()!;
            const parent = groupStack[groupStack.length - 1];
            if (parent === undefined) {
                roots.push(group);
            } else {
                group.parent = parent as Group;
                parent.children.push(group as Group);
            }
            continue;
        }

        if (node.type === "Layer") {
            const parent = groupStack[groupStack.length - 1];
            if (parent === undefined) {
                roots.push(node);
            } else {
                node.parent = parent as Group;
                parent.children.push(node as Layer);
            }
            layers.push(node as Layer);
        } else {
            groupStack.push(node);
        }
    }
    if (groupStack.length !== 0) {
        console.warn("group does not closed properly.");

        const g = groupStack.reduceRight((r, l) => {
            l.children.push(r as Group);
            return l;
        });

        roots.push(g);
    }

    return { roots, layers };
}

function processRecord(file: PhotoshopFile, records: LayerRecords, channels: ImageChannel[]): Optional<Layer, "parent"> | Optional<Group, "parent"> | typeof END_OF_GROUP {
    let name: string | null = null;
    let dividerSettings: SectionDividerSetting | null = null;
    for (const info of records.additionalLayerInformations) {
        switch (info.key) {
            case AdjustmentLayerKey.Unknown:
                continue;
            case AdjustmentLayerKey.UnicodeLayerName: {
                name = info.name;
                break;
            }
            case AdjustmentLayerKey.SectionDividerSetting: {
                dividerSettings = info;
                break;
            }
            default: break;
        }
    }

    if (name === null) {
        name = decodeText(records.layerName);
    }
    const imageData = decodeLayer(file, records, channels);
    const layerProps: Omit<LayerProperties, "parent"> = {
        name,
        imageData,
        opacity: records.opacity,
        blendMode: records.blendMode,
        clippingMode: records.clippingMode,
        visible: (records.layerFlags & LayerFlags.Invisible) !== LayerFlags.Invisible,
        additionalInformations: records.additionalLayerInformations,
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

export type Photoshop = {
    type: "Photoshop",
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
    /** all layers in top to bottom order. */
    layers: Layer[];
    additionalLayerInformations: AdditionalLayerInformation[];
    globalLayerMaskInfo: GlobalLayerMaskInfo | null;
};

export type PhotoshopImageData = {
    compression: ImageDataCompression;
    data: Uint8Array;
};

export type ImageResources = {
    blocks: ImageResourceBlock[];
};

export type LayerProperties = {
    name: string;
    visible: boolean;
    top: number;
    bottom: number;
    left: number;
    right: number;
    /** 0 = transparent, 255 = opaque. */
    opacity: number;
    clippingMode: ClippingMode,
    blendMode: BlendMode;
    imageData: null | ImageData,
    parent: Group | Photoshop;
    additionalInformations: AdditionalLayerInformation[];
};

export type Layer = {
    type: "Layer";
} & LayerProperties;

export type Group = {
    type: "Group";
    isOpen: boolean;
    children: (Layer | Group)[];
} & LayerProperties;

export type PhotoshopNode = Layer | Group | Photoshop;