/*
    this file is generated by source generator.
                DO NOT EDIT.
*/
import { ParseContext } from "../util/parse/mod.ts";
import { _trie } from "../../tools/GenerateTrie/mod.ts";
import { SyntaxError } from "./SyntaxError.ts";

export default function parse(ctx: ParseContext): [BlendMode, Uint8Array] {
    const bin = ctx.takeUint8Array(4);
    const mode = Trie.determine(bin);
    if (mode === undefined) {
        console.warn("Unknown blend mode was detected.");
    }
    return [mode ?? BlendMode.Unknown, bin];
}
class Trie {static determine(_seq: Uint8Array): undefined | BlendMode { return ((_) => {switch(_[0]){case 112:switch(_[1]){case 97:switch(_[2]){case 115:switch(_[3]){case 115:return BlendMode.PassThrough;default:return undefined;}default:return undefined;}case 76:switch(_[2]){case 105:switch(_[3]){case 116:return BlendMode.PinLight;default:return undefined;}default:return undefined;}default:return undefined;}case 110:switch(_[1]){case 111:switch(_[2]){case 114:switch(_[3]){case 109:return BlendMode.Normal;default:return undefined;}default:return undefined;}default:return undefined;}case 100:switch(_[1]){case 105:switch(_[2]){case 115:switch(_[3]){case 115:return BlendMode.Dissolve;default:return undefined;}case 118:switch(_[3]){case 32:return BlendMode.ColorDodge;default:return undefined;}case 102:switch(_[3]){case 102:return BlendMode.Difference;default:return undefined;}default:return undefined;}case 97:switch(_[2]){case 114:switch(_[3]){case 107:return BlendMode.Darken;default:return undefined;}default:return undefined;}case 107:switch(_[2]){case 67:switch(_[3]){case 108:return BlendMode.DarkerColor;default:return undefined;}default:return undefined;}default:return undefined;}case 109:switch(_[1]){case 117:switch(_[2]){case 108:switch(_[3]){case 32:return BlendMode.Multiply;default:return undefined;}default:return undefined;}default:return undefined;}case 105:switch(_[1]){case 100:switch(_[2]){case 105:switch(_[3]){case 118:return BlendMode.ColorBurn;default:return undefined;}default:return undefined;}default:return undefined;}case 108:switch(_[1]){case 98:switch(_[2]){case 114:switch(_[3]){case 110:return BlendMode.LinearBurn;default:return undefined;}default:return undefined;}case 105:switch(_[2]){case 116:switch(_[3]){case 101:return BlendMode.Lighten;default:return undefined;}default:return undefined;}case 100:switch(_[2]){case 100:switch(_[3]){case 103:return BlendMode.LinearDodge;default:return undefined;}default:return undefined;}case 103:switch(_[2]){case 67:switch(_[3]){case 108:return BlendMode.LighterColor;default:return undefined;}default:return undefined;}case 76:switch(_[2]){case 105:switch(_[3]){case 116:return BlendMode.LinearLight;default:return undefined;}default:return undefined;}case 117:switch(_[2]){case 109:switch(_[3]){case 32:return BlendMode.Luminosity;default:return undefined;}default:return undefined;}default:return undefined;}case 115:switch(_[1]){case 99:switch(_[2]){case 114:switch(_[3]){case 110:return BlendMode.Screen;default:return undefined;}default:return undefined;}case 76:switch(_[2]){case 105:switch(_[3]){case 116:return BlendMode.SoftLight;default:return undefined;}default:return undefined;}case 109:switch(_[2]){case 117:switch(_[3]){case 100:return BlendMode.Exclusion;default:return undefined;}default:return undefined;}case 97:switch(_[2]){case 116:switch(_[3]){case 32:return BlendMode.Saturation;default:return undefined;}default:return undefined;}default:return undefined;}case 111:switch(_[1]){case 118:switch(_[2]){case 101:switch(_[3]){case 114:return BlendMode.Overlay;default:return undefined;}default:return undefined;}default:return undefined;}case 104:switch(_[1]){case 76:switch(_[2]){case 105:switch(_[3]){case 116:return BlendMode.HardLight;default:return undefined;}default:return undefined;}case 77:switch(_[2]){case 105:switch(_[3]){case 120:return BlendMode.HardMix;default:return undefined;}default:return undefined;}case 117:switch(_[2]){case 101:switch(_[3]){case 32:return BlendMode.Hue;default:return undefined;}default:return undefined;}default:return undefined;}case 118:switch(_[1]){case 76:switch(_[2]){case 105:switch(_[3]){case 116:return BlendMode.VividLight;default:return undefined;}default:return undefined;}default:return undefined;}case 102:switch(_[1]){case 115:switch(_[2]){case 117:switch(_[3]){case 98:return BlendMode.Subtract;default:return undefined;}default:return undefined;}case 100:switch(_[2]){case 105:switch(_[3]){case 118:return BlendMode.Divide;default:return undefined;}default:return undefined;}default:return undefined;}case 99:switch(_[1]){case 111:switch(_[2]){case 108:switch(_[3]){case 114:return BlendMode.Color;default:return undefined;}default:return undefined;}default:return undefined;}default:return undefined;}})(_seq); }
}

export enum BlendMode {
    Unknown,
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