// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_72092

import { ParseContext } from "~/util/parse/mod.ts";
import { parse as parseFileHeader } from "~/parse/FileHeader.ts";
import { parse as parseColorModeData } from "~/parse/ColorModeData.ts";
import { parse as parseImageResources } from "~/parse/ImageResources.ts";

// 全データはbig-endianで保存される.
export function parse(buffer: ArrayBuffer) {
    const ctx = new ParseContext(new DataView(buffer), 0);
    const fileHeader = parseFileHeader(ctx);
    console.log("File Header:", fileHeader);
    const colorModeData = parseColorModeData(ctx, fileHeader);
    console.log("ColorModeData:", colorModeData);
    const imageResources = parseImageResources(ctx);
}