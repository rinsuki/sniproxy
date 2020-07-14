import {
  $,
  YAML,
  Transformer,
  ok,
  error,
  ValidationError,
} from "./thirdparty.ts";
import { ProxyInfo } from "./types.ts";

function $url<Protocol extends string>(
  $schema: Transformer<string, Protocol>,
): Transformer<string, ProxyInfo & { protocol: Protocol }> {
  return Transformer.from((str) => {
    const r = /^([a-z]+):\/\/(.+):(\d{1,5})$/.exec(str);
    if (r == null) {
      return error(new ValidationError([], new Error("Invalid URL")));
    }
    return ok(
      {
        protocol: $schema.transformOrThrow(r[1]),
        hostname: r[2],
        port: parseInt(r[3]),
      },
    );
  });
}

export const config = $.obj({
  bind: $.withDefault(
    $.obj({
      host: $.string,
      port: $.number,
    }),
    {
      host: "",
      port: 443,
    },
  ),
  map: $.array($.obj({
    from: $.array($.string),
    to: $.either(
      $.literal("direct", "disconnect"),
      $url($.literal("http", "redirect")),
    ),
  })),
  port: $.withDefault($.number, 443),
}).transformOrThrow(
  YAML.safeLoad(
    await Deno.readTextFile(
      Deno.env.get("SNIPROXY_CONFIG_FILE") || "sniproxy.yml",
    ),
  ),
);

console.log(config.map);
