import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

export default function parse(ctx: ParseContext): FileHeaderSection {
    void parseSigneture(ctx);
    const version = parseVersion(ctx);
    void parseReserved(ctx);
    const channelCount = parseChannelCount(ctx);
    const height = parseImageHeight(ctx, version);
    const width = parseImageWidth(ctx, version);
    const colorDepth = parseColorDepth(ctx);
    const colorMode = parseColorMode(ctx);

    return { version, channelCount, height, width, colorDepth, colorMode };
}

function parseSigneture(ctx: ParseContext) {
    if (ctx.peekUint8() !== 0x38) { // ASCII '8'
        throw new InvalidSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x42) { // ASCII 'B'
        throw new InvalidSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x50) { // ASCII 'P'
        throw new InvalidSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x53) { // ASCII 'S'
        throw new InvalidSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();
}

function parseVersion(ctx: ParseContext) {
    const version = ctx.peekUint16();
    if (version !== 1 && version !== 2) {
        throw new InvalidVersionError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return version as Version;
}

function parseReserved(ctx: ParseContext) {
    // TODO: add relax mode. allow reserved area to be any value.
    if (ctx.peekUint16() !== 0) {
        throw new InvalidReservedAreaError(ctx.byteOffset);
    }
    ctx.takeInt16();

    if (ctx.peekUint16() !== 0) {
        throw new InvalidReservedAreaError(ctx.byteOffset);
    }
    ctx.takeInt16();

    if (ctx.peekUint16() !== 0) {
        throw new InvalidReservedAreaError(ctx.byteOffset);
    }
    ctx.takeInt16();
}

function parseChannelCount(ctx: ParseContext) {
    const count = ctx.peekUint16();
    if (count < 1 || 56 < count) {
        throw new InvalidChannelCountError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return count;
}

function parseImageHeight(ctx: ParseContext, version: Version) {
    const height = ctx.peekUint32();
    switch (version) {
        case Version.PSD:
            if (height > PSDImageHeightMax) {
                throw new InvalidHeightError(ctx.byteOffset, version);
            }
            break;
        case Version.PSB:
            if (height > PSBImageHeithtMax) {
                throw new InvalidHeightError(ctx.byteOffset, version);
            }
            break;
    }
    ctx.takeUint32();
    return height;
}

function parseImageWidth(ctx: ParseContext, version: Version) {
    const width = ctx.peekUint32();
    switch (version) {
        case Version.PSD:
            if (width > PSDImageWidthMax) {
                throw new InvalidHeightError(ctx.byteOffset, version);
            }
            break;
        case Version.PSB:
            if (width > PSBImageWidthMax) {
                throw new InvalidHeightError(ctx.byteOffset, version);
            }
            break;
    }
    ctx.takeUint32();
    return width;
}

function parseColorDepth(ctx: ParseContext): ColorDepth {
    const depth = ctx.peekUint16();
    switch (depth) {
        case 1:
        case 8:
        case 16:
        case 32:
            break;
        default:
            throw new InvalidDepthError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return depth;
}

function parseColorMode(ctx: ParseContext): ColorMode {
    const mode = ctx.peekUint16();
    switch (mode) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 7:
        case 8:
        case 9: break;
        default:
            throw new InvalidColorModeError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return mode;
}

/** The first section of Photoshop file */
export type FileHeaderSection = {
    version: Version;
    /** Channel count in the image, including any alpha channels. Supported range is 1 to 56. */
    channelCount: number;
    /** Height of the image in pixels. PSD: 1 to 30,000, PSB: 1 to 300,000. */
    height: number;
    /** Width of the image in pixels. PSD: 1 to 30,000, PSB: 1 to 300,000. */
    width: number;
    colorDepth: ColorDepth;
    colorMode: ColorMode;
};

export enum Version {
    PSD = 1,
    PSB = 2
}

/** bits per channel */
export type ColorDepth = 1 | 8 | 16 | 32;

export enum ColorMode {
    Bitmap = 0,
    Grayscale = 1,
    Indexed = 2,
    RGB = 3,
    CMYK = 4,
    Multichannel = 7,
    Duotone = 8,
    Lab = 9
}

export const PSDImageHeightMax = 30_000;
export const PSDImageWidthMax = 30_000;
export const PSBImageHeithtMax = 300_000;
export const PSBImageWidthMax = 300_000;

export class InvalidSignetureError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "PSD file must have `8BPS` signeture.";
    }
}

export class InvalidVersionError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "PSD version must be 1 and PSB version must be 2";
    }
}

export class InvalidReservedAreaError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Reserved area must be filled by 0.";
    }
}

export class InvalidChannelCountError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Channel count must be in 1 to 56.";
    }
}

export class InvalidHeightError extends SyntaxError {
    constructor(offset: number, version: Version) {
        super(offset);
        this.message = version === Version.PSD ?
            `PSD image height must be in 1 to ${PSDImageHeightMax}.`
            : `PSB image height must be in 1 to ${PSBImageHeithtMax}.`;
    }
}

export class InvalidWidthError extends SyntaxError {
    constructor(offset: number, version: Version) {
        super(offset);
        this.message = version === Version.PSD ?
            `PSD image width must be in 1 to ${PSDImageWidthMax}.`
            : `PSB image width must be in 1 to ${PSBImageWidthMax}.`;
    }
}

export class InvalidDepthError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Depth(bits per channel) must be one of 1, 8, 16 or 32.";
    }
}

export class InvalidColorModeError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Color mode must be one of Bitmap(0), Grayscale(1), Indexed(2), RGB(3), CMYK(4), Multichannel(7), Duotone(8), Lab(9).";
    }
}