import { _trie } from "$/tools/GenerateTrie/mod.ts";
import { SuportedAdjustmentLayerKey } from "~/parse/AdditionalLayerInformation/mod.ts";

export enum Signeture {
    _8BIM,
    _8B64
}

export class Determine {
    @_trie({
        '8BIM': Signeture._8BIM,
        '8B64': Signeture._8B64
    })
    static signeture(_array: Uint8Array): Signeture | undefined {
        throw new Error("not generated.");
    }

    @_trie({
        'LMsk': true, 'Lr16': true, 'Lr32': true, 'Layr': true, 'Mt16': true, 'Mt32': true, 'Mtrn': true, 'Alph': true,
        'FMsk': true, 'lnk2': true, 'FEid': true, 'FXid': true, 'PxSD': true
    })
    static lengthDataCouldBeLarge(_array: Uint8Array): boolean | undefined {
        throw new Error("not generated.");
    }

    @_trie({
        'luni': SuportedAdjustmentLayerKey.UnicodeLayerName,
        'lyid': SuportedAdjustmentLayerKey.LayerId,
    })
    static adjustmentLayerKey(_array: Uint8Array): SuportedAdjustmentLayerKey | undefined {
        throw new Error("not generated");
    }
}