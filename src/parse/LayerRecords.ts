import { ParseContext, aligned, measured } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { FileHeader, Version } from "~/parse/FileHeader.ts";
import { parse as parseBlendMode } from "~/parse/BlendMode.gen.ts";
import { parse as parseRect, Rectangle } from "~/parse/Rectangle.ts";
import { parse as parseLayerMask } from "~/parse/LayerMask.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

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


    throw new Error("TODO");
}


function parseChannelInfo(ctx: ParseContext, version: Version): ChannelInfo {
    const id = ctx.peekUint16();
    if (id < 0) {
        if (~id >= 3) {
            throw new InvalidChannelIdError(ctx.byteOffset);
        }
    } else {
        if (id >= 3) {
            throw new InvalidChannelIdError(ctx.byteOffset);
        }
    }
    ctx.takeUint16();

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

function parseLayerFlags(ctx: ParseContext) {
    const flags = ctx.peekUint8();
    // bit-0 to bit-4 flags. 
    // max value = 2^0 + 2^1 + 2^2 + 2^3 + 2^4 = 2^5 - 1
    if (flags >= (1 << 5)) { // flags > 2^5 - 1
        throw new InvalidLayerFlagsError(ctx.byteOffset);
    }
    ctx.takeUint8();
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
    PositionRelativeToLayer = 1 << 0,
    LayerMaskDisabled = 1 << 1,
    /** Obsolete */
    InvertLayerMaskWenBlending = 1 << 2,
    /** indicates that the user mask actually came from rendering other data */
    ExternalUserMask = 1 << 3,
    /**  indicates that the user and/or vector masks have parameters applied to them */
    MasksHasParameters = 1 << 4,
}

export class InvalidChannelIdError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Channel is must be one of 0, 1, 2, -1, -2, -3";
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

export class InvalidLayerFlagsError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Layer flags must be in 0 to 31.";
    }
}

export class InvalidFillerError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Filler must be 0.";
    }
}