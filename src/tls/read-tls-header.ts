import { readBytesExactly } from "../utils/read-bytes.ts";
import { SyncReader } from "../thirdparty.ts";
import { getSNIHost } from "./get-sni-host.ts";

export async function readTLSHeader(conn: Deno.Conn) {
  const tlsHeader = await readBytesExactly(conn, 5);
  const tlsHeaderReader = new SyncReader(new DataView(tlsHeader.buffer));
  if (tlsHeaderReader.u8() !== 22) {
    throw "unknown first byte";
  }
  const sslMajorVersion = tlsHeaderReader.u8();
  tlsHeaderReader.u8(); // sslMinorVersion
  if (sslMajorVersion !== 3) {
    throw `unknown major version (=${sslMajorVersion})`;
  }
  const tlsContentLength = tlsHeaderReader.u16(false);

  const tlsContent = await readBytesExactly(conn, tlsContentLength);

  const host = getSNIHost(tlsContent)

  const tlsHello = new Uint8Array(tlsContent.byteLength + tlsHeader.byteLength);
  tlsHello.set(tlsHeader, 0);
  tlsHello.set(tlsContent, tlsHeader.byteLength);

  return [tlsHello, host] as const;
}
