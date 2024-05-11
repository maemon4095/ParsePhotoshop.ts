import { ParseContext } from "~/util/parse/mod.ts";
import { createBinaryTable } from "~/util/bin/mod.ts";
import { createMarkerDecorator } from "$/tools/SourceGenerator/util.ts";

const trie = createMarkerDecorator();
class Trie {
    @trie({
        "pass": 0,
        "norm": 1,
        "diss": 2,
        "dark": 3,
        "mul ": 4,
        "idiv": 5,
        "lbrn": 6,
        "dkCl": 7,
        "lite": 8,
        "scrn": 9,
        "div ": 10,
        "lddg": 11,
        "lgCl": 12,
        "over": 13,
        "sLit": 14,
        "hLit": 15,
        "vLit": 16,
        "lLit": 17,
        "pLit": 18,
        "hMix": 19,
        "diff": 20,
        "smud": 21,
        "fsub": 22,
        "fdiv": 23,
        "hue ": 24,
        "sat ": 25,
        "colr": 26,
        "lum ": 27
    })
    static determine(_seq: Uint8Array): undefined | number {
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
