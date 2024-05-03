// generate from "tsup ./src/browser.js --format esm --dts"
var __defProp = Object.defineProperty;
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

// src/version.ts
var version = "0.0.0";

// src/utils.ts
var ResponseError = class _ResponseError extends Error {
  constructor(error, status_code) {
    super(error);
    this.error = error;
    this.status_code = status_code;
    this.name = "ResponseError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _ResponseError);
    }
  }
};
var checkOk = (response) =>
  __async(void 0, null, function* () {
    var _a;
    if (!response.ok) {
      let message = `Error ${response.status}: ${response.statusText}`;
      let errorData = null;
      if (
        (_a = response.headers.get("content-type")) == null
          ? void 0
          : _a.includes("application/json")
      ) {
        try {
          errorData = yield response.json();
          message = errorData.error || message;
        } catch (error) {
          console.log("Failed to parse error response as JSON");
        }
      } else {
        try {
          console.log("Getting text from response");
          const textResponse = yield response.text();
          message = textResponse || message;
        } catch (error) {
          console.log("Failed to get text from error response");
        }
      }
      throw new ResponseError(message, response.status);
    }
  });
function getPlatform() {
  if (typeof window !== "undefined" && window.navigator) {
    return `${window.navigator.platform.toLowerCase()} Browser/${navigator.userAgent};`;
  } else if (typeof process !== "undefined") {
    return `${process.arch} ${process.platform} Node.js/${process.version}`;
  }
  return "";
}
var fetchWithHeaders = (_0, _1, ..._2) =>
  __async(void 0, [_0, _1, ..._2], function* (fetch2, url, options = {}) {
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `ollama-js/${version} (${getPlatform()})`,
    };
    if (!options.headers) {
      options.headers = {};
    }
    options.headers = __spreadValues(
      __spreadValues({}, defaultHeaders),
      options.headers,
    );
    return fetch2(url, options);
  });
var get = (fetch2, host) =>
  __async(void 0, null, function* () {
    const response = yield fetchWithHeaders(fetch2, host);
    yield checkOk(response);
    return response;
  });
var post = (fetch2, host, data, options) =>
  __async(void 0, null, function* () {
    const isRecord = (input) => {
      return (
        input !== null && typeof input === "object" && !Array.isArray(input)
      );
    };
    const formattedData = isRecord(data) ? JSON.stringify(data) : data;
    const response = yield fetchWithHeaders(fetch2, host, {
      method: "POST",
      body: formattedData,
      signal: options == null ? void 0 : options.signal,
    });
    yield checkOk(response);
    return response;
  });
var del = (fetch2, host, data) =>
  __async(void 0, null, function* () {
    const response = yield fetchWithHeaders(fetch2, host, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    yield checkOk(response);
    return response;
  });
var parseJSON = function (itr) {
  return __asyncGenerator(this, null, function* () {
    var _a;
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    const reader = itr.getReader();
    while (true) {
      const { done, value: chunk } = yield new __await(reader.read());
      if (done) {
        break;
      }
      buffer += decoder.decode(chunk);
      const parts = buffer.split("\n");
      buffer = (_a = parts.pop()) != null ? _a : "";
      for (const part of parts) {
        try {
          yield JSON.parse(part);
        } catch (error) {
          console.warn("invalid json: ", part);
        }
      }
    }
    for (const part of buffer.split("\n").filter((p) => p !== "")) {
      try {
        yield JSON.parse(part);
      } catch (error) {
        console.warn("invalid json: ", part);
      }
    }
  });
};
var formatHost = (host) => {
  if (!host) {
    return "http://127.0.0.1:11434";
  }
  let isExplicitProtocol = host.includes("://");
  if (host.startsWith(":")) {
    host = `http://127.0.0.1${host}`;
    isExplicitProtocol = false;
  }
  if (!isExplicitProtocol) {
    host = `http://${host}`;
  }
  const url = new URL(host);
  let port = url.port;
  if (!port) {
    if (!isExplicitProtocol) {
      port = "11434";
    } else {
      port = url.protocol === "https:" ? "443" : "80";
    }
  }
  let formattedHost = `${url.protocol}//${url.hostname}:${port}${url.pathname}`;
  if (formattedHost.endsWith("/")) {
    formattedHost = formattedHost.slice(0, -1);
  }
  return formattedHost;
};

// src/browser.ts
// import "whatwg-fetch";
var Ollama = class {
  constructor(config) {
    var _a;
    this.config = {
      host: "",
    };
    if (!(config == null ? void 0 : config.proxy)) {
      this.config.host = formatHost(
        (_a = config == null ? void 0 : config.host) != null
          ? _a
          : "http://127.0.0.1:11434",
      );
    }
    this.fetch = fetch;
    if ((config == null ? void 0 : config.fetch) != null) {
      this.fetch = config.fetch;
    }
    this.abortController = new AbortController();
  }
  // Abort any ongoing requests to Ollama
  abort() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
  processStreamableRequest(endpoint, request) {
    return __async(this, null, function* () {
      var _a;
      request.stream = (_a = request.stream) != null ? _a : false;
      const response = yield post(
        this.fetch,
        `${this.config.host}/api/${endpoint}`,
        __spreadValues({}, request),
        { signal: this.abortController.signal },
      );
      if (!response.body) {
        throw new Error("Missing body");
      }
      const itr = parseJSON(response.body);
      if (request.stream) {
        return (function () {
          return __asyncGenerator(this, null, function* () {
            try {
              for (
                var iter = __forAwait(itr), more, temp, error;
                (more = !(temp = yield new __await(iter.next())).done);
                more = false
              ) {
                const message = temp.value;
                if ("error" in message) {
                  throw new Error(message.error);
                }
                yield message;
                if (message.done || message.status === "success") {
                  return;
                }
              }
            } catch (temp) {
              error = [temp];
            } finally {
              try {
                more &&
                  (temp = iter.return) &&
                  (yield new __await(temp.call(iter)));
              } finally {
                if (error) throw error[0];
              }
            }
            throw new Error(
              "Did not receive done or success response in stream.",
            );
          });
        })();
      } else {
        const message = yield itr.next();
        if (!message.value.done && message.value.status !== "success") {
          throw new Error("Expected a completed response.");
        }
        return message.value;
      }
    });
  }
  encodeImage(image) {
    return __async(this, null, function* () {
      if (typeof image !== "string") {
        const uint8Array = new Uint8Array(image);
        const numberArray = Array.from(uint8Array);
        const base64String = btoa(String.fromCharCode.apply(null, numberArray));
        return base64String;
      }
      return image;
    });
  }
  generate(request) {
    return __async(this, null, function* () {
      if (request.images) {
        request.images = yield Promise.all(
          request.images.map(this.encodeImage.bind(this)),
        );
      }
      return this.processStreamableRequest("generate", request);
    });
  }
  chat(request) {
    return __async(this, null, function* () {
      if (request.messages) {
        for (const message of request.messages) {
          if (message.images) {
            message.images = yield Promise.all(
              message.images.map(this.encodeImage.bind(this)),
            );
          }
        }
      }
      return this.processStreamableRequest("chat", request);
    });
  }
  create(request) {
    return __async(this, null, function* () {
      return this.processStreamableRequest("create", {
        name: request.model,
        stream: request.stream,
        modelfile: request.modelfile,
      });
    });
  }
  pull(request) {
    return __async(this, null, function* () {
      return this.processStreamableRequest("pull", {
        name: request.model,
        stream: request.stream,
        insecure: request.insecure,
      });
    });
  }
  push(request) {
    return __async(this, null, function* () {
      return this.processStreamableRequest("push", {
        name: request.model,
        stream: request.stream,
        insecure: request.insecure,
      });
    });
  }
  delete(request) {
    return __async(this, null, function* () {
      yield del(this.fetch, `${this.config.host}/api/delete`, {
        name: request.model,
      });
      return { status: "success" };
    });
  }
  copy(request) {
    return __async(this, null, function* () {
      yield post(
        this.fetch,
        `${this.config.host}/api/copy`,
        __spreadValues({}, request),
      );
      return { status: "success" };
    });
  }
  list() {
    return __async(this, null, function* () {
      const response = yield get(this.fetch, `${this.config.host}/api/tags`);
      const listResponse = yield response.json();
      return listResponse;
    });
  }
  show(request) {
    return __async(this, null, function* () {
      const response = yield post(
        this.fetch,
        `${this.config.host}/api/show`,
        __spreadValues({}, request),
      );
      const showResponse = yield response.json();
      return showResponse;
    });
  }
  embeddings(request) {
    return __async(this, null, function* () {
      const response = yield post(
        this.fetch,
        `${this.config.host}/api/embeddings`,
        __spreadValues({}, request),
      );
      const embeddingsResponse = yield response.json();
      return embeddingsResponse;
    });
  }
};
var browser_default = new Ollama();
export { Ollama, browser_default as default };
