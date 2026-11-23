// Minimal node:process for a Worker without nodejs_compat.
const proc = globalThis.process ?? { env: {}, argv: [], version: 'v20.0.0', versions: {}, platform: 'linux', cwd: () => '/', nextTick: (fn, ...a) => queueMicrotask(() => fn(...a)), emit() {}, on() {}, once() {}, off() {} };
proc.env ??= {};
proc.emit ??= () => {};
globalThis.process ??= proc;
export default proc;
export const env = proc.env;
export const nextTick = proc.nextTick;
