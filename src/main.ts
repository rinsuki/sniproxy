import { processConnection } from "./process-connection.ts";
import { config } from "./config.ts";

const listener = Deno.listen({ port: config.port });
for await (const conn of listener) {
  processConnection(conn).catch((e) => {
    if (e instanceof Error && e.name === "ConnectionReset") return;
    if (e === "disconnect") return;
    console.error(e);
  }).finally(() => {
    conn.close();
  });
}
