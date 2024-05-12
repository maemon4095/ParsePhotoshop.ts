import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";

/** Parse unicode string in PSD/PSB file. (UTF-16)*/
export function parse(ctx: ParseContext) {
    // [  count  ] [      units      ] [  null  ]
    //   2 byte      count * 2 bytes     2byte
    const unitCount = ctx.takeUint32();
    const buf = ctx.takeUint8Array(unitCount * 2);
    const decoder = new TextDecoder("utf-16be");
    const text = decoder.decode(buf);
    if (ctx.peekUint16() !== 0) {
        throw new InvalidUnicodeStringError(ctx.byteOffset);
    }
    ctx.takeUint16();
    return text;
}

export class InvalidUnicodeStringError extends SyntaxError {
    constructor(offset: number) {
        super(offset);
        this.message = "Unicode string must be 2-byte null terminated.";
    }
}