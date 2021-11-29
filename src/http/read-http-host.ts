import { readHTTPSingleLine } from "../utils/read-http-single-line.ts";

export async function readHTTPHost(conn: Deno.Conn) {
  const chunks: Uint8Array[] = [];
  let host: string | null = null;
  while (true) {
    const [line, lineBytes] = await readHTTPSingleLine(conn);
    if (/,[\t ]*$/.test(line)) {
      console.log("multi-line header is prohibited");
      return [new Uint8Array(), null] as const;
    }
    const hostMatcher = /host:[\t ]*(.+?)[\t ]*$/i.exec(line);
    if (hostMatcher != null) {
      if (host != null) {
        console.log("duplicated host!! first:", host);
        return [new Uint8Array(), null] as const;
      }
      host = hostMatcher[1];
    }
    chunks.push(lineBytes);
    if (line === "") break;
  }
  const readed = new Uint8Array(chunks.reduce((p, c) => p + c.byteLength, 0));
  let index = 0;
  for (const chunk of chunks) {
    readed.set(chunk, index);
    index += chunk.byteLength;
  }
  return [readed, host] as const;
}
