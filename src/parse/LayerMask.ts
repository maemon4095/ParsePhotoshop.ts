import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { parse as parseRect } from "~/parse/Rectangle.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";


export function parse(ctx: ParseContext) {
    const size = ctx.takeUint32();
    if (size == 0) {
        return {};
    }

    const enclosingRectangle = parseRect(ctx);

}

function parseDefaultColor(ctx: ParseContext) {
    const color = ctx.peekUint8();
    switch (color) { }
}

export type LayerMask = {};
export type LayerMaskDefaultColor = 0 | 255;


export class InvalidLayerMaskDefaultColor extends SyntaxError {

}