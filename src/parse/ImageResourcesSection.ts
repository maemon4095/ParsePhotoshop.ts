import { ParseContext, measured } from "../util/parse/mod.ts";
import parseBlock, { ImageResourceBlock } from "./ImageResourceBlock.ts";
import { SyntaxError } from "./SyntaxError.ts";

export default function parse(ctx: ParseContext): ImageResourcesSection {
    let rest = ctx.takeUint32();
    const blocks: ImageResourceBlock[] = [];
    const measuredParseBlock = measured(parseBlock);
    while (rest > 0) {
        const [block, consumed] = measuredParseBlock(ctx);
        blocks.push(block);
        rest -= consumed;
    }
    if (rest !== 0) {
        throw new InvalidImageResourceBlockOverflowError(ctx.byteOffset);
    }

    return { blocks };
}

/** The third section of Photoshop file */
export type ImageResourcesSection = {
    blocks: ImageResourceBlock[];
};

export class InvalidImageResourceBlockOverflowError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Image resource block overflows image resource section.";
    }
}
