import { $, YAML, Transformer, ok } from "./thirdparty.ts";

function $url<Protocol extends string>(
  $schema: Transformer<string, Protocol>,
): Transformer<string, URL & { protocol: Protocol }> {
  return Transformer.from((str) => {
    const url = new URL(str);
    const protocol = $schema.transformOrThrow(url.protocol);
    return ok(Object.assign(url, { protocol }));
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
      $url($.literal("http:", "redirect:")),
    ),
  })),
}).transformOrThrow(
  YAML.safeLoad(
    await Deno.readTextFile(
      Deno.env.get("SNIPROXY_CONFIG_FILE") || "sniproxy.yml",
    ),
  ),
);

console.log(config.map);
