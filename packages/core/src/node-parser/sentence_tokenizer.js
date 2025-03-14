var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };

// lib/natural/tokenizers/tokenizer.js
var require_tokenizer = __commonJS({
  "lib/natural/tokenizers/tokenizer.js"(exports, module) {
    "use strict";
    var Tokenizer = class {
      trim(array) {
        while (array[array.length - 1] === "") {
          array.pop();
        }
        while (array[0] === "") {
          array.shift();
        }
        return array;
      }
    };
    module.exports = Tokenizer;
  },
});

// lib/natural/tokenizers/sentence_tokenizer.js
var require_sentence_tokenizer = __commonJS({
  "lib/natural/tokenizers/sentence_tokenizer.js"(exports, module) {
    var Tokenizer = require_tokenizer();
    var NUM = "NUMBER";
    var DELIM = "DELIM";
    var URI = "URI";
    var ABBREV = "ABBREV";
    var DEBUG = false;
    function generateUniqueCode(base, index) {
      return `{{${base}_${index}}}`;
    }
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    var SentenceTokenizer = class extends Tokenizer {
      constructor(abbreviations) {
        super();
        if (abbreviations) {
          this.abbreviations = abbreviations;
        } else {
          this.abbreviations = [];
        }
        this.replacementMap = null;
        this.replacementCounter = 0;
      }
      replaceUrisWithPlaceholders(text) {
        const urlPattern =
          /(https?:\/\/\S+|www\.\S+|ftp:\/\/\S+|(mailto:)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|file:\/\/\S+)/gi;
        const modifiedText = text.replace(urlPattern, (match) => {
          const placeholder = generateUniqueCode(
            URI,
            this.replacementCounter++,
          );
          this.replacementMap.set(placeholder, match);
          return placeholder;
        });
        return modifiedText;
      }
      replaceAbbreviations(text) {
        if (this.abbreviations.length === 0) {
          return text;
        }
        const pattern = new RegExp(
          `(${this.abbreviations.map((abbrev) => escapeRegExp(abbrev)).join("|")})`,
          "gi",
        );
        const replacedText = text.replace(pattern, (match) => {
          const code = generateUniqueCode(ABBREV, this.replacementCounter++);
          this.replacementMap.set(code, match);
          return code;
        });
        return replacedText;
      }
      replaceDelimitersWithPlaceholders(text) {
        const delimiterPattern = /([.?!… ]*)([.?!…])(["'”’)}\]]?)/g;
        const modifiedText = text.replace(
          delimiterPattern,
          (match, p1, p2, p3) => {
            const placeholder = generateUniqueCode(
              DELIM,
              this.replacementCounter++,
            );
            this.delimiterMap.set(placeholder, p1 + p2 + p3);
            return placeholder;
          },
        );
        return modifiedText;
      }
      splitOnPlaceholders(text, placeholders) {
        if (this.delimiterMap.size === 0) {
          return [text];
        }
        const keys = Array.from(this.delimiterMap.keys());
        const pattern = new RegExp(`(${keys.map(escapeRegExp).join("|")})`);
        const parts = text.split(pattern);
        const sentences = [];
        for (let i = 0; i < parts.length; i += 2) {
          const sentence = parts[i];
          const placeholder = parts[i + 1] || "";
          sentences.push(sentence + placeholder);
        }
        return sentences;
      }
      replaceNumbersWithCode(text) {
        const numberPattern = /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g;
        const replacedText = text.replace(numberPattern, (match) => {
          const code = generateUniqueCode(NUM, this.replacementCounter++);
          this.replacementMap.set(code, match);
          return code;
        });
        return replacedText;
      }
      revertReplacements(text) {
        let originalText = text;
        for (const [
          placeholder,
          replacement,
        ] of this.replacementMap.entries()) {
          const pattern = new RegExp(escapeRegExp(placeholder), "g");
          originalText = originalText.replace(pattern, replacement);
        }
        return originalText;
      }
      revertDelimiters(text) {
        let originalText = text;
        for (const [placeholder, replacement] of this.delimiterMap.entries()) {
          const pattern = new RegExp(escapeRegExp(placeholder), "g");
          originalText = originalText.replace(pattern, replacement);
        }
        return originalText;
      }
      tokenize(text) {
        this.replacementCounter = 0;
        this.replacementMap = /* @__PURE__ */ new Map();
        this.delimiterMap = /* @__PURE__ */ new Map();
        DEBUG &&
          console.log(
            "---Start of sentence tokenization-----------------------",
          );
        DEBUG && console.log("Original input: >>>" + text + "<<<");
        const result1 = this.replaceAbbreviations(text);
        DEBUG &&
          console.log(
            "Phase 1: replacing abbreviations: " + JSON.stringify(result1),
          );
        const result2 = this.replaceUrisWithPlaceholders(result1);
        DEBUG &&
          console.log("Phase 2: replacing URIs: " + JSON.stringify(result2));
        const result3 = this.replaceNumbersWithCode(result2);
        DEBUG &&
          console.log(
            "Phase 3: replacing numbers with placeholders: " +
              JSON.stringify(result3),
          );
        const result4 = this.replaceDelimitersWithPlaceholders(result3);
        DEBUG &&
          console.log(
            "Phase 4: replacing delimiters with placeholders: " +
              JSON.stringify(result4),
          );
        const sentences = this.splitOnPlaceholders(result4);
        DEBUG &&
          console.log(
            "Phase 5: splitting into sentences on placeholders: " +
              JSON.stringify(sentences),
          );
        const newSentences = sentences.map((s) => {
          const s1 = this.revertReplacements(s);
          return this.revertDelimiters(s1);
        });
        DEBUG &&
          console.log(
            "Phase 6: replacing back abbreviations, URIs, numbers and delimiters: " +
              JSON.stringify(newSentences),
          );
        const trimmedSentences = this.trim(newSentences);
        DEBUG &&
          console.log(
            "Phase 7: trimming array of empty sentences: " +
              JSON.stringify(trimmedSentences),
          );
        const trimmedSentences2 = trimmedSentences.map((sent) => sent.trim());
        DEBUG &&
          console.log(
            "Phase 8: trimming sentences from surrounding whitespace: " +
              JSON.stringify(trimmedSentences2),
          );
        DEBUG &&
          console.log(
            "---End of sentence tokenization--------------------------",
          );
        DEBUG &&
          console.log(
            "---Replacement map---------------------------------------",
          );
        DEBUG && console.log([...this.replacementMap.entries()]);
        DEBUG &&
          console.log(
            "---Delimiter map-----------------------------------------",
          );
        DEBUG && console.log([...this.delimiterMap.entries()]);
        DEBUG &&
          console.log(
            "---------------------------------------------------------",
          );
        return trimmedSentences2;
      }
    };
    module.exports = SentenceTokenizer;
  },
});
export default require_sentence_tokenizer();
