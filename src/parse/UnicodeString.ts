import { ParseContext } from "~/util/parse/mod.ts";

/** Parse unicode string in Photoshop file. (UTF-16)*/
export default function parse(ctx: ParseContext) {
    const unitCount = ctx.takeUint32();
    const buf = ctx.takeUint8Array(unitCount * 2);
    const decoder = new TextDecoder("utf-16be");
    const text = decoder.decode(buf);
    return text;
}