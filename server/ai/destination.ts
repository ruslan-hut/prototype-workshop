import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_SECRET });

type DescribeParams = {
  city: string;
  country?: string;
  season?: string;
  currency?: string;
  budgetHint?: string;
  travelers?: string;
  interests?: string[];
  pace?: "chill" | "balanced" | "intense";
  locale?: string; // e.g., "uk-UA"
};

const memoryCache = new Map<string, { text: string; ts: number }>();
const TTL_MS = 10 * 60 * 1000;

function keyOf(p: DescribeParams) {
  return [
    p.city?.toLowerCase(),
    p.country?.toLowerCase() ?? "",
    p.season?.toLowerCase() ?? "",
    p.currency ?? "EUR",
    p.pace ?? "balanced",
    (p.interests ?? []).slice().sort().join(",")
  ].join("|");
}

function fallbackText(p: DescribeParams): string {
  return `${p.city}${p.country ? ", " + p.country : ""}: a popular destination combining landmarks, local food, and easy logistics. Suitable for travelers into ${(p.interests || ["culture","food"]).join(", ")}.`;
}

// Safely extract text from Responses API (supports `response.output_text` helper).
function responseText(res: any): string {
  // Preferred helper (SDK convenience):
  if (res?.output_text) return String(res.output_text).trim();
  // Fallback: walk output items
  const items = Array.isArray(res?.output) ? res.output : [];
  const parts: string[] = [];
  for (const it of items) {
    const content = it?.content;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (typeof c?.text === "string") parts.push(c.text);
      }
    }
    if (typeof it?.text === "string") parts.push(it.text);
  }
  return parts.join("\n").trim();
}

export async function describeDestination(p: DescribeParams): Promise<string> {
  const k = keyOf(p);
  const now = Date.now();
  const hit = memoryCache.get(k);
  if (hit && now - hit.ts < TTL_MS) return hit.text;

  if (!process.env.OPENAI_SECRET) {
    const fb = fallbackText(p);
    memoryCache.set(k, { text: fb, ts: now });
    return fb;
  }

  const instructions =
    "You are a travel concierge. Write in concise, natural language (80–140 words). Avoid hype. Structure: 1) city vibe; 2) 2–4 neighborhood or sight highlights; 3) why it fits these travelers; 4) one practical tip.";

  const user = [
    `Destination: ${p.city}${p.country ? ", " + p.country : ""}.`,
    p.season ? `Season: ${p.season}.` : "",
    p.travelers ? `Travelers: ${p.travelers}.` : "",
    p.budgetHint ? `Budget: ${p.budgetHint} (${p.currency || "EUR"}).` : "",
    p.interests?.length ? `Interests: ${p.interests.join(", ")}.` : "",
    `Trip pace: ${p.pace || "balanced"}.`,
    `Language: ${p.locale || "uk-UA"}.`
  ].filter(Boolean).join("\n");

  try {
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      instructions,
      input: user,
      temperature: 0.7,
      max_output_tokens: 220
    });
    const text = responseText(resp) || fallbackText(p);
    memoryCache.set(k, { text, ts: now });
    return text;
  } catch {
    const fb = fallbackText(p);
    memoryCache.set(k, { text: fb, ts: now });
    return fb;
  }
}