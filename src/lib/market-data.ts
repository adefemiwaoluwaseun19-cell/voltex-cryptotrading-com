export type Coin = {
  id: string;
  name: string;
  symbol: string;
  glyph: string;
  swatch: string;
  price: number;
  change: number;
  holding: number;
  cap: string;
  volume: string;
  supply: string;
  about: string;
};

export const coins: Coin[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    glyph: "₿",
    swatch: "from-amber-400 to-orange-500",
    price: 67412.8,
    change: 3.24,
    holding: 0.4125,
    cap: "$1.33T",
    volume: "$28.4B",
    supply: "19.7M BTC",
    about:
      "The original proof-of-work blockchain and the largest digital asset by market capitalisation.",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    glyph: "Ξ",
    swatch: "from-indigo-500 to-fuchsia-500",
    price: 3428.6,
    change: 5.1,
    holding: 3.214,
    cap: "$412B",
    volume: "$14.1B",
    supply: "120.2M ETH",
    about: "A programmable settlement layer powering smart contracts, stablecoins and DeFi.",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    glyph: "S",
    swatch: "from-emerald-400 to-teal-500",
    price: 148.9,
    change: -1.82,
    holding: 96.4,
    cap: "$68.2B",
    volume: "$3.9B",
    supply: "458M SOL",
    about: "A high-throughput chain optimised for low-latency trading and consumer apps.",
  },
  {
    id: "avax",
    name: "Avalanche",
    symbol: "AVAX",
    glyph: "A",
    swatch: "from-rose-500 to-orange-400",
    price: 36.64,
    change: 0.64,
    holding: 142,
    cap: "$14.3B",
    volume: "$620M",
    supply: "390M AVAX",
    about: "A subnet-based network built for custom, application-specific blockchains.",
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    glyph: "◍",
    swatch: "from-sky-400 to-blue-600",
    price: 0.4421,
    change: 1.12,
    holding: 2400,
    cap: "$15.8B",
    volume: "$410M",
    supply: "35.4B ADA",
    about: "A research-driven proof-of-stake network with a formal-methods approach.",
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    glyph: "✕",
    swatch: "from-slate-300 to-slate-500",
    price: 0.6182,
    change: -0.47,
    holding: 1800,
    cap: "$34.1B",
    volume: "$1.2B",
    supply: "55.1B XRP",
    about: "A payments-focused ledger designed for fast, low-cost cross-border settlement.",
  },
  {
    id: "link",
    name: "Chainlink",
    symbol: "LINK",
    glyph: "◆",
    swatch: "from-blue-500 to-cyan-400",
    price: 17.24,
    change: 2.86,
    holding: 88,
    cap: "$10.4B",
    volume: "$540M",
    supply: "608M LINK",
    about: "The decentralised oracle network feeding off-chain data into smart contracts.",
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    glyph: "Ð",
    swatch: "from-yellow-300 to-amber-500",
    price: 0.1584,
    change: -3.11,
    holding: 12500,
    cap: "$22.6B",
    volume: "$980M",
    supply: "143B DOGE",
    about: "A community-driven payments coin with an inflationary, fixed-issuance schedule.",
  },
];

export const getCoin = (id: string) => coins.find((c) => c.id === id);

export const holdings = coins.filter((c) =>
  ["eth", "sol", "avax", "btc", "link"].includes(c.id),
);

export const portfolioValue = holdings.reduce((sum, c) => sum + c.holding * c.price, 0);

export const portfolioChange = 2.56;
export const portfolioChangeAbs = 1204.12;

export type Activity = {
  id: string;
  kind: "Buy" | "Sell" | "Deposit";
  asset: string;
  amount: string;
  value: string;
  when: string;
};

export const activity: Activity[] = [
  { id: "1", kind: "Buy", asset: "BTC", amount: "+0.0214 BTC", value: "$1,442.63", when: "Today · 14:22" },
  { id: "2", kind: "Sell", asset: "SOL", amount: "−12.40 SOL", value: "$1,846.36", when: "Today · 09:10" },
  { id: "3", kind: "Deposit", asset: "USD", amount: "+$2,500.00", value: "$2,500.00", when: "Yesterday · 18:04" },
  { id: "4", kind: "Buy", asset: "LINK", amount: "+24.0 LINK", value: "$413.76", when: "Mar 11 · 21:47" },
];

export const formatUsd = (value: number, maxDigits = 2) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : maxDigits,
  });

export const formatPct = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}%`;

// Deterministic pseudo-series so server and client render identically.
export function sparkline(seed: string, points = 32, trendUp = true) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) % 2147483647;
    const noise = ((h % 1000) / 1000 - 0.5) * 14;
    v += noise + (trendUp ? 1.1 : -1.1);
    out.push(v);
  }
  return out;
}
