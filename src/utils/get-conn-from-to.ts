import { config } from "../config.ts";
import { connectWithHTTPProxy } from "../proxy/http.ts";

export async function getConnFromTo(
  to: typeof config.map[0]["to"],
  host: string,
) {
  if (to === "disconnect") return null;
  if (to === "direct") return await Deno.connect({ hostname: host, port: 443 });
  switch (to.protocol) {
    case "redirect:":
      return await Deno.connect(
        { hostname: to.hostname, port: parseInt(to.port) },
      );
    case "http:":
      return await connectWithHTTPProxy(to, host);
  }
  throw `what??`;
}
