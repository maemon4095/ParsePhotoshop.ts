import { ParseContext } from "~/util/parse/mod.ts";
import { SyntaxError } from "~/parse/SyntaxError.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";
import { Determine, Signeture } from "~/parse/AdditionalLayerInformation/helper.gen.ts";


export default function parse(ctx: ParseContext): LayerId {
    void parseSigneture(ctx);
    void parseKey(ctx);
    ctx.takeUint32();
    const id = ctx.takeUint32();
    return {
        key: SuportedAdjustmentLayerKey.LayerId,
        id
    };
}

function parseSigneture(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    console.log(bin);
    if (Determine.signeture(bin) !== Signeture._8BIM) {
        throw new InvalidLayerIdSignetureError(ctx.byteOffset);
    }
    ctx.advance(4);
}

function parseKey(ctx: ParseContext) {
    const bin = ctx.peekUint8Array(4);
    if (Determine.adjustmentLayerKey(bin) !== SuportedAdjustmentLayerKey.LayerId) {
        throw new InvalidLayerIdKeyError(ctx.byteOffset);
    }
    ctx.advance(4);
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