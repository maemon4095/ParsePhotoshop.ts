import { ParseContext } from "~/util/parse/mod.ts";
import { parse as parseBlock, ImageResourceBlock } from "~/parse/ImageResourceBlock.ts";

export function parse(ctx: ParseContext): ImageResources {
    let rest = ctx.takeUint32();
    const blocks: ImageResourceBlock[] = [];

    while (rest > 0) {
        const offset = ctx.byteOffset;
        const block = parseBlock(ctx);
        blocks.push(block);
        const consumed = ctx.byteOffset - offset;
        rest -= consumed;
    }

    return { blocks };
}

/** The third section of PSD/PSB */
export type ImageResources = {
    blocks: ImageResourceBlock[];
};

export class InvalidImageResourceBlockOverflowError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
        this.message = "Image resource block overflows image resource section.";
    }
}