import { PriorityQueue } from "~/util/collections/mod.ts";

const encodingCandidates = [
    "utf-8",
    "shift_jis",
];

const replacementCharacter = "\u{FFFD}";

export function decode(bin: Uint8Array): string {
    const queue = new PriorityQueue<{ count: number; text: string; }>((l, r) => r.count - l.count);
    for (const encoding of encodingCandidates) {
        const decoder = new TextDecoder(encoding);
        const text = decoder.decode(bin);
        const count = text.split(replacementCharacter).length - 1;
        if (count === 0) {
            return text;
        }
        queue.enqueue({ text, count });
    }
    return queue.dequeue()!.text;
}