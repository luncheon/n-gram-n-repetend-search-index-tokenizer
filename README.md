# n-gram + n-repetend search index tokenizer

## Motivation

Using n-grams for search indexes and queries is vulnerable to repetition of the same pattern. For example,

- the trigram of `aaaaaaaaaa` is [`aaa`], which is the same as the trigram of `aaa`.
- the trigram of `ababababab` is [`aba`, `bab`], which is the same as the trigram of `abab`.

Therefore, not only n-grams but also repetitions are extracted as tokens.

## Installation

```sh
npm i @luncheon/n-gram-n-repetend-search-index-tokenizer
```

## Usage

```ts
import { createSearchTokenizer } from '@luncheon/n-gram-n-repetend-search-index-tokenizer';

const { tokenizeForIndex, tokenizeForQuery } = createSearchTokenizer({
  // these are default values and can be omitted
  maxGram = 3,
  maxRepetend = 3,
  segmenter = new Intl.Segmenter(['ja', 'en']),
});

// n-gram
console.log(tokenizeForIndex('abcd')); // Set(9) { 'a', 'b', 'c', 'd', 'ab', 'bc', 'cd', 'abc', 'bcd' }
console.log(tokenizeForQuery('abcd')); // Set(2) { 'abc', 'bcd' }

// 1-repetend
console.log(tokenizeForIndex('aaaaaa')); // Set(6) { 'a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa' }
console.log(tokenizeForQuery('aaaaaa')); // Set(1) { 'aaaaaa' }

// 2-repetend
console.log(tokenizeForIndex('ababab')); // Set(9) { 'a', 'b', 'ab', 'ba', 'aba', 'bab', 'abab', 'baba', 'ababab' }
console.log(tokenizeForQuery('ababab')); // Set(1) { 'ababab' }

// 3-repetend
console.log(tokenizeForIndex('abcabc')); // Set(10) { 'a', 'b', 'c', 'ab', 'bc', 'ca', 'abc', 'bca', 'cab', 'abcabc' }
console.log(tokenizeForQuery('abcabc')); // Set(1) { 'abcabc' }
```

## License

GPL 3.0
