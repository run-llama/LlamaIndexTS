// @ts-ignore
import rake from "rake-modified";

// Get subtokens from a list of tokens., filtering for stopwords.
export function expandTokensWithSubtokens(tokens: Set<string>): Set<string> {
  const results: Set<string> = new Set();
  const regex: RegExp = /\w+/g;

  for (const token of tokens) {
    results.add(token);
    const subTokens: RegExpMatchArray | null = token.match(regex);
    if (subTokens && subTokens.length > 1) {
      for (const w of subTokens) {
        results.add(w);
      }
    }
  }
  return results;
}

export function extractKeywordsGivenResponse(
  response: string,
  startToken: string = "",
  lowercase: boolean = true,
): Set<string> {
  const results: string[] = [];
  response = response.trim();

  if (response.startsWith(startToken)) {
    response = response.substring(startToken.length);
  }

  const keywords: string[] = response.split(",");
  for (const k of keywords) {
    let rk: string = k;
    if (lowercase) {
      rk = rk.toLowerCase();
    }
    results.push(rk.trim());
  }

  return expandTokensWithSubtokens(new Set(results));
}

export function simpleExtractKeywords(
  textChunk: string,
  maxKeywords?: number,
): Set<string> {
  const regex: RegExp = /\w+/g;
  const tokens: string[] = [...textChunk.matchAll(regex)].map((token) =>
    token[0].toLowerCase().trim(),
  );

  // Creating a frequency map
  const valueCounts: { [key: string]: number } = {};
  for (const token of tokens) {
    valueCounts[token] = (valueCounts[token] || 0) + 1;
  }

  // Sorting tokens by frequency
  const sortedTokens: string[] = Object.keys(valueCounts).sort(
    (a, b) => valueCounts[b] - valueCounts[a],
  );

  const keywords: string[] = maxKeywords
    ? sortedTokens.slice(0, maxKeywords)
    : sortedTokens;

  return new Set(keywords);
}

export function rakeExtractKeywords(
  textChunk: string,
  maxKeywords?: number,
): Set<string> {
  const keywords = Object.keys(rake(textChunk));
  const limitedKeywords = maxKeywords
    ? keywords.slice(0, maxKeywords)
    : keywords;
  return new Set(limitedKeywords);
}
