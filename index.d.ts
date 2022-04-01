export declare const nGram: (segments: readonly string[], n: number) => Set<string>;
export declare const nGramUpTo: (segments: readonly string[], maxGram: number) => Set<string>;
export declare const nRepetend: (segments: readonly string[], repetendLength: number) => Map<string, number>;
export declare const nRepetendUpTo: (segments: readonly string[], maxRepetend: number) => Map<string, number>;
export declare const repetitions: (segments: readonly string[], maxRepetend: number) => Set<string>;
declare namespace Intl {
    interface Segment {
        readonly segment: string;
        readonly index: number;
        readonly input: string;
        readonly isWordLike: boolean;
    }
    class Segmenter {
        constructor(locales?: string | readonly string[], options?: {
            readonly granularity?: 'grapheme' | 'word' | 'sentence';
            readonly localeMatcher?: 'best fit' | 'lookup';
        });
        segment(input: string): Iterable<Segment>;
    }
}
export declare const createSearchTokenizer: ({ maxGram, maxRepetend, segmenter, }?: {
    readonly maxGram?: number | undefined;
    readonly maxRepetend?: number | undefined;
    readonly segmenter?: Intl.Segmenter | undefined;
}) => {
    tokenizeForIndex: (text: string) => Set<string>;
    tokenizeForQuery: (query: string) => Set<string>;
};
export {};
