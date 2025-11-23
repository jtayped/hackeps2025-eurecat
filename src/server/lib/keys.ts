import { generateKeyPair } from "crypto";
import { promisify } from "util";

const generateKeyPairAsync = promisify(generateKeyPair);

export async function generateSSHKeyPair() {
  const { publicKey: publicKeyPem, privateKey: privateKeyPem } =
    await generateKeyPairAsync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

  const sshPublicKey = convertPemToOpenSSH(publicKeyPem);

  return {
    publicKey: sshPublicKey,
    privateKey: privateKeyPem,
  };
}

function convertPemToOpenSSH(pem: string) {
  const fetchBase64 = pem
    .replace("-----BEGIN RSA PUBLIC KEY-----", "")
    .replace("-----END RSA PUBLIC KEY-----", "")
    .replace(/[\r\n]/g, "");

  const buffer = Buffer.from(fetchBase64, "base64");

  let offset = 0;

  function readLen() {
    let len = buffer[offset++]!;
    if (len & 0x80) {
      let n = len & 0x7f;
      len = 0;
      while (n-- > 0) len = (len << 8) | buffer[offset++]!;
    }
    return len;
  }

  // Skip SEQUENCE header
  offset++;
  readLen();

  // Read Modulus
  offset++; // Tag INTEGER
  const modLen = readLen();
  let mod = buffer.subarray(offset, offset + modLen);
  offset += modLen;
  if (mod[0] === 0) mod = mod.subarray(1);

  // Read Exponent
  offset++; // Tag INTEGER
  const expLen = readLen();
  const exp = buffer.subarray(offset, offset + expLen);

  // Build SSH Buffer
  const type = Buffer.from("ssh-rsa");

  // RFC 4253: [string "ssh-rsa"] [mpint e] [mpint n]
  const sshBuffer = Buffer.concat([
    encodeSSHString(type),
    encodeSSHString(exp),
    encodeSSHString(mod),
  ]);

  return `ssh-rsa ${sshBuffer.toString("base64")} nebulous-key`;
}

function encodeSSHString(buf: Buffer) {
  const len = Buffer.alloc(4);
  if (buf[0]! & 0x80) {
    const newBuf = Buffer.alloc(buf.length + 1);
    newBuf[0] = 0x00;
    buf.copy(newBuf, 1);
    buf = newBuf;
  }
  len.writeUInt32BE(buf.length);
  return Buffer.concat([len, buf]);
}

export function formatGcpKey(username: string, publicKey: string) {
  return `${username}:${publicKey}`;
}
