declare module 'js-yaml' {
  export function load(input: string, options?: unknown): unknown;
  const yaml: { load: typeof load };
  export default yaml;
}

