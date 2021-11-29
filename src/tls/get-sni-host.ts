import { SyncReader } from "../thirdparty.ts";

export function getSNIHost(tlsContent: Uint8Array) {
  const tlsContentReader = new SyncReader(new DataView(tlsContent.buffer));

  const handshakeType = tlsContentReader.u8();
  if (handshakeType !== 1) {
    throw `unknown handshake type (${handshakeType})`;
  }
  const tlsContentLength2 = tlsContentReader.u24(false) + 4;
  if (tlsContentLength2 !== tlsContent.byteLength) {
    throw `invalid data length (expected: ${tlsContentLength2}, actual: ${tlsContent.byteLength})`;
  }
  tlsContentReader.skip(2); // protocol version
  tlsContentReader.skip(32); // random bytes
  tlsContentReader.skip(tlsContentReader.u8()); // session id
  tlsContentReader.skip(tlsContentReader.u16(false)); // cipher suites
  tlsContentReader.skip(tlsContentReader.u8()); // compression methods
  const extensionsLength = tlsContentReader.u16(false);
  const endPointer = tlsContentReader.pointer + extensionsLength;
  while (tlsContentReader.pointer < endPointer) {
    const extensionType = tlsContentReader.u16(false);
    const extensionLength = tlsContentReader.u16(false);
    if (extensionType !== 0) {
      tlsContentReader.skip(extensionLength);
      continue;
    }
    const sniListLength = tlsContentReader.u16(false);
    const sniEndPointer = tlsContentReader.pointer + sniListLength;
    while (tlsContentReader.pointer < sniEndPointer) {
      if (tlsContentReader.u8()) {
        throw `name_type is must be 0`;
      }
      const hostNameLength = tlsContentReader.u16(false);
      if (hostNameLength < 1) {
        throw `server_name length must be one or higher`;
      }
      const decoder = new TextDecoder();
      return decoder.decode(tlsContentReader.bytes(hostNameLength));
    }
  }
  return null;
}
