import { BlendModeKey, parse } from "~/parse/BlendMode.gen.ts";
import { ParseContext } from "~/util/parse/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const table = {
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
};

const successfulCases = Object.entries(table).map(([key, value]) => {
    const seq = Uint8Array.from(key, c => c.codePointAt(0)!);
    return [seq, value] as const;
});

Deno.test("parse BlendMode", () => {
    for (const [input, result] of successfulCases) {
        const context = ParseContext.create(input.buffer);
        assertEquals(parse(context), result);
    }

    const randomCaseCount = 1000;
    for (let i = 0; i < randomCaseCount; ++i) {
        const buf = new Uint8Array(Math.floor(Math.random() * 10));
        crypto.getRandomValues(buf);
        const expected = (() => {
            for (const [c, v] of successfulCases) {
                if (arrayEq(c, buf)) return v;
            }
        })();

        const context = ParseContext.create(buf.buffer);
        const result = (() => {
            try {
                return parse(context);
            } catch {
                return undefined;
            };
        })();

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