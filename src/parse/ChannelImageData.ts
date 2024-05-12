import { ParseContext, aligned } from "~/util/parse/mod.ts";
import { parse as parsePascalString } from "~/parse/PascalString.ts";
import { Version } from "~/parse/FileHeader.ts";

export function parse(ctx: ParseContext, version: Version): ChannelImageData {
    throw new Error("TODO");
}

export type ChannelImageData = {};