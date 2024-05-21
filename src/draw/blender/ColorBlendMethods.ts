// https://www.w3.org/TR/compositing-1/#blending

import { ColorBlendMethod, RGBPixel } from "~/draw/blender/mod.ts";
import * as ChannelBlendMethods from "~/draw/blender/ChannelBlendMethods.ts";
import { blendCh, mapCh } from "~/draw/blender/util.ts";

function clipColor(c: RGBPixel) {
    const l = lum(c);
    const n = Math.min(c[0], c[1], c[2]);
    const x = Math.max(c[0], c[1], c[2]);
    if (n < 0) {
        c = mapCh(c => l + (((c - l) * l) / (l - n)))(c);
    }
    if (x > 1) {
        c = mapCh(c => l + (((c - l) * (1 - l)) / (x - l)))(c);
    }
    return c;
}

function lum(c: RGBPixel) {
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
}

function setLum(c: RGBPixel, l: number) {
    const d = l - lum(c);
    return clipColor(mapCh(c => c + d)(c));
}

function sat(c: RGBPixel) {
    return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
}

function setSat(c: RGBPixel, s: number) {
    c = [...c];
    const [min, mid, max] = c.map((v, i) => [v, i]).sort(([l], [r]) => l - r).map(([_, i]) => i);
    if (c[max] > c[min]) {
        c[mid] = (c[mid] - c[min]) * s / (c[max] - c[min]);
        c[max] = s;
    } else {
        c[mid] = c[max] = 0;
    }
    c[min] = 0;
    return c;
}

export const normal = blendCh(ChannelBlendMethods.normal);
export const multiply = blendCh(ChannelBlendMethods.multiply);
export const screen = blendCh(ChannelBlendMethods.screen);
export const overlay = blendCh(ChannelBlendMethods.overlay);
export const darken = blendCh(ChannelBlendMethods.darken);
export const lighten = blendCh(ChannelBlendMethods.lighten);
export const colorDodge = blendCh(ChannelBlendMethods.colorDodge);
export const colorBurn = blendCh(ChannelBlendMethods.colorBurn);
export const hardLight = blendCh(ChannelBlendMethods.hardLight);
export const softLight = blendCh(ChannelBlendMethods.softLight);
export const difference = blendCh(ChannelBlendMethods.difference);
export const exclusion = blendCh(ChannelBlendMethods.exclusion);

export const hue: ColorBlendMethod = (b, a) => {
    return setLum(setSat(a, sat(b)), lum(b));
};

export const saturation: ColorBlendMethod = (b, a) => {
    return setLum(setSat(b, sat(a)), lum(b));
};

export const color: ColorBlendMethod = (b, a) => {
    return setLum(a, lum(b));
};

export const luminosity: ColorBlendMethod = (b, a) => {
    return setLum(b, lum(a));
};