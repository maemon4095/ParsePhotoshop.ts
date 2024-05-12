import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { Version } from "~/parse/FileHeader.ts";
import { parse as parseBlendMode } from "~/parse/BlendMode.gen.ts";
import { parse as parseRect, Rectangle } from "~/parse/Rectangle.ts";
import { LayerMask, parse as parseLayerMask } from "~/parse/LayerMask.ts";
import { LayerBlendingRanges, parse as parseLayerBlendingRange } from "~/parse/LayerBlendingRanges.ts";
import { BlendMode } from "~/parse/BlendMode.src.ts";

export function parse(ctx: ParseContext, version: Version): LayerRecords {
    const enclosingRectangle = parseRect(ctx);
    const channelCount = ctx.takeUint16();
    const channelInfos: ChannelInfo[] = new Array(channelCount);
    for (let i = 0; i < channelCount; ++i) {
        channelInfos[i] = parseChannelInfo(ctx, version);
    }
    void parseBlendModeSigneture(ctx);
    const blendMode = parseBlendMode(ctx);
    const opacity = ctx.takeUint8();
    const clippingMode = parseClippingMode(ctx);
    const layerFlags = parseLayerFlags(ctx);
    void parseFiller(ctx);
    const extraFieldLength = ctx.takeUint32();
    const extraFieldStart = ctx.byteOffset;
    const layerMask = parseLayerMask(ctx);
    const blendingRanges = parseLayerBlendingRange(ctx);
    const layerName = aligned(parsePascalString, 4)(ctx);
    const extraFieldEnd = ctx.byteOffset;
    console.log(layerName);
    console.log(extraFieldLength);
    console.log(extraFieldEnd - extraFieldStart);
    if (extraFieldLength !== extraFieldEnd - extraFieldStart) {
        throw new ExtraDataFieldOverflowError(extraFieldStart);
    }

    return { enclosingRectangle, channelCount, blendMode, opacity, clippingMode, layerFlags, layerMask, blendingRanges, layerName };
}


function parseChannelInfo(ctx: ParseContext, version: Version): ChannelInfo {
    const id = ctx.peekInt16();
    if (id < 0) {
        if (~id >= 3) {
            throw new InvalidChannelIdError(ctx.byteOffset);
        }
    } else {
        if (id >= 3) {
            throw new InvalidChannelIdError(ctx.byteOffset);
        }
    }

    ctx.takeInt16();

    const dataLength = (() => {
        switch (version) {
            case Version.PSD:
                return BigInt(ctx.takeUint32());
            case Version.PSB:
                return ctx.takeUint64();
        }
    })();

    return { id, dataLength };
}

function parseBlendModeSigneture(ctx: ParseContext) {
    if (ctx.peekUint8() !== 0x38) { // ASCII '8'
        throw new InvalidBlendModeSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x42) { // ASCII 'B'
        throw new InvalidBlendModeSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x49) { // ASCII 'I'
        throw new InvalidBlendModeSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x4D) { // ASCII 'M'
        throw new InvalidBlendModeSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();
}

function parseClippingMode(ctx: ParseContext) {
    const mode = ctx.peekUint8();
    switch (mode) {
        case 0: case 1: break;
        default: throw new InvalidClippingModeError(ctx.byteOffset);
    }
    ctx.takeUint8();
    return mode as ClippingMode;
}

function parseLayerFlags(ctx: ParseContext): LayerFlags {
    const flags = ctx.takeUint8();
    // NO validation. Some valid Photoshop file seems to have extra flags. 
    return flags;
}

function parseFiller(ctx: ParseContext) {
    const filler = ctx.peekUint8();
    if (filler !== 0) {
        throw new InvalidFillerError(ctx.byteOffset);
    }
    ctx.takeUint8();
}

export type LayerRecords = {
    enclosingRectangle: Rectangle;
    channelCount: number;
    blendMode: BlendMode;
    opacity: number;
    clippingMode: ClippingMode;
    layerFlags: LayerFlags;
    layerMask: LayerMask;
    blendingRanges: LayerBlendingRanges;
    layerName: Uint8Array;
};

export type ChannelInfo = {
    id: ChannelId;
    dataLength: bigint;
};

export enum ChannelId {
    Red = 0,
    Green = 1,
    Blue = 2,
    TransparencyMask = -1,
    UserLayerMask = -2,
    RealUserLayerMask = -3
}

export enum ClippingMode {
    Base = 0,
    NonBase = 1
}

export enum LayerFlags {
    TransparencyProtected = 1 << 0,
    Visible = 1 << 1,
    Obsolete = 1 << 2,
    PhotoshopVersionLater5 = 1 << 3,
    PixelDataIrrelevant = 1 << 4,
}

export class InvalidChannelIdError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Channel id is must be one of 0, 1, 2, -1, -2, -3";
    }
}

export class InvalidBlendModeSignetureError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Blend mode signeture must be `8BIM`";
    }
}

export class InvalidClippingModeError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Clipping mode must be 0(base) or 1(non-base).";
    }
}

export class InvalidFillerError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Filler must be 0.";
    }
}

export class ExtraDataFieldOverflowError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Extra data field overflows.";
    }
}