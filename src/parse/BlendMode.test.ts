import parse, { SupportedBlendMode } from "~/parse/BlendMode.gen.ts";
import { ParseContext } from "~/util/parse/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const table = {
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
};

const successfulCases = Object.entries(table).map(([key, value]) => {
    const seq = Uint8Array.from(key, c => c.codePointAt(0)!);
    return [seq, value] as const;
});

Deno.test("parse BlendMode", () => {
    for (const [input, expected] of successfulCases) {
        const context = ParseContext.create(input.buffer);
        const [result] = parse(context);
        assertEquals(result, expected);
    }

    const randomCaseCount = 1000;
    for (let i = 0; i < randomCaseCount; ++i) {
        const buf = new Uint8Array(4);
        crypto.getRandomValues(buf);
        const expected = (() => {
            for (const [c, v] of successfulCases) {
                if (arrayEq(c, buf)) return v;
            }
            return SupportedBlendMode.Unsupported;
        })();

        const context = ParseContext.create(buf.buffer);
        const [result] = parse(context);

        assertEquals(result, expected);
    }
});

function arrayEq(l: Uint8Array, r: Uint8Array) {
    if (l === r) { // reference equality
        return true;
    }
    if (l.byteLength !== r.byteLength) {
        return false;
    }

    for (let i = 0; i < l.byteLength; ++i) {
        if (l[i] !== r[i]) {
            return false;
        }
    }

    return true;
}