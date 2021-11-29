import { assert } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { readHTTPHost } from "./read-http-host.ts";

Deno.test("if it isn't http header", async () => {
  const server = Deno.listen({ port: 9999 });
  try {
    const [ssocket, csocket] = await Promise.all([
      server.accept(),
      Deno.connect({ port: 9999 }),
    ]);
    csocket.write(new TextEncoder().encode([
      "it isnt http",
      "",
      "",
    ].join("\r\n")));
    const result = await readHTTPHost(ssocket);
    ssocket.close();
    csocket.close();
    assert(result[1] == null);
  } finally {
    server.close();
  }
});

Deno.test("if it haven't host header", async () => {
  const server = Deno.listen({ port: 9999 });
  try {
    const [ssocket, csocket] = await Promise.all([
      server.accept(),
      Deno.connect({ port: 9999 }),
    ]);
    csocket.write(new TextEncoder().encode([
      "GET / HTTP/1.1",
      "",
      "",
    ].join("\r\n")));
    const result = await readHTTPHost(ssocket);
    ssocket.close();
    csocket.close();
    assert(result[1] == null);
  } finally {
    server.close();
  }
});

Deno.test("if it have host header", async () => {
  const server = Deno.listen({ port: 9999 });
  try {
    const [ssocket, csocket] = await Promise.all([
      server.accept(),
      Deno.connect({ port: 9999 }),
    ]);
    csocket.write(new TextEncoder().encode([
      "GET / HTTP/1.1",
      "Host: httpbin.org",
      "",
      "",
    ].join("\r\n")));
    const result = await readHTTPHost(ssocket);
    ssocket.close();
    csocket.close();
    assert(result[1] === "httpbin.org");
  } finally {
    server.close();
  }
});

Deno.test("if it have multiline header", async () => {
  const server = Deno.listen({ port: 9999 });
  try {
    const [ssocket, csocket] = await Promise.all([
      server.accept(),
      Deno.connect({ port: 9999 }),
    ]);
    csocket.write(new TextEncoder().encode([
      "GET / HTTP/1.1",
      "Host: httpbin.org,",
      "",
      "",
    ].join("\r\n")));
    const result = await readHTTPHost(ssocket);
    ssocket.close();
    csocket.close();
    assert(result[1] == null);
  } finally {
    server.close();
  }
});
