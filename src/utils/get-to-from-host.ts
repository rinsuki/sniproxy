import { wildcardToRegex } from "./wildcard-to-regex.ts";
import { config } from "../config.ts";

export function getToFromHost(host: string, map = config.map) {
  for (const { from, to } of map) {
    for (const fromHost of from) {
      if (wildcardToRegex(fromHost).test(host)) {
        return to;
      }
    }
  }
  return "disconnect";
}
