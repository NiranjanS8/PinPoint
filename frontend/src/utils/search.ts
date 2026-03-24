export function getContentSearchScore(query: string, title: string, channel: string) {
  const titleScore = getFuzzyScore(query, title);
  const channelScore = getFuzzyScore(query, channel);

  if (titleScore < 0 && channelScore < 0) {
    return -1;
  }

  return Math.max(titleScore * 1.2, channelScore);
}

export function getFuzzyScore(query: string, text: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  const directIndex = normalizedText.indexOf(normalizedQuery);
  if (directIndex >= 0) {
    return 1000 - directIndex * 4 + normalizedQuery.length * 6;
  }

  let score = 0;
  let lastIndex = -1;

  for (const character of normalizedQuery) {
    const nextIndex = normalizedText.indexOf(character, lastIndex + 1);
    if (nextIndex < 0) {
      return -1;
    }

    score += 10;
    if (nextIndex === lastIndex + 1) {
      score += 8;
    }
    if (nextIndex === 0 || " -_/(".includes(normalizedText[nextIndex - 1] ?? "")) {
      score += 12;
    }

    lastIndex = nextIndex;
  }

  return score;
}

export function getBestMatchRanges(text: string, query: string): Array<[number, number]> {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    return [];
  }

  const lowerText = text.toLowerCase();
  const directIndex = lowerText.indexOf(trimmedQuery);
  if (directIndex >= 0) {
    return [[directIndex, directIndex + trimmedQuery.length]];
  }

  return query
    .trim()
    .split(/\s+/)
    .flatMap((term) => {
      const lowerTerm = term.toLowerCase();
      const index = lowerText.indexOf(lowerTerm);
      return index >= 0 ? ([[index, index + lowerTerm.length]] as Array<[number, number]>) : [];
    });
}
