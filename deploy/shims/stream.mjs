// node:stream is only used by the Node streaming render path, which a Worker does not take.
class Unsupported { constructor() { throw new Error('node:stream is not available on this host'); } static toWeb() { throw new Error('node:stream is not available on this host'); } }
export class PassThrough extends Unsupported {}
export class Readable extends Unsupported {}
export default { PassThrough, Readable };
