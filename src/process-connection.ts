import { getSNIHost } from "./tls/get-sni-host.ts";
import { readTLSHeader } from "./tls/read-tls-header.ts";
import { getToFromHost } from "./utils/get-to-from-host.ts";
import { getConnFromTo } from "./utils/get-conn-from-to.ts";

export async function processConnection(conn: Deno.Conn) {
  if (conn.remoteAddr.transport !== "tcp") throw `invalid transport`;

  const [tlsContent, tlsHeader] = await readTLSHeader(conn);
  const host = await getSNIHost(tlsContent);
  if (host == null) return;
  const to = getToFromHost(host);
  const toAsString = typeof to === "string"
    ? to
    : `${to.protocol}://${to.hostname}:${to.port}`;
  console.log(
    `${conn.remoteAddr.hostname}:${conn.remoteAddr.port} → ${host} (by ${toAsString})`,
  );

  const dest = await getConnFromTo(to, host);
  if (dest == null) throw `disconnect`;

  const tlsHello = new Uint8Array(tlsContent.byteLength + tlsHeader.byteLength);
  tlsHello.set(tlsHeader, 0);
  tlsHello.set(tlsContent, tlsHeader.byteLength);

  await Promise.all([
    Deno.copy(dest, conn),
    Deno.copy(conn, dest),
    dest.write(tlsHello),
  ]);
}
