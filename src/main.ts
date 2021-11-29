import { processConnection } from "./process-connection.ts";
import { config } from "./config.ts";

async function listenHTTPS() {
  const listener = Deno.listen({ port: config.port });
  for await (const conn of listener) {
    processConnection(conn, false).catch((e) => {
      if (e instanceof Error && e.name === "ConnectionReset") return;
      if (e === "disconnect") return;
      console.error("Error in HTTPS", e);
    }).finally(() => {
      conn.close();
    });
  }
}

async function listenHTTP() {
  const port = config.http_port
  if (port == null) return
  const listener = Deno.listen({ port })
  for await (const conn of listener) {
    processConnection(conn, true).catch((e) => {
      if (e instanceof Error && e.name === "ConnectionReset") return;
      if (e === "disconnect") return;
      console.error("Error in HTTP", e);
    }).finally(() => {
      conn.close();
    });
  }
}

await Promise.all([
  listenHTTP(), listenHTTPS()
])
Deno.exit(0)