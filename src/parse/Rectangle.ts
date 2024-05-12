import { ParseContext } from "~/util/parse/mod.ts";

export function parse(ctx: ParseContext): Rectangle {
    const top = ctx.takeUint32();
    const left = ctx.takeUint32();
    const bottom = ctx.takeUint32();
    const right = ctx.takeUint32();
    return { top, left, bottom, right };
}

export type Rectangle = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};