import { ParseContext } from "~/util/parse/mod.ts";
import { _trie } from "$/tools/GenerateTrie/mod.ts";

export function parse(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    const mode = Trie.determine(bin);
    if (mode === undefined) {
        throw new InvalidBlendModeError(ctx.byteOffset);
    }
    ctx.advance(4);
    return mode;
}

class Trie {
    @_trie({
        "pass": BlendModeKey.PassThrough,
        "norm": BlendModeKey.Normal,
        "diss": BlendModeKey.Dissolve,
        "dark": BlendModeKey.Darken,
        "mul ": BlendModeKey.Multiply,
        "idiv": BlendModeKey.ColorBurn,
        "lbrn": BlendModeKey.LinearBurn,
        "dkCl": BlendModeKey.DarkerColor,
        "lite": BlendModeKey.Lighten,
        "scrn": BlendModeKey.Screen,
        "div ": BlendModeKey.ColorDodge,
        "lddg": BlendModeKey.LinearDodge,
        "lgCl": BlendModeKey.LighterColor,
        "over": BlendModeKey.Overlay,
        "sLit": BlendModeKey.SoftLight,
        "hLit": BlendModeKey.HardLight,
        "vLit": BlendModeKey.VividLight,
        "lLit": BlendModeKey.LinearLight,
        "pLit": BlendModeKey.PinLight,
        "hMix": BlendModeKey.HardMix,
        "diff": BlendModeKey.Difference,
        "smud": BlendModeKey.Exclusion,
        "fsub": BlendModeKey.Subtract,
        "fdiv": BlendModeKey.Divide,
        "hue ": BlendModeKey.Hue,
        "sat ": BlendModeKey.Saturation,
        "colr": BlendModeKey.Color,
        "lum ": BlendModeKey.Luminosity
    })
    static determine(_seq: Uint8Array): undefined | BlendModeKey {
        throw new Error("not generated.");
    }
}

export enum BlendModeKey {
    PassThrough,
    Normal,
    Dissolve,
    Darken,
    Multiply,
    ColorBurn,
    LinearBurn,
    DarkerColor,
    Lighten,
    Screen,
    ColorDodge,
    LinearDodge,
    LighterColor,
    Overlay,
    SoftLight,
    HardLight,
    VividLight,
    LinearLight,
    PinLight,
    HardMix,
    Difference,
    Exclusion,
    Subtract,
    Divide,
    Hue,
    Saturation,
    Color,
    Luminosity,
}


export class InvalidBlendModeError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = "Unexpected blend mode value.";
    }
}