export const nGram = (segments: readonly string[], n: number): Set<string> => {
  if (n < 1) {
    return new Set();
  }
  if (n === 1) {
    return new Set(segments);
  }
  const tokens = new Set<string>();
  for (let i = n; i <= segments.length; i++) {
    tokens.add(segments.slice(i - n, i).join(''));
  }
  return tokens;
};

export const nGramUpTo = (segments: readonly string[], maxGram: number): Set<string> => {
  if (maxGram < 1) {
    return new Set();
  }
  const tokens = new Set(segments);
  for (let n = 2; n <= maxGram; n++) {
    for (let i = n; i <= segments.length; i++) {
      tokens.add(segments.slice(i - n, i).join(''));
    }
  }
  return tokens;
};

const sliceEquals = (array: readonly unknown[], start1: number, start2: number, length: number) => {
  for (let i = 0; i < length; i++) {
    if (array[start1 + i] !== array[start2 + i]) {
      return false;
    }
  }
  return true;
};

export const nRepetend = (segments: readonly string[], repetendLength: number): Map<string, number> => {
  if (repetendLength < 1 || !isFinite(repetendLength)) {
    return new Map();
  }
  const repetendRepetitionsMap = new Map<string, number>();
  for (let i = 0; i <= segments.length - repetendLength - repetendLength; i++) {
    let repetition = 1;
    for (let j = i + repetendLength; sliceEquals(segments, i, j, repetendLength); j += repetendLength) {
      repetition++;
    }
    if (repetition !== 1) {
      const token = segments.slice(i, i + repetendLength).join('');
      repetition > (repetendRepetitionsMap.get(token) ?? 0) && repetendRepetitionsMap.set(token, repetition);
    }
  }
  return repetendRepetitionsMap;
};

export const nRepetendUpTo = (segments: readonly string[], maxRepetend: number): Map<string, number> => {
  if (maxRepetend < 1 || !isFinite(maxRepetend)) {
    return new Map();
  }
  const repetendRepetitionsMap = new Map<string, number>();
  for (let i = 1; i <= maxRepetend; i++) {
    nRepetend(segments, i).forEach((repetitions, repetend) => repetendRepetitionsMap.set(repetend, repetitions));
  }
  return repetendRepetitionsMap;
};

export const repetitions = (segments: readonly string[], maxRepetend: number): Set<string> => {
  const tokens = new Set<string>();
  nRepetendUpTo(segments, maxRepetend).forEach((repetitions, repetend) => {
    let token = repetend;
    for (let i = 1; i < repetitions; i++) {
      tokens.add((token += repetend));
    }
  });
  return tokens;
};

declare namespace Intl {
  interface Segment {
    readonly segment: string;
    readonly index: number;
    readonly input: string;
    readonly isWordLike: boolean;
  }

  class Segmenter {
    constructor(
      locales?: string | readonly string[],
      options?: {
        readonly granularity?: 'grapheme' | 'word' | 'sentence';
        readonly localeMatcher?: 'best fit' | 'lookup';
      },
    );
    segment(input: string): Iterable<Segment>;
  }
}

export const createSearchTokenizer = ({
  maxGram = 3,
  maxRepetend = 3,
  segmenter = new Intl.Segmenter(['ja', 'en']),
}: {
  readonly maxGram?: number;
  readonly maxRepetend?: number;
  readonly segmenter?: Intl.Segmenter;
} = {}) => {
  const segmentText = (text: string) => [...segmenter.segment(text)].map(({ segment }) => segment);
  return {
    tokenizeForIndex: (text: string): Set<string> => {
      const characters = segmentText(text);
      const tokens = nGramUpTo(characters, maxGram);
      repetitions(characters, maxRepetend).forEach(tokens.add, tokens);
      return tokens;
    },
    tokenizeForQuery: (query: string): Set<string> => {
      if (query.length === 0) {
        return new Set();
      }
      const characters = segmentText(query);
      if (characters.length < maxGram) {
        return new Set([query]);
      }
      const tokens = nGram(characters, maxGram);
      if (characters.length > maxGram) {
        nRepetendUpTo(characters, maxRepetend).forEach((repetitions, repetend) => {
          const newToken = repetend.repeat(repetitions);
          for (const token of tokens) {
            if (token.includes(newToken)) {
              return;
            }
            newToken.includes(token) && tokens.delete(token);
          }
          tokens.add(newToken);
        });
      }
      return tokens;
    },
  };
};
