export class SyntaxError extends Error {
    readonly offset: number;
    constructor(offset: number) {
        super();
        this.offset = offset;
    }
}