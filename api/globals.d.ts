/// <reference types="node" />

declare module "pg" {
  const pg: any;
  export default pg;
}

declare module "crypto" {
  const crypto: any;
  export default crypto;
}

declare var process: NodeJS.Process;
declare var Buffer: typeof globalThis.Buffer;
declare var console: Console;
declare var URL: typeof globalThis.URL;