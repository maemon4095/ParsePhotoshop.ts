// https://www.w3.org/TR/compositing-1/#advancedcompositing

import { ColorBlendMethod, CompositeMethod } from "~/draw/blender/mod.ts";
import { RGBAPixel } from "~/draw/blender/mod.ts";
import { rgb, weight, weightSum } from "~/draw/blender/util.ts";

// deno-lint-ignore no-namespace
export namespace PorterDuffArguments {
    export const Above = Symbol();
    export const Below = Symbol();
    export const AboveComplement = Symbol();
    export const BelowComplement = Symbol();
}

export type PorterDuffArgument = number | (typeof PorterDuffArguments)[keyof typeof PorterDuffArguments];

function getPorterDuffCoefficient(a: PorterDuffArgument, below: RGBAPixel, above: RGBAPixel) {
    if (typeof a === "number") return a;
    switch (a) {
        case PorterDuffArguments.Above: return above[3];
        case PorterDuffArguments.Below: return below[3];
        case PorterDuffArguments.AboveComplement: return 1 - above[3];
        case PorterDuffArguments.BelowComplement: return 1 - below[3];
    }
}

export function porterDuff(fa: PorterDuffArgument, fb: PorterDuffArgument): CompositeMethod {
    return blend => (below, above) => {
        const _fa = getPorterDuffCoefficient(fa, below, above);
        const _fb = getPorterDuffCoefficient(fb, below, above);
        return rawPorterDuff(_fa, _fb, blend, below, above);
    };
}

export function rawPorterDuff(fa: number, fb: number, blend: ColorBlendMethod, below: RGBAPixel, above: RGBAPixel): RGBAPixel {
    const aa = above[3];
    const ab = below[3];
    const ca = rgb(above);
    const cb = rgb(below);

    const ao = aa * fa + ab * fb;
    const cm = weightSum(1 - ab, ca, ab, blend(cb, ca));
    const co = weightSum(aa * fa, cm, ab * fb, cb);
    if (ao === 0) {
        return [0, 0, 0, 0];
    }
    return [...weight(1 / ao, co), ao];
}

export const clear: CompositeMethod = () => () => {
    return [0, 0, 0, 0];
};
export const copy: CompositeMethod = () => (_, above) => {
    return above;
};
export const destination: CompositeMethod = () => (below) => {
    return below;
};
export const sourceOver = porterDuff(1, PorterDuffArguments.AboveComplement);
export const destinationOver = porterDuff(PorterDuffArguments.BelowComplement, 1);
export const sourceIn = porterDuff(PorterDuffArguments.Below, 0);
export const destinationIn = porterDuff(0, PorterDuffArguments.Above);
export const sourceOut = porterDuff(PorterDuffArguments.BelowComplement, 0);
export const destinationOut = porterDuff(0, PorterDuffArguments.AboveComplement);
export const sourceAtop = porterDuff(PorterDuffArguments.Below, PorterDuffArguments.AboveComplement);
export const destinationAtop = porterDuff(PorterDuffArguments.BelowComplement, PorterDuffArguments.Above);
export const xor = porterDuff(PorterDuffArguments.BelowComplement, PorterDuffArguments.AboveComplement);
export const lighter = porterDuff(1, 1);