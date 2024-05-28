/** @see {@link https://www.fileformat.info/format/tiff/corion-packbits.htm} */
export function decompressRLE(bin: Uint8Array): Uint8Array { // ここに非常に時間がかかっている模様。
    const totalLen = getTotalLength(bin);
    const buf = new Uint8Array(totalLen);
    let written = 0;
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
            buf.fill(byte, written, written + count);
            written += count;
            idx += 1;
        } else {
            const count = header + 1;
            buf.set(bin.slice(idx, idx + header + 1), written);
            written += count;
            idx += count;
        }
    }

    return new Uint8Array(buf);
}

function getTotalLength(bin: Uint8Array): number {
    let len = 0;
    let idx = 0;
    while (idx < bin.length) {
        const header = bin[idx];
        idx += 1;
        if (header === 128) {
            continue;
        }
        if (header > 127) {
            const count = 256 - header + 1;
            len += count;
            idx += 1;
        } else {
            const count = header + 1;
            len += count;
            idx += count;
        }
    }
    return len;
}