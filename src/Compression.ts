/** @see {@link https://www.fileformat.info/format/tiff/corion-packbits.htm} */
export function decompressRLE(bin: Uint8Array): Uint8Array {
    const buf: number[] = [];
    let idx = 0;
    while (idx < bin.length) {
        const header = bin[idx];
        idx += 1;
        if (header === 128) {
            continue;
        }
        if (header > 127) {
            const count = 256 - header + 1;
            const byte = bin[idx];
            for (let i = 0; i < count; ++i) {
                buf.push(byte);
            }
            idx += 1;
        } else {
            buf.push(...bin.slice(idx, idx + header + 1));
            idx += header + 1;
        }
    }

    return new Uint8Array(buf);
}