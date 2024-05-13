import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";

export default function parse(ctx: ParseContext): LayerId {
    ctx.takeUint32();
    const id = ctx.takeUint32();
    return {
        key: SuportedAdjustmentLayerKey.LayerId,
        id
    };
}

export type LayerId = {
    key: SuportedAdjustmentLayerKey.LayerId;
    id: number;
};

export class InvalidLayerIdSignetureError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Layer Id must have signeture '8BIM' in additional layer information.";
    }
}
export class InvalidLayerIdKeyError extends SyntaxError {
    constructor(byteOffset: number) {
        super(byteOffset);
        this.message = "Layer Id must have key 'lyid' in additional layer information.";
    }
}