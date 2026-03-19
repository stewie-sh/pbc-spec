// Empty shim — the viewer never calls readFileSync; this prevents bundler errors.
export function readFileSync(): never {
  throw new Error('readFileSync is not available in the browser');
}
