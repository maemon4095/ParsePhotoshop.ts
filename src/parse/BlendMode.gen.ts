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

class Trie {static determine(_seq: Uint8Array): undefined | BlendModeKey { return ((__array) => {switch(__array[0]){case 112:switch(__array[1]){case 97:switch(__array[2]){case 115:switch(__array[3]){case 115:return BlendModeKey.PassThrough;default:return undefined;}default:return undefined;}case 76:switch(__array[2]){case 105:switch(__array[3]){case 116:return BlendModeKey.PinLight;default:return undefined;}default:return undefined;}default:return undefined;}case 110:switch(__array[1]){case 111:switch(__array[2]){case 114:switch(__array[3]){case 109:return BlendModeKey.Normal;default:return undefined;}default:return undefined;}default:return undefined;}case 100:switch(__array[1]){case 105:switch(__array[2]){case 115:switch(__array[3]){case 115:return BlendModeKey.Dissolve;default:return undefined;}case 118:switch(__array[3]){case 32:return BlendModeKey.ColorDodge;default:return undefined;}case 102:switch(__array[3]){case 102:return BlendModeKey.Difference;default:return undefined;}default:return undefined;}case 97:switch(__array[2]){case 114:switch(__array[3]){case 107:return BlendModeKey.Darken;default:return undefined;}default:return undefined;}case 107:switch(__array[2]){case 67:switch(__array[3]){case 108:return BlendModeKey.DarkerColor;default:return undefined;}default:return undefined;}default:return undefined;}case 109:switch(__array[1]){case 117:switch(__array[2]){case 108:switch(__array[3]){case 32:return BlendModeKey.Multiply;default:return undefined;}default:return undefined;}default:return undefined;}case 105:switch(__array[1]){case 100:switch(__array[2]){case 105:switch(__array[3]){case 118:return BlendModeKey.ColorBurn;default:return undefined;}default:return undefined;}default:return undefined;}case 108:switch(__array[1]){case 98:switch(__array[2]){case 114:switch(__array[3]){case 110:return BlendModeKey.LinearBurn;default:return undefined;}default:return undefined;}case 105:switch(__array[2]){case 116:switch(__array[3]){case 101:return BlendModeKey.Lighten;default:return undefined;}default:return undefined;}case 100:switch(__array[2]){case 100:switch(__array[3]){case 103:return BlendModeKey.LinearDodge;default:return undefined;}default:return undefined;}case 103:switch(__array[2]){case 67:switch(__array[3]){case 108:return BlendModeKey.LighterColor;default:return undefined;}default:return undefined;}case 76:switch(__array[2]){case 105:switch(__array[3]){case 116:return BlendModeKey.LinearLight;default:return undefined;}default:return undefined;}case 117:switch(__array[2]){case 109:switch(__array[3]){case 32:return BlendModeKey.Luminosity;default:return undefined;}default:return undefined;}default:return undefined;}case 115:switch(__array[1]){case 99:switch(__array[2]){case 114:switch(__array[3]){case 110:return BlendModeKey.Screen;default:return undefined;}default:return undefined;}case 76:switch(__array[2]){case 105:switch(__array[3]){case 116:return BlendModeKey.SoftLight;default:return undefined;}default:return undefined;}case 109:switch(__array[2]){case 117:switch(__array[3]){case 100:return BlendModeKey.Exclusion;default:return undefined;}default:return undefined;}case 97:switch(__array[2]){case 116:switch(__array[3]){case 32:return BlendModeKey.Saturation;default:return undefined;}default:return undefined;}default:return undefined;}case 111:switch(__array[1]){case 118:switch(__array[2]){case 101:switch(__array[3]){case 114:return BlendModeKey.Overlay;default:return undefined;}default:return undefined;}default:return undefined;}case 104:switch(__array[1]){case 76:switch(__array[2]){case 105:switch(__array[3]){case 116:return BlendModeKey.HardLight;default:return undefined;}default:return undefined;}case 77:switch(__array[2]){case 105:switch(__array[3]){case 120:return BlendModeKey.HardMix;default:return undefined;}default:return undefined;}case 117:switch(__array[2]){case 101:switch(__array[3]){case 32:return BlendModeKey.Hue;default:return undefined;}default:return undefined;}default:return undefined;}case 118:switch(__array[1]){case 76:switch(__array[2]){case 105:switch(__array[3]){case 116:return BlendModeKey.VividLight;default:return undefined;}default:return undefined;}default:return undefined;}case 102:switch(__array[1]){case 115:switch(__array[2]){case 117:switch(__array[3]){case 98:return BlendModeKey.Subtract;default:return undefined;}default:return undefined;}case 100:switch(__array[2]){case 105:switch(__array[3]){case 118:return BlendModeKey.Divide;default:return undefined;}default:return undefined;}default:return undefined;}case 99:switch(__array[1]){case 111:switch(__array[2]){case 108:switch(__array[3]){case 114:return BlendModeKey.Color;default:return undefined;}default:return undefined;}default:return undefined;}default:return undefined;}})(_seq); }
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