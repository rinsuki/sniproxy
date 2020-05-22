import { escapeRegex } from "./escape-regex.ts";

const cacheDic: { [key: string]: RegExp } = {};

export function wildcardToRegex(
  wildcard: string,
): RegExp {
  const cache = cacheDic[wildcard];
  if (cache != null) {
    return cache;
  }
  const str = escapeRegex(wildcard)
    .replace(/\\\*\\\*/g, ".*")
    .replace(/\\\*/g, "[^\\.]*")
    .replace(/\\\?/g, ".")
    .replace(/^\\\./, "(.*\\.|)");
  const regex = new RegExp("^" + str + "$");
  cacheDic[wildcard] = regex;
  return regex;
}
