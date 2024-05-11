import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { FileHeader, Version } from "~/parse/FileHeader.ts";
import { parse as parseBlendMode } from "~/parse/BlendMode.gen.ts";

export function parse(ctx: ParseContext, version: Version): LayerRecord {
    const containingRectangle = parseRect(ctx);
    const channelCount = ctx.takeUint16();
    const channelInfos: ChannelInfo[] = new Array(channelCount);
    for (let i = 0; i < channelCount; ++i) {
        channelInfos[i] = parseChannelInfo(ctx, version);
    }
    void parseBlendModeSigneture(ctx);
    const mode = parseBlendMode(ctx);

    throw new Error("TODO");
}

function parseRect(ctx: ParseContext): Rectangle {
    const top = ctx.takeUint32();
    const left = ctx.takeUint32();
    const bottom = ctx.takeUint32();
    const right = ctx.takeUint32();
    return { top, left, bottom, right };
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

export type LayerRecord = {
    containingRectangle: Rectangle;
};

export type Rectangle = {
    top: number;
    left: number;
    bottom: number;
    right: number;
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

export enum BlendModeKey {
    PassThrough = "pass",
    Normal = "norm",
    Dissolve = "diss",
    Darken = "dark",
    Multiply = "mul ",
    ColorBurn = "idiv",
    LinearBurn = "lbrn",
    DarkerColor = "dkCl",
    Lighten = "lite",
    Screen = "scrn",
    ColorDodge = "div ",
    LinearDodge = "lddg",
    LighterColor = "lgCl",
    Overlay = "over",
    SoftLight = "sLit",
    HardLight = "hLit",
    VividLight = "vLit",
    LinearLight = "lLit",
    PinLight = "pLit",
    HardMix = "hMix",
    Difference = "diff",
    Exclusion = "smud",
    Subtract = "fsub",
    Divide = "fdiv",
    Hue = "hue ",
    Saturation = "sat ",
    Color = "colr",
    Luminosity = "lum "
}

export class InvalidChannelIdError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = "Channel is must be one of 0, 1, 2, -1, -2, -3";
    }
}

export class InvalidBlendModeSignetureError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = "Blend mode signeture must be `8BIM`";
    }
}