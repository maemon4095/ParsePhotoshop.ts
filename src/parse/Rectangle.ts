import { ParseContext } from "~/util/parse/mod.ts";

export default function parse(ctx: ParseContext): Rectangle {
    const top = ctx.takeInt32();
    const left = ctx.takeInt32();
    const bottom = ctx.takeInt32();
    const right = ctx.takeInt32();
    return { top, left, bottom, right };
}

/** each coordinates may be negative */
export type Rectangle = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};