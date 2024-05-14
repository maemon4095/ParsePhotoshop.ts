import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { Determine, Signeture } from "~/parse/AdditionalLayerInformation/helper.gen.ts";
import parseBlendMode, { SupportedBlendMode } from "~/parse/BlendMode.gen.ts";

export default function parse(ctx: ParseContext, dataLength: number): SectionDividerSetting {
    const data = parseCore(ctx, dataLength);
    return { key: SuportedAdjustmentLayerKey.SectionDividerSetting, ...data };
}

function parseCore(ctx: ParseContext, dataLength: number): Omit<SectionDividerSetting, "key"> {
    const type = parseSectionDividerType(ctx);
    if (dataLength < 12) {
        return { type };
    }
    void parseSigneture(ctx);
    const [blendMode, rawBlendMode] = parseBlendMode(ctx);
    if (dataLength < 16) {
        return { type, blendMode, rawBlendMode };
    }
    const subType = parseSectionDividerSubType(ctx);

    return { type, blendMode, rawBlendMode, subType };
}

function parseSectionDividerType(ctx: ParseContext): SectionDividerType {
    const type = ctx.peekUint32();
    if (type > 3) {
        throw new InvalidSectionDividerTypeError(ctx.byteOffset);
    }
    ctx.takeUint32();
    return type;
}

function parseSigneture(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    if (Determine.signeture(bin) !== Signeture._8BIM) {
        throw new InvalidSectionDividerSignetureError(ctx.byteOffset);
    }
    ctx.advance(4);
}

function parseSectionDividerSubType(ctx: ParseContext): SectionDividerSubType {
    const type = ctx.peekUint32();
    if (type > 1) {
        throw new InvalidSectionDividerTypeError(ctx.byteOffset);
    }
    ctx.takeUint32();
    return type;
}

export type SectionDividerSetting = {
    key: SuportedAdjustmentLayerKey.SectionDividerSetting;
    type: SectionDividerType;
    blendMode?: SupportedBlendMode,
    rawBlendMode?: Uint8Array,
    subType?: SectionDividerSubType;
};

export enum SectionDividerType {
    Other = 0,
    OpenFolder = 1,
    ClosedFolder = 2,
    BoundingSectionDivider = 3,
}

export enum SectionDividerSubType {
    Normal = 0,
    SceneGroup = 1,
}

export class InvalidSectionDividerTypeError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Section divider type must be one of Other = 0, OpenFolder = 1, ClosedFolder = 2, BoundingSectionDivider = 3.";
    }
}

export class InvalidSectionDividerSubTypeError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Section divider sub type must be one of Normal = 0, SceneGroup = 1.";
    }
}

export class InvalidSectionDividerSignetureError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Section divider signeture must be `8BIM`.";
    }
}