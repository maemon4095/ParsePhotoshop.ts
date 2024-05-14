import { ParseContext } from "~/util/parse/mod.ts";
import { _trie } from "$/tools/GenerateTrie/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

export default function parse(ctx: ParseContext): [SupportedBlendMode, Uint8Array] {
    const bin = ctx.takeUint8Array(4);
    const mode = Trie.determine(bin);
    if (mode === undefined) {
        console.warn("Unsupported blend mode was detected.");
    }
    return [mode ?? SupportedBlendMode.Unsupported, bin];
}
class Trie {
    @_trie({
        "pass": SupportedBlendMode.PassThrough,
        "norm": SupportedBlendMode.Normal,
        "diss": SupportedBlendMode.Dissolve,
        "dark": SupportedBlendMode.Darken,
        "mul ": SupportedBlendMode.Multiply,
        "idiv": SupportedBlendMode.ColorBurn,
        "lbrn": SupportedBlendMode.LinearBurn,
        "dkCl": SupportedBlendMode.DarkerColor,
        "lite": SupportedBlendMode.Lighten,
        "scrn": SupportedBlendMode.Screen,
        "div ": SupportedBlendMode.ColorDodge,
        "lddg": SupportedBlendMode.LinearDodge,
        "lgCl": SupportedBlendMode.LighterColor,
        "over": SupportedBlendMode.Overlay,
        "sLit": SupportedBlendMode.SoftLight,
        "hLit": SupportedBlendMode.HardLight,
        "vLit": SupportedBlendMode.VividLight,
        "lLit": SupportedBlendMode.LinearLight,
        "pLit": SupportedBlendMode.PinLight,
        "hMix": SupportedBlendMode.HardMix,
        "diff": SupportedBlendMode.Difference,
        "smud": SupportedBlendMode.Exclusion,
        "fsub": SupportedBlendMode.Subtract,
        "fdiv": SupportedBlendMode.Divide,
        "hue ": SupportedBlendMode.Hue,
        "sat ": SupportedBlendMode.Saturation,
        "colr": SupportedBlendMode.Color,
        "lum ": SupportedBlendMode.Luminosity
    })
    static determine(_seq: Uint8Array): undefined | SupportedBlendMode {
        throw new Error("not generated.");
    }
}

export enum SupportedBlendMode {
    Unsupported,
    PassThrough, // adjustment layer can affect any below layers
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


export class InvalidBlendModeError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Unexpected blend mode value.";
    }
}