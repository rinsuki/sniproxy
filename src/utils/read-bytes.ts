export async function readBytesExactly(socket: Deno.Conn, length: number) {
  const result = await readBytes(socket, length);
  if (result == null) throw `EOF`;
  if (result.byteLength !== length) {
    throw `incomplete received bytes (need=${length}, actual=${result.byteLength})`;
  }
  return result;
}

export async function readBytes(
  socket: Deno.Conn,
  maxLength: number,
): Promise<Uint8Array | null> {
  const buffer = new Uint8Array(maxLength);
  const actualByte = await socket.read(buffer);

  if (actualByte == null) return null;
  return buffer.slice(0, actualByte);
}
