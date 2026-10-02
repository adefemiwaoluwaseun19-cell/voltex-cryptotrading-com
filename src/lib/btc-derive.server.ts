import { HDKey } from "@scure/bip32";
import { p2pkh, p2sh, p2wpkh } from "@scure/btc-signer";

// Watch-only derivation of receive addresses (chain 0) from an extended public key.
export function deriveBtcAddress(extKey: string, index: number): string {
  const prefix = extKey.slice(0, 4);
  if (!["xpub", "ypub", "zpub"].includes(prefix)) throw new Error("Unsupported wallet key");
  const versions =
    prefix === "zpub"
      ? { public: 0x04b24746, private: 0x04b2430c }
      : prefix === "ypub"
        ? { public: 0x049d7cb2, private: 0x049d7878 }
        : { public: 0x0488b21e, private: 0x0488ade4 };
  const node = HDKey.fromExtendedKey(extKey, versions).deriveChild(0).deriveChild(index);
  if (!node.publicKey) throw new Error("Invalid wallet key");
  const pub = node.publicKey;
  const addr =
    prefix === "zpub" ? p2wpkh(pub).address : prefix === "ypub" ? p2sh(p2wpkh(pub)).address : p2pkh(pub).address;
  if (!addr) throw new Error("Could not derive address");
  return addr;
}
