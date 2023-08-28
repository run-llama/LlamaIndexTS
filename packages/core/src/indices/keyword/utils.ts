import rake from "rake-js";

// Get subtokens from a list of tokens., filtering for stopwords.
export function expandTokensWithSubtokens(tokens: Set<string>): Set<string> {
  const results: Set<string> = new Set();
  const regex: RegExp = /\w+/g;

  for (let token of tokens) {
    results.add(token);
    const subTokens: RegExpMatchArray | null = token.match(regex);
    if (subTokens && subTokens.length > 1) {
      for (let w of subTokens) {
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
  for (let k of keywords) {
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
  let tokens: string[] = [...textChunk.matchAll(regex)].map((token) =>
    token[0].toLowerCase().trim(),
  );

  // Creating a frequency map
  const valueCounts: Map<string, number> = new Map();
  for (let token of tokens) {
    valueCounts.set(token, (valueCounts.get(token) || 0) + 1);
  }

  // Sorting by frequency and taking the top 'maxKeywords' tokens
  const keywords: string[] = [...valueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])
    .slice(0, maxKeywords);

  return new Set(keywords);
}

export function rakeExtractKeywords(
  textChunk: string,
  maxKeywords: number | null = null,
): Set<string> {
  const keywords = rake(textChunk);
  const limitedKeywords = maxKeywords
    ? keywords.slice(0, maxKeywords)
    : keywords;
  return new Set(limitedKeywords);
}
