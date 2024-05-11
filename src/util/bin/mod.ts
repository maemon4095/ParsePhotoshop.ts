type BinaryTable<A extends string[]> = { [k in A[number]]: Uint8Array };
export function createBinaryTable<A extends string[]>(array: A): BinaryTable<A> {
    const encoder = new TextEncoder();
    const table: Partial<BinaryTable<A>> = {};
    for (const key of array as A[number][]) {
        table[key] = encoder.encode(key);
    }
    return table as BinaryTable<A>;
};