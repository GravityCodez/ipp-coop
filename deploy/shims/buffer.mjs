// Minimal Buffer.from for strings and byte arrays.
const enc = new TextEncoder();
export const Buffer = { from: (v) => (typeof v === 'string' ? enc.encode(v) : new Uint8Array(v)), isBuffer: (v) => v instanceof Uint8Array };
export default { Buffer };
