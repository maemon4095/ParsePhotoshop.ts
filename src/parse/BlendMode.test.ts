import parse, { BlendMode } from "~/parse/BlendMode.gen.ts";
import { ParseContext } from "~/util/parse/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const table = {
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
            return BlendMode.Unknown;
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