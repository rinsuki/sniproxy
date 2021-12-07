import { getSNIHost } from "./tls/get-sni-host.ts";
import { readTLSHeader } from "./tls/read-tls-header.ts";
import { getToFromHost } from "./utils/get-to-from-host.ts";
import { getConnFromTo } from "./utils/get-conn-from-to.ts";
import { readHTTPHost } from "./http/read-http-host.ts";

export async function processConnection(conn: Deno.Conn, isHTTP: boolean) {
  if (conn.remoteAddr.transport !== "tcp") throw `invalid transport`;

  const [payload, host] = await (isHTTP ? readHTTPHost(conn) : readTLSHeader(conn));
  if (host == null) return;
  const to = getToFromHost(host);
  const toAsString = typeof to === "string"
    ? to
    : `${to.protocol}://${to.hostname}:${to.port}`;
  console.log(
    `${conn.remoteAddr.hostname}:${conn.remoteAddr.port} → ${host} (by ${toAsString})`,
  );

  const dest = await getConnFromTo(to, host, isHTTP ? 80 : 443);
  if (dest == null) throw `disconnect`;

  await dest.write(payload)
  try {
    await Promise.all([
      Deno.copy(dest, conn),
      Deno.copy(conn, dest),
    ]);
  } finally {
    try {
      dest.close()
    } catch(e) {
      // nothing
    }
  }
}
