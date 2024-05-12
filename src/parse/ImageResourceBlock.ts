import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

export function parse(ctx: ParseContext): ImageResourceBlock {
    void parseBlockSigneture(ctx);
    const imageResourceId = parseImageResourceId(ctx);
    const name = aligned(parsePascalString, 2)(ctx);
    const resourceDataSize = ctx.takeUint32();
    // TODO: parse resource data properly depends on imageResourceId
    const resourceData = aligned((ctx) => ctx.takeUint8Array(resourceDataSize), 2)(ctx);
    return { imageResourceId, name, resourceData };
}

function parseBlockSigneture(ctx: ParseContext) {
    if (ctx.peekUint8() !== 0x38) { // ASCII '8'
        throw new InvalidImageResourceBlockSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x42) { // ASCII 'B'
        throw new InvalidImageResourceBlockSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x49) { // ASCII 'I'
        throw new InvalidImageResourceBlockSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();

    if (ctx.peekUint8() !== 0x4D) { // ASCII 'M'
        throw new InvalidImageResourceBlockSignetureError(ctx.byteOffset);
    }
    ctx.takeUint8();
}

function parseImageResourceId(ctx: ParseContext) {
    const id = ctx.takeUint16();
    // TODO: check id is valid
    return id;
}

export type ImageResourceBlock = {
    imageResourceId: number,
    name: Uint8Array,
    resourceData: Uint8Array;
};

export class InvalidImageResourceBlockSignetureError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Image block signeture must be `8BIM`.";
    }
}

