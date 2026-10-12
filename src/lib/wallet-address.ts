// Client-safe format checks for recipient wallet addresses, per listed coin.
const evm = /^0x[a-fA-F0-9]{40}$/;
const PATTERNS: Record<string, RegExp> = {
  btc: /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  eth: evm,
  link: evm,
  avax: evm,
  sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  xrp: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  doge: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
  ada: /^addr1[a-z0-9]{50,110}$/,
};

export function isValidAddress(coinId: string, address: string): boolean {
  const p = PATTERNS[coinId];
  return p ? p.test(address.trim()) : address.trim().length >= 20;
}
