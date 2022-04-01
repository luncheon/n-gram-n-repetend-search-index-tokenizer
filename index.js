"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchTokenizer = exports.repetitions = exports.nRepetendUpTo = exports.nRepetend = exports.nGramUpTo = exports.nGram = void 0;
const nGram = (segments, n) => {
    if (n < 1) {
        return new Set();
    }
    if (n === 1) {
        return new Set(segments);
    }
    const tokens = new Set();
    for (let i = n; i <= segments.length; i++) {
        tokens.add(segments.slice(i - n, i).join(''));
    }
    return tokens;
};
exports.nGram = nGram;
const nGramUpTo = (segments, maxGram) => {
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
exports.nGramUpTo = nGramUpTo;
const sliceEquals = (array, start1, start2, length) => {
    for (let i = 0; i < length; i++) {
        if (array[start1 + i] !== array[start2 + i]) {
            return false;
        }
    }
    return true;
};
const nRepetend = (segments, repetendLength) => {
    if (repetendLength < 1 || !isFinite(repetendLength)) {
        return new Map();
    }
    const repetendRepetitionsMap = new Map();
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
exports.nRepetend = nRepetend;
const nRepetendUpTo = (segments, maxRepetend) => {
    if (maxRepetend < 1 || !isFinite(maxRepetend)) {
        return new Map();
    }
    const repetendRepetitionsMap = new Map();
    for (let i = 1; i <= maxRepetend; i++) {
        (0, exports.nRepetend)(segments, i).forEach((repetitions, repetend) => repetendRepetitionsMap.set(repetend, repetitions));
    }
    return repetendRepetitionsMap;
};
exports.nRepetendUpTo = nRepetendUpTo;
const repetitions = (segments, maxRepetend) => {
    const tokens = new Set();
    (0, exports.nRepetendUpTo)(segments, maxRepetend).forEach((repetitions, repetend) => {
        let token = repetend;
        for (let i = 1; i < repetitions; i++) {
            tokens.add((token += repetend));
        }
    });
    return tokens;
};
exports.repetitions = repetitions;
const createSearchTokenizer = ({ maxGram = 3, maxRepetend = 3, segmenter = new Intl.Segmenter(['ja', 'en']), } = {}) => {
    const segmentText = (text) => [...segmenter.segment(text)].map(({ segment }) => segment);
    return {
        tokenizeForIndex: (text) => {
            const characters = segmentText(text);
            const tokens = (0, exports.nGramUpTo)(characters, maxGram);
            (0, exports.repetitions)(characters, maxRepetend).forEach(tokens.add, tokens);
            return tokens;
        },
        tokenizeForQuery: (query) => {
            if (query.length === 0) {
                return new Set();
            }
            const characters = segmentText(query);
            if (characters.length < maxGram) {
                return new Set([query]);
            }
            const tokens = (0, exports.nGram)(characters, maxGram);
            if (characters.length > maxGram) {
                (0, exports.nRepetendUpTo)(characters, maxRepetend).forEach((repetitions, repetend) => {
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
exports.createSearchTokenizer = createSearchTokenizer;
