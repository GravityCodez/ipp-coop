// Cohesivity deploys workers with an old compatibility date, where `new ReadableStream()` and
// `new TransformStream()` throw. If so, use a spec polyfill and turn polyfilled response bodies
// back into native streams through IdentityTransformStream (available on every date).
import { ReadableStream as PolyRS, WritableStream as PolyWS, TransformStream as PolyTS } from 'web-streams-polyfill';

export function installStreams() {
const works = (C) => { try { new C({ start() {} }); return true; } catch { return false; } };
if (!works(globalThis.ReadableStream)) {
  if (!works(globalThis.TransformStream)) globalThis.TransformStream = PolyTS;
  if (!works(globalThis.WritableStream)) globalThis.WritableStream = PolyWS;
  globalThis.ReadableStream = PolyRS;
  const enc = new TextEncoder();
  const toNative = (body) => {
    const { readable, writable } = new IdentityTransformStream();
    const w = writable.getWriter();
    const r = body.getReader();
    (async () => {
      try {
        for (;;) {
          const { done, value } = await r.read();
          if (done) break;
          await w.write(typeof value === 'string' ? enc.encode(value) : value);
        }
        await w.close();
      } catch (e) { w.abort(e).catch(() => {}); }
    })();
    return readable;
  };
  const NativeResponse = globalThis.Response;
  globalThis.Response = class Response extends NativeResponse {
    constructor(body, init) { super(body instanceof PolyRS ? toNative(body) : body, init); }
    static json(data, init = {}) { const h = new Headers(init.headers); if (!h.has('content-type')) h.set('content-type', 'application/json'); return new globalThis.Response(JSON.stringify(data), { ...init, headers: h }); }
  };
}
}
