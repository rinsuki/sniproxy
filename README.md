# sniproxy

tcp/443 として listen し、接続されたクライアントの SNI のホスト名によって実際の接続先を振り分けます。

## サポートされている接続先

- `disconnect` (接続切断、デフォルト)
- `direct` (そのまま繋ぐ)
- `redirect://host:port` (指定されたホストとポートに接続)
- `http://host:port` (指定されたHTTPプロキシを経由して接続)

### 今後対応予定

- `socks5://host:port` (指定されたSOCKS5プロキシを経由して接続)

## config

環境変数 `SNIPROXY_CONFIG_FILE` があればそのパスを、なければ `$(pwd)/sniproxy.yml` を参照します。
configファイルはyamlです。

### configファイルの文法

```yaml
map:
  - to: http://proxy:8080 # 前述の接続先の文法
    from:
      - "api.example"
  - to: redirect://localhost:4443
    from:
      - "server.internal"
  - to: direct
    from:
      - "**.example.com"
```

`from` でのホスト名は(たぶん)globっぽいパターンに対応しています。詳しくは [src/utils/wildcard-to-regex.ts](./src/utils/wildcard-to-regex.ts) を参照してください。
