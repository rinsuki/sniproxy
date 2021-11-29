import { config } from "../config.ts";
import { connectWithHTTPProxy } from "../proxy/http.ts";

export async function getConnFromTo(
  to: typeof config.map[0]["to"],
  host: string,
  port: number,
) {
  if (to === "disconnect") return null;
  if (to === "direct") return await Deno.connect({ hostname: host, port });
  switch (to.protocol) {
    case "redirect":
      return await Deno.connect(
        { hostname: to.hostname, port: to.port },
      );
    case "http":
      return await connectWithHTTPProxy(to, host, port);
  }
  throw `what??`;
}
