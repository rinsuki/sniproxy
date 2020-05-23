import { readHTTPSingleLine } from "../utils/read-http-single-line.ts";
import { ProxyInfo } from "../types.ts";

const encoder = new TextEncoder();

export async function connectWithHTTPProxy(
  proxy: ProxyInfo,
  dest: string,
  port = 443,
) {
  const conn = await Deno.connect(proxy);
  try {
    const host = [dest, port].join(":");
    const msg = [
      `CONNECT ${host} HTTP/1.1`,
      `Host: ${host}`,
      "",
      "",
    ].join("\r\n");
    const encodedMsg = encoder.encode(msg);
    await conn.write(encodedMsg);
    var receivedMsg = "", isFirst = false;
    do {
      receivedMsg = await readHTTPSingleLine(conn);
      if (isFirst) {
        isFirst = false;
        if (!receivedMsg.startsWith("HTTP/1.1 200")) throw receivedMsg;
      }
    } while (receivedMsg !== "");
    return conn;
  } catch (e) {
    conn.close();
    throw e;
  }
}
