FROM hayd/deno:alpine

WORKDIR /app
COPY src/thirdparty.ts ./src/
COPY lock.json ./
RUN deno cache --lock lock.json src/thirdparty.ts

ADD src ./src
RUN deno cache src/main.ts

CMD ["run", "--lock=lock.json", "--allow-net", "--allow-env", "--allow-read", "src/main.ts"]
