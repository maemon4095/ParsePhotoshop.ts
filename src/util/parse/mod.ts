export type Parser<T> = (context: ParseContext) => T;

export class ParseContext {
    static create(buffer: ArrayBuffer, byteOffset?: number): ParseContext {
        const view = new DataView(buffer);
        return new ParseContext(view, byteOffset ?? 0);
    }

    #byteOffset: number;
    #view: DataView;

    constructor(view: DataView, byteOffset: number) {
        this.#byteOffset = byteOffset;
        this.#view = view;
    }

    get byteOffset(): number {
        return this.#byteOffset;
    }

    get bytesLeft(): number {
        return this.#view.byteLength - this.#byteOffset;
    }


    seekTo(byteOffset: number) {
        this.#byteOffset = byteOffset;
    }

    advance(bytesMove: number) {
        if (bytesMove === 0) {
            return;
        }

        this.#byteOffset += bytesMove;
        if (bytesMove < 0) {
            this.#view.getUint8(this.#byteOffset + 1); // check cursor does not overflow
        } else {
            this.#view.getUint8(this.#byteOffset - 1); // check cursor does not overflow
        }
    }

    peekUint8Into(buf: Uint8Array) {
        const offset = this.#byteOffset;
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = this.#view.getUint8(offset + i);
        }
    }

    peekUint8Array(length: number): Uint8Array {
        const buf = new Uint8Array(length);
        this.peekUint8Into(buf);
        return buf;
    }

    peekUint8(): number {
        return this.#view.getUint8(this.#byteOffset);
    }

    peekInt8(): number {
        return this.#view.getInt8(this.#byteOffset);
    }

    peekUint16(le?: boolean): number {
        return this.#view.getUint16(this.#byteOffset, le);
    }

    peekInt16(le?: boolean): number {
        return this.#view.getInt16(this.#byteOffset, le);
    }

    peekUint32(le?: boolean): number {
        return this.#view.getUint32(this.#byteOffset, le);
    }

    peekInt32(le?: boolean): number {
        return this.#view.getInt32(this.#byteOffset, le);
    }

    peekUint64(le?: boolean): bigint {
        return this.#view.getBigUint64(this.#byteOffset, le);
    }

    peekInt64(le?: boolean): bigint {
        return this.#view.getBigInt64(this.#byteOffset, le);
    }

    peekFloat32(le?: boolean): number {
        return this.#view.getFloat32(this.#byteOffset, le);
    }

    peekFloat64(le?: boolean): number {
        return this.#view.getFloat64(this.#byteOffset, le);
    }

    takeUint8Array(length: number): Uint8Array {
        const buf = this.peekUint8Array(length);
        this.#byteOffset += length;
        return buf;
    }

    takeUint8Into(buf: Uint8Array) {
        this.peekUint8Into(buf);
        this.#byteOffset += buf.length;
    }

    takeUint8(): number {
        const r = this.#view.getUint8(this.#byteOffset);
        this.#byteOffset += 1;
        return r;
    }

    takeInt8(): number {
        const r = this.#view.getInt8(this.#byteOffset);
        this.#byteOffset += 1;
        return r;
    }

    takeUint16(le?: boolean): number {
        const r = this.#view.getUint16(this.#byteOffset, le);
        this.#byteOffset += 2;
        return r;
    }

    takeInt16(le?: boolean): number {
        const r = this.#view.getInt16(this.#byteOffset, le);
        this.#byteOffset += 2;
        return r;
    }

    takeUint32(le?: boolean): number {
        const r = this.#view.getUint32(this.#byteOffset, le);
        this.#byteOffset += 4;
        return r;
    }

    takeInt32(le?: boolean): number {
        const r = this.#view.getInt32(this.#byteOffset, le);
        this.#byteOffset += 4;
        return r;
    }

    takeUint64(le?: boolean): bigint {
        const r = this.#view.getBigUint64(this.#byteOffset, le);
        this.#byteOffset += 8;
        return r;
    }

    takeInt64(le?: boolean): bigint {
        const r = this.#view.getBigInt64(this.#byteOffset, le);
        this.#byteOffset += 8;
        return r;
    }

    takeFloat32(le?: boolean): number {
        const r = this.#view.getFloat32(this.#byteOffset, le);
        this.#byteOffset += 4;
        return r;
    }

    takeFloat64(le?: boolean): number {
        const r = this.#view.getFloat64(this.#byteOffset, le);
        this.#byteOffset += 8;
        return r;
    }
}

export function attempt<T>(p: Parser<T>): Parser<T | Error> {
    return (ctx) => {
        const byteOffset = ctx.byteOffset;
        try {
            return p(ctx);
        } catch (e) {
            if (e instanceof Error) {
                ctx.seekTo(byteOffset);
                return e;
            }
            throw e;
        }
    };
};

export function aligned<T>(p: Parser<T>, alignment: number): Parser<T> {
    return ctx => {
        const offset = ctx.byteOffset;
        const result = p(ctx);
        const consumed = ctx.byteOffset - offset;
        const aligned = Math.floor(Math.ceil(consumed / alignment) * alignment);
        ctx.advance(aligned - consumed);
        return result;
    };
}

export function measured<T>(p: Parser<T>): Parser<[T, number]> {
    return ctx => {
        const offset = ctx.byteOffset;
        const result = p(ctx);
        const consumed = ctx.byteOffset - offset;
        return [result, consumed];
    };
}