import { processConnection } from "./process-connection.ts";

const listener = Deno.listen({ port: 443 });
for await (const conn of listener) {
  processConnection(conn).catch((e) => {
    if (e instanceof Error && e.name === "ConnectionReset") return;
    if (e === "disconnect") return;
    console.error(e);
  }).finally(() => {
    conn.close();
  });
}
