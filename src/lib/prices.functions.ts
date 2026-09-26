import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Internal coin id -> CoinGecko id
export const GECKO_IDS: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  sol: "solana",
  avax: "avalanche-2",
  ada: "cardano",
  xrp: "ripple",
  link: "chainlink",
  doge: "dogecoin",
};

export type LiveQuote = {
  price: number;
  change: number;
  cap: string;
  volume: string;
};

export type LiveQuotes = Record<string, LiveQuote>;

const compact = (n: number | undefined) => {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
};

export const getLiveQuotes = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveQuotes> => {
    const ids = Object.values(GECKO_IDS).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Price feed unavailable (${res.status})`);
    const json = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number; usd_market_cap?: number; usd_24h_vol?: number }
    >;

    const out: LiveQuotes = {};
    for (const [localId, geckoId] of Object.entries(GECKO_IDS)) {
      const row = json[geckoId];
      if (!row || typeof row.usd !== "number") continue;
      out[localId] = {
        price: row.usd,
        change: Number(row.usd_24h_change ?? 0),
        cap: compact(row.usd_market_cap),
        volume: compact(row.usd_24h_vol),
      };
    }
    return out;
  },
);

const RANGE_DAYS: Record<string, string> = {
  "1H": "1",
  "1D": "1",
  "1W": "7",
  "1M": "30",
  "1Y": "365",
};

export const getPriceHistory = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ coinId: z.string(), range: z.string() }).parse(data),
  )
  .handler(async ({ data }): Promise<number[]> => {
    const geckoId = GECKO_IDS[data.coinId];
    if (!geckoId) return [];
    const days = RANGE_DAYS[data.range] ?? "1";
    const url = `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Chart unavailable (${res.status})`);
    const json = (await res.json()) as { prices?: [number, number][] };
    let prices = (json.prices ?? []).map((p) => p[1]);
    if (data.range === "1H") prices = prices.slice(-12);
    // Downsample to a manageable number of points.
    const target = 60;
    if (prices.length > target) {
      const step = prices.length / target;
      prices = Array.from({ length: target }, (_, i) => prices[Math.floor(i * step)]!);
    }
    return prices;
  });
