// generate from "tsup ./index.js --format esm"
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => {
  return (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
};
var __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value);
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __require = /* @__PURE__ */ ((x) =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
        })
      : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) =>
  function __require2() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __await = function (promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v),
        isAwait = (v = x.value) instanceof __await,
        done = x.done;
      Promise.resolve(isAwait ? v[0] : v)
        .then((y) =>
          isAwait
            ? resume(
                k === "return" ? k : "next",
                v[1] ? { done: y.done, value: y.value } : y,
                yes,
                no,
              )
            : yes({ value: y, done }),
        )
        .catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  };
  var method = (k) =>
    (it[k] = (x) => new Promise((yes, no) => resume(k, x, yes, no)));
  var it = {};
  return (
    (generator = generator.apply(__this, __arguments)),
    (it[__knownSymbol("asyncIterator")] = () => it),
    method("next"),
    method("throw"),
    method("return"),
    it
  );
};
var __yieldStar = (value) => {
  var obj = value[__knownSymbol("asyncIterator")];
  var isAwait = false;
  var method;
  var it = {};
  if (obj == null) {
    obj = value[__knownSymbol("iterator")]();
    method = (k) => (it[k] = (x) => obj[k](x));
  } else {
    obj = obj.call(value);
    method = (k) =>
      (it[k] = (v) => {
        if (isAwait) {
          isAwait = false;
          if (k === "throw") throw v;
          return v;
        }
        isAwait = true;
        return {
          done: false,
          value: new __await(
            new Promise((resolve) => {
              var x = obj[k](v);
              if (!(x instanceof Object)) throw TypeError("Object expected");
              resolve(x);
            }),
            1,
          ),
        };
      });
  }
  return (
    (it[__knownSymbol("iterator")] = () => it),
    method("next"),
    "throw" in obj
      ? method("throw")
      : (it.throw = (x) => {
          throw x;
        }),
    "return" in obj && method("return"),
    it
  );
};
var __forAwait = (obj, it, method) =>
  (it = obj[__knownSymbol("asyncIterator")])
    ? it.call(obj)
    : ((obj = obj[__knownSymbol("iterator")]()),
      (it = {}),
      (method = (key, fn) =>
        (fn = obj[key]) &&
        (it[key] = (arg) =>
          new Promise(
            (yes, no, done) => (
              (arg = fn.call(obj, arg)),
              (done = arg.done),
              Promise.resolve(arg.value).then(
                (value) => yes({ value, done }),
                no,
              )
            ),
          ))),
      method("next"),
      method("return"),
      it);

// lib/error.js
var require_error = __commonJS({
  "lib/error.js"(exports, module) {
    "use strict";
    var ApiError = class extends Error {
      /**
       * Creates a representation of an API error.
       *
       * @param {string} message - Error message
       * @param {Request} request - HTTP request
       * @param {Response} response - HTTP response
       * @returns {ApiError} - An instance of ApiError
       */
      constructor(message, request, response) {
        super(message);
        this.name = "ApiError";
        this.request = request;
        this.response = response;
      }
    };
    module.exports = ApiError;
  },
});

// lib/identifier.js
var require_identifier = __commonJS({
  "lib/identifier.js"(exports, module) {
    "use strict";
    var ModelVersionIdentifier = class _ModelVersionIdentifier {
      /*
       * @param {string} Required. The model owner.
       * @param {string} Required. The model name.
       * @param {string} The model version.
       */
      constructor(owner, name, version = null) {
        this.owner = owner;
        this.name = name;
        this.version = version;
      }
      /*
       * Parse a reference to a model version
       *
       * @param {string}
       * @returns {ModelVersionIdentifier}
       * @throws {Error} If the reference is invalid.
       */
      static parse(ref) {
        const match = ref.match(
          new RegExp("^(?<owner>[^/]+)\\/(?<name>[^/:]+)(:(?<version>.+))?$"),
        );
        if (!match) {
          throw new Error(
            `Invalid reference to model version: ${ref}. Expected format: owner/name or owner/name:version`,
          );
        }
        const { owner, name, version } = match.groups;
        return new _ModelVersionIdentifier(owner, name, version);
      }
    };
    module.exports = ModelVersionIdentifier;
  },
});

// lib/util.js
var require_util = __commonJS({
  "lib/util.js"(exports, module) {
    "use strict";
    var ApiError = require_error();
    function validateWebhook(requestData, secret) {
      return __async(this, null, function* () {
        let { id, timestamp, body, signature } = requestData;
        const signingSecret = secret || requestData.secret;
        if (requestData && requestData.headers && requestData.body) {
          id = requestData.headers.get("webhook-id");
          timestamp = requestData.headers.get("webhook-timestamp");
          signature = requestData.headers.get("webhook-signature");
          body = requestData.body;
        }
        if (body instanceof ReadableStream || body.readable) {
          try {
            body = yield new Response(body).text();
          } catch (err) {
            throw new Error(`Error reading body: ${err.message}`);
          }
        } else if (isTypedArray(body)) {
          body = yield new Blob([body]).text();
        } else if (typeof body !== "string") {
          throw new Error("Invalid body type");
        }
        if (!id || !timestamp || !signature) {
          throw new Error("Missing required webhook headers");
        }
        if (!body) {
          throw new Error("Missing required body");
        }
        if (!signingSecret) {
          throw new Error("Missing required secret");
        }
        const signedContent = `${id}.${timestamp}.${body}`;
        const computedSignature = yield createHMACSHA256(
          signingSecret.split("_").pop(),
          signedContent,
        );
        const expectedSignatures = signature
          .split(" ")
          .map((sig) => sig.split(",")[1]);
        return expectedSignatures.some(
          (expectedSignature) => expectedSignature === computedSignature,
        );
      });
    }
    function createHMACSHA256(secret, data) {
      return __async(this, null, function* () {
        const encoder = new TextEncoder();
        let crypto = globalThis.crypto;
        if (typeof crypto === "undefined" && typeof __require === "function") {
          crypto = __require("crypto").webcrypto;
        }
        const key = yield crypto.subtle.importKey(
          "raw",
          base64ToBytes(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const signature = yield crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(data),
        );
        return bytesToBase64(signature);
      });
    }
    function base64ToBytes(base64) {
      return Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
    }
    function bytesToBase64(bytes) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
    }
    function withAutomaticRetries(_0) {
      return __async(this, arguments, function* (request, options = {}) {
        const shouldRetry = options.shouldRetry || (() => false);
        const maxRetries = options.maxRetries || 5;
        const interval = options.interval || 500;
        const jitter = options.jitter || 100;
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        let attempts = 0;
        do {
          let delay = interval * 2 ** attempts + Math.random() * jitter;
          try {
            const response = yield request();
            if (response.ok || !shouldRetry(response)) {
              return response;
            }
          } catch (error) {
            if (error instanceof ApiError) {
              const retryAfter = error.response.headers.get("Retry-After");
              if (retryAfter) {
                if (!Number.isInteger(retryAfter)) {
                  const date = new Date(retryAfter);
                  if (!Number.isNaN(date.getTime())) {
                    delay =
                      date.getTime() - /* @__PURE__ */ new Date().getTime();
                  }
                } else {
                  delay = retryAfter * 1e3;
                }
              }
            }
          }
          if (Number.isInteger(maxRetries) && maxRetries > 0) {
            if (Number.isInteger(delay) && delay > 0) {
              yield sleep(interval * 2 ** (options.maxRetries - maxRetries));
            }
            attempts += 1;
          }
        } while (attempts < maxRetries);
        return request();
      });
    }
    var MAX_DATA_URI_SIZE = 1e7;
    function transformFileInputs(inputs) {
      return __async(this, null, function* () {
        let totalBytes = 0;
        const result = yield transform(inputs, (value) =>
          __async(this, null, function* () {
            let buffer;
            let mime;
            if (value instanceof Blob) {
              buffer = yield value.arrayBuffer();
              mime = value.type;
            } else if (isTypedArray(value)) {
              buffer = value;
            } else {
              return value;
            }
            totalBytes += buffer.byteLength;
            if (totalBytes > MAX_DATA_URI_SIZE) {
              throw new Error(
                `Combined filesize of prediction ${totalBytes} bytes exceeds 10mb limit for inline encoding, please provide URLs instead`,
              );
            }
            const data = bytesToBase64(buffer);
            mime = mime != null ? mime : "application/octet-stream";
            return `data:${mime};base64,${data}`;
          }),
        );
        return result;
      });
    }
    function transform(value, mapper) {
      return __async(this, null, function* () {
        if (Array.isArray(value)) {
          let copy = [];
          for (const val of value) {
            copy = yield transform(val, mapper);
          }
          return copy;
        }
        if (isPlainObject(value)) {
          const copy = {};
          for (const key of Object.keys(value)) {
            copy[key] = yield transform(value[key], mapper);
          }
          return copy;
        }
        return yield mapper(value);
      });
    }
    function isTypedArray(arr) {
      return (
        arr instanceof Int8Array ||
        arr instanceof Int16Array ||
        arr instanceof Int32Array ||
        arr instanceof Uint8Array ||
        arr instanceof Uint8ClampedArray ||
        arr instanceof Uint16Array ||
        arr instanceof Uint32Array ||
        arr instanceof Float32Array ||
        arr instanceof Float64Array
      );
    }
    function isPlainObject(value) {
      const isObjectLike = typeof value === "object" && value !== null;
      if (!isObjectLike || String(value) !== "[object Object]") {
        return false;
      }
      const proto = Object.getPrototypeOf(value);
      if (proto === null) {
        return true;
      }
      const Ctor =
        Object.prototype.hasOwnProperty.call(proto, "constructor") &&
        proto.constructor;
      return (
        typeof Ctor === "function" &&
        Ctor instanceof Ctor &&
        Function.prototype.toString.call(Ctor) ===
          Function.prototype.toString.call(Object)
      );
    }
    function parseProgressFromLogs(input) {
      const logs = typeof input === "object" && input.logs ? input.logs : input;
      if (!logs || typeof logs !== "string") {
        return null;
      }
      const pattern = /^\s*(\d+)%\s*\|.+?\|\s*(\d+)\/(\d+)/;
      const lines = logs.split("\n").reverse();
      for (const line of lines) {
        const matches = line.match(pattern);
        if (matches && matches.length === 4) {
          return {
            percentage: parseInt(matches[1], 10) / 100,
            current: parseInt(matches[2], 10),
            total: parseInt(matches[3], 10),
          };
        }
      }
      return null;
    }
    function streamAsyncIterator(stream) {
      return __asyncGenerator(this, null, function* () {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = yield new __await(reader.read());
            if (done) return;
            yield value;
          }
        } finally {
          reader.releaseLock();
        }
      });
    }
    module.exports = {
      transformFileInputs,
      validateWebhook,
      withAutomaticRetries,
      parseProgressFromLogs,
      streamAsyncIterator,
    };
  },
});

// vendor/eventsource-parser/stream.js
var require_stream = __commonJS({
  "vendor/eventsource-parser/stream.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if ((from && typeof from === "object") || typeof from === "function") {
        for (const key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, {
              get: () => from[key],
              enumerable:
                !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
            });
      }
      return to;
    };
    var __toCommonJS = (mod) =>
      __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var input_exports = {};
    __export(input_exports, {
      EventSourceParserStream: () => EventSourceParserStream,
    });
    module.exports = __toCommonJS(input_exports);
    function createParser(onParse) {
      let isFirstChunk;
      let buffer;
      let startingPosition;
      let startingFieldLength;
      let eventId;
      let eventName;
      let data;
      reset();
      return {
        feed,
        reset,
      };
      function reset() {
        isFirstChunk = true;
        buffer = "";
        startingPosition = 0;
        startingFieldLength = -1;
        eventId = void 0;
        eventName = void 0;
        data = "";
      }
      function feed(chunk) {
        buffer = buffer ? buffer + chunk : chunk;
        if (isFirstChunk && hasBom(buffer)) {
          buffer = buffer.slice(BOM.length);
        }
        isFirstChunk = false;
        const length = buffer.length;
        let position = 0;
        let discardTrailingNewline = false;
        while (position < length) {
          if (discardTrailingNewline) {
            if (buffer[position] === "\n") {
              ++position;
            }
            discardTrailingNewline = false;
          }
          let lineLength = -1;
          let fieldLength = startingFieldLength;
          let character;
          for (
            let index = startingPosition;
            lineLength < 0 && index < length;
            ++index
          ) {
            character = buffer[index];
            if (character === ":" && fieldLength < 0) {
              fieldLength = index - position;
            } else if (character === "\r") {
              discardTrailingNewline = true;
              lineLength = index - position;
            } else if (character === "\n") {
              lineLength = index - position;
            }
          }
          if (lineLength < 0) {
            startingPosition = length - position;
            startingFieldLength = fieldLength;
            break;
          } else {
            startingPosition = 0;
            startingFieldLength = -1;
          }
          parseEventStreamLine(buffer, position, fieldLength, lineLength);
          position += lineLength + 1;
        }
        if (position === length) {
          buffer = "";
        } else if (position > 0) {
          buffer = buffer.slice(position);
        }
      }
      function parseEventStreamLine(
        lineBuffer,
        index,
        fieldLength,
        lineLength,
      ) {
        if (lineLength === 0) {
          if (data.length > 0) {
            onParse({
              type: "event",
              id: eventId,
              event: eventName || void 0,
              data: data.slice(0, -1),
              // remove trailing newline
            });
            data = "";
            eventId = void 0;
          }
          eventName = void 0;
          return;
        }
        const noValue = fieldLength < 0;
        const field = lineBuffer.slice(
          index,
          index + (noValue ? lineLength : fieldLength),
        );
        let step = 0;
        if (noValue) {
          step = lineLength;
        } else if (lineBuffer[index + fieldLength + 1] === " ") {
          step = fieldLength + 2;
        } else {
          step = fieldLength + 1;
        }
        const position = index + step;
        const valueLength = lineLength - step;
        const value = lineBuffer
          .slice(position, position + valueLength)
          .toString();
        if (field === "data") {
          data += value ? "".concat(value, "\n") : "\n";
        } else if (field === "event") {
          eventName = value;
        } else if (field === "id" && !value.includes("\0")) {
          eventId = value;
        } else if (field === "retry") {
          const retry = parseInt(value, 10);
          if (!Number.isNaN(retry)) {
            onParse({
              type: "reconnect-interval",
              value: retry,
            });
          }
        }
      }
    }
    var BOM = [239, 187, 191];
    function hasBom(buffer) {
      return BOM.every(
        (charCode, index) => buffer.charCodeAt(index) === charCode,
      );
    }
    var EventSourceParserStream = class extends TransformStream {
      constructor() {
        let parser;
        super({
          start(controller) {
            parser = createParser((event) => {
              if (event.type === "event") {
                controller.enqueue(event);
              }
            });
          },
          transform(chunk) {
            parser.feed(chunk);
          },
        });
      }
    };
  },
});

// vendor/streams-text-encoding/text-decoder-stream.js
var require_text_decoder_stream = __commonJS({
  "vendor/streams-text-encoding/text-decoder-stream.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if ((from && typeof from === "object") || typeof from === "function") {
        for (const key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, {
              get: () => from[key],
              enumerable:
                !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
            });
      }
      return to;
    };
    var __toCommonJS = (mod) =>
      __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
    var input_exports = {};
    __export(input_exports, {
      TextDecoderStream: () => TextDecoderStream,
    });
    module.exports = __toCommonJS(input_exports);
    var decDecoder = Symbol("decDecoder");
    var decTransform = Symbol("decTransform");
    var TextDecodeTransformer = class {
      constructor(decoder) {
        this.decoder_ = decoder;
      }
      transform(chunk, controller) {
        if (!(chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk))) {
          throw new TypeError("Input data must be a BufferSource");
        }
        const text = this.decoder_.decode(chunk, { stream: true });
        if (text.length !== 0) {
          controller.enqueue(text);
        }
      }
      flush(controller) {
        const text = this.decoder_.decode();
        if (text.length !== 0) {
          controller.enqueue(text);
        }
      }
    };
    var TextDecoderStream = class {
      constructor(label, options) {
        const decoder = new TextDecoder(label || "utf-8", options || {});
        this[decDecoder] = decoder;
        this[decTransform] = new TransformStream(
          new TextDecodeTransformer(decoder),
        );
      }
      get encoding() {
        return this[decDecoder].encoding;
      }
      get fatal() {
        return this[decDecoder].fatal;
      }
      get ignoreBOM() {
        return this[decDecoder].ignoreBOM;
      }
      get readable() {
        return this[decTransform].readable;
      }
      get writable() {
        return this[decTransform].writable;
      }
    };
    var encEncoder = Symbol("encEncoder");
    var encTransform = Symbol("encTransform");
  },
});

// lib/stream.js
var require_stream2 = __commonJS({
  "lib/stream.js"(exports, module) {
    "use strict";
    var ApiError = require_error();
    var { streamAsyncIterator } = require_util();
    var { EventSourceParserStream } = require_stream();
    var { TextDecoderStream } =
      typeof globalThis.TextDecoderStream === "undefined"
        ? require_text_decoder_stream()
        : globalThis;
    var ServerSentEvent = class {
      /**
       * Create a new server-sent event.
       *
       * @param {string} event The event name.
       * @param {string} data The event data.
       * @param {string} id The event ID.
       * @param {number} retry The retry time.
       */
      constructor(event, data, id, retry) {
        this.event = event;
        this.data = data;
        this.id = id;
        this.retry = retry;
      }
      /**
       * Convert the event to a string.
       */
      toString() {
        if (this.event === "output") {
          return this.data;
        }
        return "";
      }
    };
    function createReadableStream({ url, fetch, options = {} }) {
      return new ReadableStream({
        start(controller) {
          return __async(this, null, function* () {
            const init = __spreadProps(__spreadValues({}, options), {
              headers: __spreadProps(__spreadValues({}, options.headers), {
                Accept: "text/event-stream",
              }),
            });
            const response = yield fetch(url, init);
            if (!response.ok) {
              const text = yield response.text();
              const request = new Request(url, init);
              controller.error(
                new ApiError(
                  `Request to ${url} failed with status ${response.status}: ${text}`,
                  request,
                  response,
                ),
              );
            }
            const stream = response.body
              .pipeThrough(new TextDecoderStream())
              .pipeThrough(new EventSourceParserStream());
            try {
              for (
                var iter = __forAwait(streamAsyncIterator(stream)),
                  more,
                  temp,
                  error;
                (more = !(temp = yield iter.next()).done);
                more = false
              ) {
                const event = temp.value;
                if (event.event === "error") {
                  controller.error(new Error(event.data));
                  break;
                }
                controller.enqueue(
                  new ServerSentEvent(event.event, event.data, event.id),
                );
                if (event.event === "done") {
                  break;
                }
              }
            } catch (temp) {
              error = [temp];
            } finally {
              try {
                more && (temp = iter.return) && (yield temp.call(iter));
              } finally {
                if (error) throw error[0];
              }
            }
            controller.close();
          });
        },
      });
    }
    module.exports = {
      createReadableStream,
      ServerSentEvent,
    };
  },
});

// lib/accounts.js
var require_accounts = __commonJS({
  "lib/accounts.js"(exports, module) {
    "use strict";
    function getCurrentAccount() {
      return __async(this, null, function* () {
        const response = yield this.request("/account", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      current: getCurrentAccount,
    };
  },
});

// lib/collections.js
var require_collections = __commonJS({
  "lib/collections.js"(exports, module) {
    "use strict";
    function getCollection(collection_slug) {
      return __async(this, null, function* () {
        const response = yield this.request(`/collections/${collection_slug}`, {
          method: "GET",
        });
        return response.json();
      });
    }
    function listCollections() {
      return __async(this, null, function* () {
        const response = yield this.request("/collections", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = { get: getCollection, list: listCollections };
  },
});

// lib/deployments.js
var require_deployments = __commonJS({
  "lib/deployments.js"(exports, module) {
    "use strict";
    var { transformFileInputs } = require_util();
    function createPrediction(deployment_owner, deployment_name, options) {
      return __async(this, null, function* () {
        const _a = options,
          { stream, input } = _a,
          data = __objRest(_a, ["stream", "input"]);
        if (data.webhook) {
          try {
            new URL(data.webhook);
          } catch (err) {
            throw new Error("Invalid webhook URL");
          }
        }
        const response = yield this.request(
          `/deployments/${deployment_owner}/${deployment_name}/predictions`,
          {
            method: "POST",
            data: __spreadProps(__spreadValues({}, data), {
              input: yield transformFileInputs(input),
              stream,
            }),
          },
        );
        return response.json();
      });
    }
    function getDeployment(deployment_owner, deployment_name) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/deployments/${deployment_owner}/${deployment_name}`,
          {
            method: "GET",
          },
        );
        return response.json();
      });
    }
    function createDeployment(deployment_config) {
      return __async(this, null, function* () {
        const response = yield this.request("/deployments", {
          method: "POST",
          data: deployment_config,
        });
        return response.json();
      });
    }
    function updateDeployment(
      deployment_owner,
      deployment_name,
      deployment_config,
    ) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/deployments/${deployment_owner}/${deployment_name}`,
          {
            method: "PATCH",
            data: deployment_config,
          },
        );
        return response.json();
      });
    }
    function listDeployments() {
      return __async(this, null, function* () {
        const response = yield this.request("/deployments", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      predictions: {
        create: createPrediction,
      },
      get: getDeployment,
      create: createDeployment,
      update: updateDeployment,
      list: listDeployments,
    };
  },
});

// lib/hardware.js
var require_hardware = __commonJS({
  "lib/hardware.js"(exports, module) {
    "use strict";
    function listHardware() {
      return __async(this, null, function* () {
        const response = yield this.request("/hardware", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      list: listHardware,
    };
  },
});

// lib/models.js
var require_models = __commonJS({
  "lib/models.js"(exports, module) {
    "use strict";
    function getModel(model_owner, model_name) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/models/${model_owner}/${model_name}`,
          {
            method: "GET",
          },
        );
        return response.json();
      });
    }
    function listModelVersions(model_owner, model_name) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/models/${model_owner}/${model_name}/versions`,
          {
            method: "GET",
          },
        );
        return response.json();
      });
    }
    function getModelVersion(model_owner, model_name, version_id) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/models/${model_owner}/${model_name}/versions/${version_id}`,
          {
            method: "GET",
          },
        );
        return response.json();
      });
    }
    function listModels() {
      return __async(this, null, function* () {
        const response = yield this.request("/models", {
          method: "GET",
        });
        return response.json();
      });
    }
    function createModel(model_owner, model_name, options) {
      return __async(this, null, function* () {
        const data = __spreadValues(
          { owner: model_owner, name: model_name },
          options,
        );
        const response = yield this.request("/models", {
          method: "POST",
          data,
        });
        return response.json();
      });
    }
    module.exports = {
      get: getModel,
      list: listModels,
      create: createModel,
      versions: { list: listModelVersions, get: getModelVersion },
    };
  },
});

// lib/predictions.js
var require_predictions = __commonJS({
  "lib/predictions.js"(exports, module) {
    "use strict";
    var { transformFileInputs } = require_util();
    function createPrediction(options) {
      return __async(this, null, function* () {
        const _a = options,
          { model, version, stream, input } = _a,
          data = __objRest(_a, ["model", "version", "stream", "input"]);
        if (data.webhook) {
          try {
            new URL(data.webhook);
          } catch (err) {
            throw new Error("Invalid webhook URL");
          }
        }
        let response;
        if (version) {
          response = yield this.request("/predictions", {
            method: "POST",
            data: __spreadProps(__spreadValues({}, data), {
              input: yield transformFileInputs(input),
              version,
              stream,
            }),
          });
        } else if (model) {
          response = yield this.request(`/models/${model}/predictions`, {
            method: "POST",
            data: __spreadProps(__spreadValues({}, data), {
              input: yield transformFileInputs(input),
              stream,
            }),
          });
        } else {
          throw new Error("Either model or version must be specified");
        }
        return response.json();
      });
    }
    function getPrediction(prediction_id) {
      return __async(this, null, function* () {
        const response = yield this.request(`/predictions/${prediction_id}`, {
          method: "GET",
        });
        return response.json();
      });
    }
    function cancelPrediction(prediction_id) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/predictions/${prediction_id}/cancel`,
          {
            method: "POST",
          },
        );
        return response.json();
      });
    }
    function listPredictions() {
      return __async(this, null, function* () {
        const response = yield this.request("/predictions", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      create: createPrediction,
      get: getPrediction,
      cancel: cancelPrediction,
      list: listPredictions,
    };
  },
});

// lib/trainings.js
var require_trainings = __commonJS({
  "lib/trainings.js"(exports, module) {
    "use strict";
    function createTraining(model_owner, model_name, version_id, options) {
      return __async(this, null, function* () {
        const data = __objRest(options, []);
        if (data.webhook) {
          try {
            new URL(data.webhook);
          } catch (err) {
            throw new Error("Invalid webhook URL");
          }
        }
        const response = yield this.request(
          `/models/${model_owner}/${model_name}/versions/${version_id}/trainings`,
          {
            method: "POST",
            data,
          },
        );
        return response.json();
      });
    }
    function getTraining(training_id) {
      return __async(this, null, function* () {
        const response = yield this.request(`/trainings/${training_id}`, {
          method: "GET",
        });
        return response.json();
      });
    }
    function cancelTraining(training_id) {
      return __async(this, null, function* () {
        const response = yield this.request(
          `/trainings/${training_id}/cancel`,
          {
            method: "POST",
          },
        );
        return response.json();
      });
    }
    function listTrainings() {
      return __async(this, null, function* () {
        const response = yield this.request("/trainings", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      create: createTraining,
      get: getTraining,
      cancel: cancelTraining,
      list: listTrainings,
    };
  },
});

// lib/webhooks.js
var require_webhooks = __commonJS({
  "lib/webhooks.js"(exports, module) {
    "use strict";
    function getDefaultWebhookSecret() {
      return __async(this, null, function* () {
        const response = yield this.request("/webhooks/default/secret", {
          method: "GET",
        });
        return response.json();
      });
    }
    module.exports = {
      default: {
        secret: {
          get: getDefaultWebhookSecret,
        },
      },
    };
  },
});

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "replicate",
      version: "1.0.0",
      description: "",
      main: "index.js",
      scripts: {
        build: "tsup ./index.js --format esm",
      },
      repository: {
        type: "git",
        url: "https://github.com/himself65/LlamaIndexTS.git",
      },
      private: true,
      devDependencies: {
        tsup: "^8.0.2",
      },
    };
  },
});

// index.js
var require_replicate = __commonJS({
  "index.js"(exports, module) {
    var ApiError = require_error();
    var ModelVersionIdentifier = require_identifier();
    var { createReadableStream } = require_stream2();
    var {
      withAutomaticRetries,
      validateWebhook,
      parseProgressFromLogs,
      streamAsyncIterator,
    } = require_util();
    var accounts = require_accounts();
    var collections = require_collections();
    var deployments = require_deployments();
    var hardware = require_hardware();
    var models = require_models();
    var predictions = require_predictions();
    var trainings = require_trainings();
    var webhooks = require_webhooks();
    var packageJSON = require_package();
    var Replicate = class {
      /**
       * Create a new Replicate API client instance.
       *
       * @param {object} options - Configuration options for the client
       * @param {string} options.auth - API access token. Defaults to the `REPLICATE_API_TOKEN` environment variable.
       * @param {string} options.userAgent - Identifier of your app
       * @param {string} [options.baseUrl] - Defaults to https://api.replicate.com/v1
       * @param {Function} [options.fetch] - Fetch function to use. Defaults to `globalThis.fetch`
       */
      constructor(options = {}) {
        this.auth =
          options.auth ||
          (typeof process !== "undefined"
            ? process.env.REPLICATE_API_TOKEN
            : null);
        this.userAgent =
          options.userAgent || `replicate-javascript/${packageJSON.version}`;
        this.baseUrl = options.baseUrl || "https://api.replicate.com/v1";
        this.fetch = options.fetch || globalThis.fetch;
        this.accounts = {
          current: accounts.current.bind(this),
        };
        this.collections = {
          list: collections.list.bind(this),
          get: collections.get.bind(this),
        };
        this.deployments = {
          get: deployments.get.bind(this),
          create: deployments.create.bind(this),
          update: deployments.update.bind(this),
          list: deployments.list.bind(this),
          predictions: {
            create: deployments.predictions.create.bind(this),
          },
        };
        this.hardware = {
          list: hardware.list.bind(this),
        };
        this.models = {
          get: models.get.bind(this),
          list: models.list.bind(this),
          create: models.create.bind(this),
          versions: {
            list: models.versions.list.bind(this),
            get: models.versions.get.bind(this),
          },
        };
        this.predictions = {
          create: predictions.create.bind(this),
          get: predictions.get.bind(this),
          cancel: predictions.cancel.bind(this),
          list: predictions.list.bind(this),
        };
        this.trainings = {
          create: trainings.create.bind(this),
          get: trainings.get.bind(this),
          cancel: trainings.cancel.bind(this),
          list: trainings.list.bind(this),
        };
        this.webhooks = {
          default: {
            secret: {
              get: webhooks.default.secret.get.bind(this),
            },
          },
        };
      }
      /**
       * Run a model and wait for its output.
       *
       * @param {string} ref - Required. The model version identifier in the format "owner/name" or "owner/name:version"
       * @param {object} options
       * @param {object} options.input - Required. An object with the model inputs
       * @param {object} [options.wait] - Options for waiting for the prediction to finish
       * @param {number} [options.wait.interval] - Polling interval in milliseconds. Defaults to 500
       * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
       * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
       * @param {Function} [progress] - Callback function that receives the prediction object as it's updated. The function is called when the prediction is created, each time its updated while polling for completion, and when it's completed.
       * @throws {Error} If the reference is invalid
       * @throws {Error} If the prediction failed
       * @returns {Promise<object>} - Resolves with the output of running the model
       */
      run(ref, options, progress) {
        return __async(this, null, function* () {
          const _a = options,
            { wait } = _a,
            data = __objRest(_a, ["wait"]);
          const identifier = ModelVersionIdentifier.parse(ref);
          let prediction;
          if (identifier.version) {
            prediction = yield this.predictions.create(
              __spreadProps(__spreadValues({}, data), {
                version: identifier.version,
              }),
            );
          } else if (identifier.owner && identifier.name) {
            prediction = yield this.predictions.create(
              __spreadProps(__spreadValues({}, data), {
                model: `${identifier.owner}/${identifier.name}`,
              }),
            );
          } else {
            throw new Error("Invalid model version identifier");
          }
          if (progress) {
            progress(prediction);
          }
          const { signal } = options;
          prediction = yield this.wait(
            prediction,
            wait || {},
            (updatedPrediction) =>
              __async(this, null, function* () {
                if (progress) {
                  progress(updatedPrediction);
                }
                if (signal && signal.aborted) {
                  yield this.predictions.cancel(updatedPrediction.id);
                  return true;
                }
                return false;
              }),
          );
          if (progress) {
            progress(prediction);
          }
          if (prediction.status === "failed") {
            throw new Error(`Prediction failed: ${prediction.error}`);
          }
          return prediction.output;
        });
      }
      /**
       * Make a request to the Replicate API.
       *
       * @param {string} route - REST API endpoint path
       * @param {object} options - Request parameters
       * @param {string} [options.method] - HTTP method. Defaults to GET
       * @param {object} [options.params] - Query parameters
       * @param {object|Headers} [options.headers] - HTTP headers
       * @param {object} [options.data] - Body parameters
       * @returns {Promise<Response>} - Resolves with the response object
       * @throws {ApiError} If the request failed
       */
      request(route, options) {
        return __async(this, null, function* () {
          const { auth, baseUrl, userAgent } = this;
          let url;
          if (route instanceof URL) {
            url = route;
          } else {
            url = new URL(
              route.startsWith("/") ? route.slice(1) : route,
              baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
            );
          }
          const { method = "GET", params = {}, data } = options;
          for (const [key, value] of Object.entries(params)) {
            url.searchParams.append(key, value);
          }
          const headers = {};
          if (auth) {
            headers["Authorization"] = `Token ${auth}`;
          }
          headers["Content-Type"] = "application/json";
          headers["User-Agent"] = userAgent;
          if (options.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
              headers[key] = value;
            }
          }
          const init = {
            method,
            headers,
            body: data ? JSON.stringify(data) : void 0,
          };
          const shouldRetry =
            method === "GET"
              ? (response2) =>
                  response2.status === 429 || response2.status >= 500
              : (response2) => response2.status === 429;
          const _fetch = this.fetch;
          const response = yield withAutomaticRetries(
            () =>
              __async(this, null, function* () {
                return _fetch(url, init);
              }),
            {
              shouldRetry,
            },
          );
          if (!response.ok) {
            const request = new Request(url, init);
            const responseText = yield response.text();
            throw new ApiError(
              `Request to ${url} failed with status ${response.status} ${response.statusText}: ${responseText}.`,
              request,
              response,
            );
          }
          return response;
        });
      }
      /**
       * Stream a model and wait for its output.
       *
       * @param {string} identifier - Required. The model version identifier in the format "{owner}/{name}:{version}"
       * @param {object} options
       * @param {object} options.input - Required. An object with the model inputs
       * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
       * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
       * @throws {Error} If the prediction failed
       * @yields {ServerSentEvent} Each streamed event from the prediction
       */
      stream(ref, options) {
        return __asyncGenerator(this, null, function* () {
          const _a = options,
            { wait } = _a,
            data = __objRest(_a, ["wait"]);
          const identifier = ModelVersionIdentifier.parse(ref);
          let prediction;
          if (identifier.version) {
            prediction = yield new __await(
              this.predictions.create(
                __spreadProps(__spreadValues({}, data), {
                  version: identifier.version,
                  stream: true,
                }),
              ),
            );
          } else if (identifier.owner && identifier.name) {
            prediction = yield new __await(
              this.predictions.create(
                __spreadProps(__spreadValues({}, data), {
                  model: `${identifier.owner}/${identifier.name}`,
                  stream: true,
                }),
              ),
            );
          } else {
            throw new Error("Invalid model version identifier");
          }
          if (prediction.urls && prediction.urls.stream) {
            const { signal } = options;
            const stream = createReadableStream({
              url: prediction.urls.stream,
              fetch: this.fetch,
              options: { signal },
            });
            yield* __yieldStar(streamAsyncIterator(stream));
          } else {
            throw new Error("Prediction does not support streaming");
          }
        });
      }
      /**
       * Paginate through a list of results.
       *
       * @generator
       * @example
       * for await (const page of replicate.paginate(replicate.predictions.list) {
       *    console.log(page);
       * }
       * @param {Function} endpoint - Function that returns a promise for the next page of results
       * @yields {object[]} Each page of results
       */
      paginate(endpoint) {
        return __asyncGenerator(this, null, function* () {
          const response = yield new __await(endpoint());
          yield response.results;
          if (response.next) {
            const nextPage = () =>
              this.request(response.next, { method: "GET" }).then((r) =>
                r.json(),
              );
            yield* __yieldStar(this.paginate(nextPage));
          }
        });
      }
      /**
       * Wait for a prediction to finish.
       *
       * If the prediction has already finished,
       * this function returns immediately.
       * Otherwise, it polls the API until the prediction finishes.
       *
       * @async
       * @param {object} prediction - Prediction object
       * @param {object} options - Options
       * @param {number} [options.interval] - Polling interval in milliseconds. Defaults to 500
       * @param {Function} [stop] - Async callback function that is called after each polling attempt. Receives the prediction object as an argument. Return false to cancel polling.
       * @throws {Error} If the prediction doesn't complete within the maximum number of attempts
       * @throws {Error} If the prediction failed
       * @returns {Promise<object>} Resolves with the completed prediction object
       */
      wait(prediction, options, stop) {
        return __async(this, null, function* () {
          const { id } = prediction;
          if (!id) {
            throw new Error("Invalid prediction");
          }
          if (
            prediction.status === "succeeded" ||
            prediction.status === "failed" ||
            prediction.status === "canceled"
          ) {
            return prediction;
          }
          const sleep = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms));
          const interval = (options && options.interval) || 500;
          let updatedPrediction = yield this.predictions.get(id);
          while (
            updatedPrediction.status !== "succeeded" &&
            updatedPrediction.status !== "failed" &&
            updatedPrediction.status !== "canceled"
          ) {
            if (stop && (yield stop(updatedPrediction)) === true) {
              break;
            }
            yield sleep(interval);
            updatedPrediction = yield this.predictions.get(prediction.id);
          }
          if (updatedPrediction.status === "failed") {
            throw new Error(`Prediction failed: ${updatedPrediction.error}`);
          }
          return updatedPrediction;
        });
      }
    };
    module.exports = Replicate;
    module.exports.validateWebhook = validateWebhook;
    module.exports.parseProgressFromLogs = parseProgressFromLogs;
  },
});
export default require_replicate();
