import { readBytesExactly } from "./read-bytes.ts";
const decoder = new TextDecoder();

// TODO: replace with more cool implement
export async function readHTTPSingleLine(conn: Deno.Conn) {
  const bytes: number[] = [];
  while (true) {
    const recv = await readBytesExactly(conn, 1);
    bytes.push(...recv);
    // check end
    if (bytes.length >= 2) {
      const last = bytes.slice(-2);
      if (last[0] == 0x0D && last[1] == 0x0A) {
        return decoder.decode(new Uint8Array(bytes.slice(0, -2)));
      }
    }
  }
}
