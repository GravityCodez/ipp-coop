// Minimal AsyncLocalStorage. The store stays set until the async work started inside run() settles.
// Good enough for a low-traffic demo; overlapping requests in one isolate could share a store.
export class AsyncLocalStorage {
  getStore() { return this._s; }
  enterWith(s) { this._s = s; }
  run(store, fn, ...args) {
    const prev = this._s;
    this._s = store;
    let r;
    try { r = fn(...args); } catch (e) { this._s = prev; throw e; }
    if (r && typeof r.then === 'function') return r.finally(() => { if (this._s === store) this._s = prev; });
    this._s = prev;
    return r;
  }
  exit(fn, ...args) { const prev = this._s; this._s = undefined; try { return fn(...args); } finally { this._s = prev; } }
  disable() { this._s = undefined; }
}
export default { AsyncLocalStorage };
