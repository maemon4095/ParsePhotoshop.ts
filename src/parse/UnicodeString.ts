import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

/** Parse unicode string in Photoshop file. (UTF-16)*/
export function parse(ctx: ParseContext) {
    const unitCount = ctx.takeUint32();
    const buf = ctx.takeUint8Array(unitCount * 2);
    const decoder = new TextDecoder("utf-16be");
    const text = decoder.decode(buf);
    return text;
}

export class InvalidUnicodeStringError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Unicode string must be 2-byte null terminated.";
    }
}