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
        "pass": BlendMode.PassThrough,
        "norm": BlendMode.Normal,
        "diss": BlendMode.Dissolve,
        "dark": BlendMode.Darken,
        "mul ": BlendMode.Multiply,
        "idiv": BlendMode.ColorBurn,
        "lbrn": BlendMode.LinearBurn,
        "dkCl": BlendMode.DarkerColor,
        "lite": BlendMode.Lighten,
        "scrn": BlendMode.Screen,
        "div ": BlendMode.ColorDodge,
        "lddg": BlendMode.LinearDodge,
        "lgCl": BlendMode.LighterColor,
        "over": BlendMode.Overlay,
        "sLit": BlendMode.SoftLight,
        "hLit": BlendMode.HardLight,
        "vLit": BlendMode.VividLight,
        "lLit": BlendMode.LinearLight,
        "pLit": BlendMode.PinLight,
        "hMix": BlendMode.HardMix,
        "diff": BlendMode.Difference,
        "smud": BlendMode.Exclusion,
        "fsub": BlendMode.Subtract,
        "fdiv": BlendMode.Divide,
        "hue ": BlendMode.Hue,
        "sat ": BlendMode.Saturation,
        "colr": BlendMode.Color,
        "lum ": BlendMode.Luminosity
    })
    static determine(_seq: Uint8Array): undefined | BlendMode {
        throw new Error("not generated.");
    }
}

export enum BlendMode {
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