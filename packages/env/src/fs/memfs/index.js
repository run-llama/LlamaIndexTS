var process = {};
var cachedSetTimeout;
var cachedClearTimeout;
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
(function () {
  try {
    if (typeof setTimeout === "function") {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }
  try {
    if (typeof clearTimeout === "function") {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();
function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    return setTimeout(fun, 0);
  }
  if (
    (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
    setTimeout
  ) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }
  try {
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e2) {
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}
function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    return clearTimeout(marker);
  }
  if (
    (cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) &&
    clearTimeout
  ) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }
  try {
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      return cachedClearTimeout.call(null, marker);
    } catch (e2) {
      return cachedClearTimeout.call(this, marker);
    }
  }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}
function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}
process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(fun, args));
  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
};
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};
process.title = "browser";
process.browser = true;
process.env = {};
process.argv = [];
process.version = "";
process.versions = {};
function noop() {}
process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;
process.listeners = function (name) {
  return [];
};
process.binding = function (name) {
  throw new Error("process.binding is not supported");
};
process.cwd = function () {
  return "/";
};
process.chdir = function (dir) {
  throw new Error("process.chdir is not supported");
};
process.umask = function () {
  return 0;
};

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __commonJS = (cb, mod) =>
  function __require2() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);

// node_modules/memfs/lib/constants.js
var require_constants = __commonJS({
  "node_modules/memfs/lib/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.constants = void 0;
    exports.constants = {
      O_RDONLY: 0,
      O_WRONLY: 1,
      O_RDWR: 2,
      S_IFMT: 61440,
      S_IFREG: 32768,
      S_IFDIR: 16384,
      S_IFCHR: 8192,
      S_IFBLK: 24576,
      S_IFIFO: 4096,
      S_IFLNK: 40960,
      S_IFSOCK: 49152,
      O_CREAT: 64,
      O_EXCL: 128,
      O_NOCTTY: 256,
      O_TRUNC: 512,
      O_APPEND: 1024,
      O_DIRECTORY: 65536,
      O_NOATIME: 262144,
      O_NOFOLLOW: 131072,
      O_SYNC: 1052672,
      O_SYMLINK: 2097152,
      O_DIRECT: 16384,
      O_NONBLOCK: 2048,
      S_IRWXU: 448,
      S_IRUSR: 256,
      S_IWUSR: 128,
      S_IXUSR: 64,
      S_IRWXG: 56,
      S_IRGRP: 32,
      S_IWGRP: 16,
      S_IXGRP: 8,
      S_IRWXO: 7,
      S_IROTH: 4,
      S_IWOTH: 2,
      S_IXOTH: 1,
      F_OK: 0,
      R_OK: 4,
      W_OK: 2,
      X_OK: 1,
      UV_FS_SYMLINK_DIR: 1,
      UV_FS_SYMLINK_JUNCTION: 2,
      UV_FS_COPYFILE_EXCL: 1,
      UV_FS_COPYFILE_FICLONE: 2,
      UV_FS_COPYFILE_FICLONE_FORCE: 4,
      COPYFILE_EXCL: 1,
      COPYFILE_FICLONE: 2,
      COPYFILE_FICLONE_FORCE: 4,
    };
  },
});

// node_modules/memfs/lib/Stats.js
var require_Stats = __commonJS({
  "node_modules/memfs/lib/Stats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Stats = void 0;
    var constants_1 = require_constants();
    var {
      S_IFMT,
      S_IFDIR,
      S_IFREG,
      S_IFBLK,
      S_IFCHR,
      S_IFLNK,
      S_IFIFO,
      S_IFSOCK,
    } = constants_1.constants;
    var Stats = class _Stats {
      static build(node, bigint = false) {
        const stats = new _Stats();
        const { uid, gid, atime, mtime, ctime } = node;
        const getStatNumber = !bigint
          ? (number) => number
          : (number) => BigInt(number);
        stats.uid = getStatNumber(uid);
        stats.gid = getStatNumber(gid);
        stats.rdev = getStatNumber(0);
        stats.blksize = getStatNumber(4096);
        stats.ino = getStatNumber(node.ino);
        stats.size = getStatNumber(node.getSize());
        stats.blocks = getStatNumber(1);
        stats.atime = atime;
        stats.mtime = mtime;
        stats.ctime = ctime;
        stats.birthtime = ctime;
        stats.atimeMs = getStatNumber(atime.getTime());
        stats.mtimeMs = getStatNumber(mtime.getTime());
        const ctimeMs = getStatNumber(ctime.getTime());
        stats.ctimeMs = ctimeMs;
        stats.birthtimeMs = ctimeMs;
        if (bigint) {
          stats.atimeNs = BigInt(atime.getTime()) * BigInt(1e6);
          stats.mtimeNs = BigInt(mtime.getTime()) * BigInt(1e6);
          const ctimeNs = BigInt(ctime.getTime()) * BigInt(1e6);
          stats.ctimeNs = ctimeNs;
          stats.birthtimeNs = ctimeNs;
        }
        stats.dev = getStatNumber(0);
        stats.mode = getStatNumber(node.mode);
        stats.nlink = getStatNumber(node.nlink);
        return stats;
      }
      _checkModeProperty(property) {
        return (Number(this.mode) & S_IFMT) === property;
      }
      isDirectory() {
        return this._checkModeProperty(S_IFDIR);
      }
      isFile() {
        return this._checkModeProperty(S_IFREG);
      }
      isBlockDevice() {
        return this._checkModeProperty(S_IFBLK);
      }
      isCharacterDevice() {
        return this._checkModeProperty(S_IFCHR);
      }
      isSymbolicLink() {
        return this._checkModeProperty(S_IFLNK);
      }
      isFIFO() {
        return this._checkModeProperty(S_IFIFO);
      }
      isSocket() {
        return this._checkModeProperty(S_IFSOCK);
      }
    };
    exports.Stats = Stats;
    exports.default = Stats;
  },
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - (validLen % 4);
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 18) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 12) |
          (revLookup[b64.charCodeAt(i2 + 2)] << 6) |
          revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = (tmp >> 16) & 255;
        arr[curByte++] = (tmp >> 8) & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 2) |
          (revLookup[b64.charCodeAt(i2 + 1)] >> 4);
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 10) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 4) |
          (revLookup[b64.charCodeAt(i2 + 2)] >> 2);
        arr[curByte++] = (tmp >> 8) & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return (
        lookup[(num >> 18) & 63] +
        lookup[(num >> 12) & 63] +
        lookup[(num >> 6) & 63] +
        lookup[num & 63]
      );
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp =
          ((uint8[i2] << 16) & 16711680) +
          ((uint8[i2 + 1] << 8) & 65280) +
          (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (
        var i2 = 0, len22 = len2 - extraBytes;
        i2 < len22;
        i2 += maxChunkLength
      ) {
        parts.push(
          encodeChunk(
            uint8,
            i2,
            i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength,
          ),
        );
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + "==");
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] +
            lookup[(tmp >> 4) & 63] +
            lookup[(tmp << 2) & 63] +
            "=",
        );
      }
      return parts.join("");
    }
  },
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & ((1 << -nBits) - 1);
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      m = e & ((1 << -nBits) - 1);
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (
        ;
        mLen >= 8;
        buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
      ) {}
      e = (e << mLen) | m;
      eLen += mLen;
      for (
        ;
        eLen > 0;
        buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
      ) {}
      buffer[offset + i - d] |= s * 128;
    };
  },
});

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol =
      typeof Symbol === "function" && typeof Symbol["for"] === "function"
        ? Symbol["for"]("nodejs.util.inspect.custom")
        : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (
      !Buffer2.TYPED_ARRAY_SUPPORT &&
      typeof console !== "undefined" &&
      typeof console.error === "function"
    ) {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.",
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = {
          foo: function () {
            return 42;
          },
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function () {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.buffer;
      },
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function () {
        if (!Buffer2.isBuffer(this)) return void 0;
        return this.byteOffset;
      },
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError(
          'The value "' + length + '" is invalid for option "size"',
        );
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number',
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
            typeof value,
        );
      }
      if (
        isInstance(value, ArrayBuffer) ||
        (value && isInstance(value.buffer, ArrayBuffer))
      ) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (
        typeof SharedArrayBuffer !== "undefined" &&
        (isInstance(value, SharedArrayBuffer) ||
          (value && isInstance(value.buffer, SharedArrayBuffer)))
      ) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number',
        );
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b) return b;
      if (
        typeof Symbol !== "undefined" &&
        Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === "function"
      ) {
        return Buffer2.from(
          value[Symbol.toPrimitive]("string"),
          encodingOrOffset,
          length,
        );
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
          typeof value,
      );
    }
    Buffer2.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError(
          'The value "' + size + '" is invalid for option "size"',
        );
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string"
          ? createBuffer(size).fill(fill, encoding)
          : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function (size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function (size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError(
          "Attempt to allocate Buffer larger than maximum size: 0x" +
            K_MAX_LENGTH.toString(16) +
            " bytes",
        );
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype;
    };
    Buffer2.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer2.from(b, b.offset, b.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array',
        );
      }
      if (a === b) return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer2.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos);
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
            typeof string,
        );
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (;;) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer2.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b) {
      if (!Buffer2.isBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max)
        .replace(/(.{2})/g, "$1 ")
        .trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare(
      target,
      start,
      end,
      thisStart,
      thisEnd,
    ) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
            typeof target,
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (
        start < 0 ||
        end > target.length ||
        thisStart < 0 ||
        thisEnd > this.length
      ) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(
              buffer,
              val,
              byteOffset,
            );
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (
          encoding === "ucs2" ||
          encoding === "ucs-2" ||
          encoding === "utf16le" ||
          encoding === "utf-16le"
        ) {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (
            read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)
          ) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength)
          byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(
      val,
      byteOffset,
      encoding,
    ) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(
        utf8ToBytes(string, buf.length - offset),
        buf,
        offset,
        length,
      );
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(
        utf16leToBytes(string, buf.length - offset),
        buf,
        offset,
        length,
      );
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported",
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (
        (string.length > 0 && (length < 0 || offset < 0)) ||
        offset > this.length
      ) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (;;) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0),
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence =
          firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = ((firstByte & 31) << 6) | (secondByte & 63);
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint =
                  ((firstByte & 15) << 12) |
                  ((secondByte & 63) << 6) |
                  (thirdByte & 63);
                if (
                  tempCodePoint > 2047 &&
                  (tempCodePoint < 55296 || tempCodePoint > 57343)
                ) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (
                (secondByte & 192) === 128 &&
                (thirdByte & 192) === 128 &&
                (fourthByte & 192) === 128
              ) {
                tempCodePoint =
                  ((firstByte & 15) << 18) |
                  ((secondByte & 63) << 12) |
                  ((thirdByte & 63) << 6) |
                  (fourthByte & 63);
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(((codePoint >>> 10) & 1023) | 55296);
          codePoint = 56320 | (codePoint & 1023);
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH)),
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint");
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE =
      function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE =
      function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 =
      function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE =
      function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | (this[offset + 1] << 8);
      };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE =
      function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return (this[offset] << 8) | this[offset + 1];
      };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE =
      function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (
          (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) +
          this[offset + 3] * 16777216
        );
      };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE =
      function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (
          this[offset] * 16777216 +
          ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3])
        );
      };
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(
      function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo =
          first +
          this[++offset] * 2 ** 8 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 24;
        const hi =
          this[++offset] +
          this[++offset] * 2 ** 8 +
          this[++offset] * 2 ** 16 +
          last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      },
    );
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(
      function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi =
          first * 2 ** 24 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          this[++offset];
        const lo =
          this[++offset] * 2 ** 24 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      },
    );
    Buffer2.prototype.readIntLE = function readIntLE(
      offset,
      byteLength2,
      noAssert,
    ) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(
      offset,
      byteLength2,
      noAssert,
    ) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | (this[offset + 1] << 8);
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | (this[offset] << 8);
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (
        this[offset] |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
      );
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (
        (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3]
      );
    };
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(
      function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val =
          this[offset + 4] +
          this[offset + 5] * 2 ** 8 +
          this[offset + 6] * 2 ** 16 +
          (last << 24);
        return (
          (BigInt(val) << BigInt(32)) +
          BigInt(
            first +
              this[++offset] * 2 ** 8 +
              this[++offset] * 2 ** 16 +
              this[++offset] * 2 ** 24,
          )
        );
      },
    );
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(
      function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val =
          (first << 24) + // Overflow
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          this[++offset];
        return (
          (BigInt(val) << BigInt(32)) +
          BigInt(
            this[++offset] * 2 ** 24 +
              this[++offset] * 2 ** 16 +
              this[++offset] * 2 ** 8 +
              last,
          )
        );
      },
    );
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE =
      function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = (value / mul) & 255;
        }
        return offset + byteLength2;
      };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE =
      function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = (value / mul) & 255;
        }
        return offset + byteLength2;
      };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 =
      function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE =
      function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE =
      function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE =
      function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE =
      function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(
      function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(
          this,
          value,
          offset,
          BigInt(0),
          BigInt("0xffffffffffffffff"),
        );
      },
    );
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(
      function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(
          this,
          value,
          offset,
          BigInt(0),
          BigInt("0xffffffffffffffff"),
        );
      },
    );
    Buffer2.prototype.writeIntLE = function writeIntLE(
      value,
      offset,
      byteLength2,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(
      value,
      offset,
      byteLength2,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(
      value,
      offset,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(
      value,
      offset,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(
      value,
      offset,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(
      value,
      offset,
      noAssert,
    ) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(
      function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(
          this,
          value,
          offset,
          -BigInt("0x8000000000000000"),
          BigInt("0x7fffffffffffffff"),
        );
      },
    );
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(
      function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(
          this,
          value,
          offset,
          -BigInt("0x8000000000000000"),
          BigInt("0x7fffffffffffffff"),
        );
      },
    );
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(
          buf,
          value,
          offset,
          4,
          34028234663852886e22,
          -34028234663852886e22,
        );
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(
      value,
      offset,
      noAssert,
    ) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(
      value,
      offset,
      noAssert,
    ) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(
          buf,
          value,
          offset,
          8,
          17976931348623157e292,
          -17976931348623157e292,
        );
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(
      value,
      offset,
      noAssert,
    ) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(
      value,
      offset,
      noAssert,
    ) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target))
        throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (
        this === target &&
        typeof Uint8Array.prototype.copyWithin === "function"
      ) {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart,
        );
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if ((encoding === "utf8" && code < 128) || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError(
            'The value "' + val + '" is invalid for argument "value"',
          );
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true,
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function (name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError,
    );
    E(
      "ERR_INVALID_ARG_TYPE",
      function (name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError,
    );
    E(
      "ERR_OUT_OF_RANGE",
      function (str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (
            input > BigInt(2) ** BigInt(32) ||
            input < -(BigInt(2) ** BigInt(32))
          ) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError,
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          "an integer",
          value,
        );
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value,
      );
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint =
            (((leadSurrogate - 55296) << 10) | (codePoint - 56320)) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            (codePoint >> 12) | 224,
            ((codePoint >> 6) & 63) | 128,
            (codePoint & 63) | 128,
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            (codePoint >> 18) | 240,
            ((codePoint >> 12) & 63) | 128,
            ((codePoint >> 6) & 63) | 128,
            (codePoint & 63) | 128,
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return (
        obj instanceof type ||
        (obj != null &&
          obj.constructor != null &&
          obj.constructor.name != null &&
          obj.constructor.name === type.name)
      );
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function () {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  },
});

// node_modules/memfs/lib/internal/buffer.js
var require_buffer2 = __commonJS({
  "node_modules/memfs/lib/internal/buffer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bufferFrom = exports.bufferAllocUnsafe = exports.Buffer = void 0;
    var buffer_1 = require_buffer();
    Object.defineProperty(exports, "Buffer", {
      enumerable: true,
      get: function () {
        return buffer_1.Buffer;
      },
    });
    function bufferV0P12Ponyfill(arg0, ...args) {
      return new buffer_1.Buffer(arg0, ...args);
    }
    var bufferAllocUnsafe = buffer_1.Buffer.allocUnsafe || bufferV0P12Ponyfill;
    exports.bufferAllocUnsafe = bufferAllocUnsafe;
    var bufferFrom = buffer_1.Buffer.from || bufferV0P12Ponyfill;
    exports.bufferFrom = bufferFrom;
  },
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    module.exports = function hasSymbols() {
      if (
        typeof Symbol !== "function" ||
        typeof Object.getOwnPropertySymbols !== "function"
      ) {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (sym in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (
        typeof Object.getOwnPropertyNames === "function" &&
        Object.getOwnPropertyNames(obj).length !== 0
      ) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  },
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS({
  "node_modules/has-tostringtag/shams.js"(exports, module) {
    "use strict";
    var hasSymbols = require_shams();
    module.exports = function hasToStringTagShams() {
      return hasSymbols() && !!Symbol.toStringTag;
    };
  },
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  },
});

// node_modules/has-proto/index.js
var require_has_proto = __commonJS({
  "node_modules/has-proto/index.js"(exports, module) {
    "use strict";
    var test = {
      foo: {},
    };
    var $Object = Object;
    module.exports = function hasProto() {
      return (
        { __proto__: test }.foo === test.foo &&
        !({ __proto__: null } instanceof $Object)
      );
    };
  },
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var slice = Array.prototype.slice;
    var toStr = Object.prototype.toString;
    var funcType = "[object Function]";
    module.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slice.call(arguments, 1);
      var bound;
      var binder = function () {
        if (this instanceof bound) {
          var result = target.apply(this, args.concat(slice.call(arguments)));
          if (Object(result) === result) {
            return result;
          }
          return this;
        } else {
          return target.apply(that, args.concat(slice.call(arguments)));
        }
      };
      var boundLength = Math.max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs.push("$" + i);
      }
      bound = Function(
        "binder",
        "return function (" +
          boundArgs.join(",") +
          "){ return binder.apply(this,arguments); }",
      )(binder);
      if (target.prototype) {
        var Empty = function Empty2() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  },
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    var implementation = require_implementation();
    module.exports = Function.prototype.bind || implementation;
  },
});

// node_modules/has/src/index.js
var require_src = __commonJS({
  "node_modules/has/src/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
  },
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    var undefined2;
    var $SyntaxError = SyntaxError;
    var $Function = Function;
    var $TypeError = TypeError;
    var getEvalledConstructor = function (expressionSyntax) {
      try {
        return $Function(
          '"use strict"; return (' + expressionSyntax + ").constructor;",
        )();
      } catch (e) {}
    };
    var $gOPD = Object.getOwnPropertyDescriptor;
    if ($gOPD) {
      try {
        $gOPD({}, "");
      } catch (e) {
        $gOPD = null;
      }
    }
    var throwTypeError = function () {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD
      ? (function () {
          try {
            arguments.callee;
            return throwTypeError;
          } catch (calleeThrows) {
            try {
              return $gOPD(arguments, "callee").get;
            } catch (gOPDthrows) {
              return throwTypeError;
            }
          }
        })()
      : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var hasProto = require_has_proto()();
    var getProto =
      Object.getPrototypeOf ||
      (hasProto
        ? function (x) {
            return x.__proto__;
          }
        : null);
    var needsEval = {};
    var TypedArray =
      typeof Uint8Array === "undefined" || !getProto
        ? undefined2
        : getProto(Uint8Array);
    var INTRINSICS = {
      "%AggregateError%":
        typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%":
        typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%":
        hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%":
        typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%":
        typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": EvalError,
      "%Float32Array%":
        typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%":
        typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%":
        typeof FinalizationRegistry === "undefined"
          ? undefined2
          : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%":
        typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%":
        typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%":
        hasSymbols && getProto
          ? getProto(getProto([][Symbol.iterator]()))
          : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%":
        typeof Map === "undefined" || !hasSymbols || !getProto
          ? undefined2
          : getProto(/* @__PURE__ */ new Map()[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": Object,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": RangeError,
      "%ReferenceError%": ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%":
        typeof Set === "undefined" || !hasSymbols || !getProto
          ? undefined2
          : getProto(/* @__PURE__ */ new Set()[Symbol.iterator]()),
      "%SharedArrayBuffer%":
        typeof SharedArrayBuffer === "undefined"
          ? undefined2
          : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%":
        hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%":
        typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%":
        typeof Uint8ClampedArray === "undefined"
          ? undefined2
          : Uint8ClampedArray,
      "%Uint16Array%":
        typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%":
        typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": [
        "AsyncGeneratorFunction",
        "prototype",
        "prototype",
      ],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"],
    };
    var bind = require_function_bind();
    var hasOwn = require_src();
    var $concat = bind.call(Function.call, Array.prototype.concat);
    var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
    var $replace = bind.call(Function.call, String.prototype.replace);
    var $strSlice = bind.call(Function.call, String.prototype.slice);
    var $exec = bind.call(Function.call, RegExp.prototype.exec);
    var rePropName =
      /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError(
          "invalid intrinsic syntax, expected closing `%`",
        );
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError(
          "invalid intrinsic syntax, expected opening `%`",
        );
      }
      var result = [];
      $replace(string, rePropName, function (match, number, quote, subString) {
        result[result.length] = quote
          ? $replace(subString, reEscapeChar, "$1")
          : number || match;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError(
            "intrinsic " +
              name +
              " exists, but is not available. Please file an issue!",
          );
        }
        return {
          alias,
          name: intrinsicName,
          value,
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    module.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError(
          "`%` may not be present anywhere but at the beginning and end of the intrinsic name",
        );
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic(
        "%" + intrinsicBaseName + "%",
        allowMissing,
      );
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if (
          (first === '"' ||
            first === "'" ||
            first === "`" ||
            last === '"' ||
            last === "'" ||
            last === "`") &&
          first !== last
        ) {
          throw new $SyntaxError(
            "property names with quotes must have matching quotes",
          );
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError(
                "base intrinsic for " +
                  name +
                  " exists, but the property is not available.",
              );
            }
            return void 0;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
  },
});

// node_modules/call-bind/index.js
var require_call_bind = __commonJS({
  "node_modules/call-bind/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var GetIntrinsic = require_get_intrinsic();
    var $apply = GetIntrinsic("%Function.prototype.apply%");
    var $call = GetIntrinsic("%Function.prototype.call%");
    var $reflectApply =
      GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);
    var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var $max = GetIntrinsic("%Math.max%");
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = null;
      }
    }
    module.exports = function callBind(originalFunction) {
      var func = $reflectApply(bind, $call, arguments);
      if ($gOPD && $defineProperty) {
        var desc = $gOPD(func, "length");
        if (desc.configurable) {
          $defineProperty(func, "length", {
            value:
              1 + $max(0, originalFunction.length - (arguments.length - 1)),
          });
        }
      }
      return func;
    };
    var applyBind = function applyBind2() {
      return $reflectApply(bind, $apply, arguments);
    };
    if ($defineProperty) {
      $defineProperty(module.exports, "apply", { value: applyBind });
    } else {
      module.exports.apply = applyBind;
    }
  },
});

// node_modules/call-bind/callBound.js
var require_callBound = __commonJS({
  "node_modules/call-bind/callBound.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBind = require_call_bind();
    var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
    module.exports = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = GetIntrinsic(name, !!allowMissing);
      if (
        typeof intrinsic === "function" &&
        $indexOf(name, ".prototype.") > -1
      ) {
        return callBind(intrinsic);
      }
      return intrinsic;
    };
  },
});

// node_modules/is-arguments/index.js
var require_is_arguments = __commonJS({
  "node_modules/is-arguments/index.js"(exports, module) {
    "use strict";
    var hasToStringTag = require_shams2()();
    var callBound = require_callBound();
    var $toString = callBound("Object.prototype.toString");
    var isStandardArguments = function isArguments(value) {
      if (
        hasToStringTag &&
        value &&
        typeof value === "object" &&
        Symbol.toStringTag in value
      ) {
        return false;
      }
      return $toString(value) === "[object Arguments]";
    };
    var isLegacyArguments = function isArguments(value) {
      if (isStandardArguments(value)) {
        return true;
      }
      return (
        value !== null &&
        typeof value === "object" &&
        typeof value.length === "number" &&
        value.length >= 0 &&
        $toString(value) !== "[object Array]" &&
        $toString(value.callee) === "[object Function]"
      );
    };
    var supportsStandardArguments = (function () {
      return isStandardArguments(arguments);
    })();
    isStandardArguments.isLegacyArguments = isLegacyArguments;
    module.exports = supportsStandardArguments
      ? isStandardArguments
      : isLegacyArguments;
  },
});

// node_modules/is-generator-function/index.js
var require_is_generator_function = __commonJS({
  "node_modules/is-generator-function/index.js"(exports, module) {
    "use strict";
    var toStr = Object.prototype.toString;
    var fnToStr = Function.prototype.toString;
    var isFnRegex = /^\s*(?:function)?\*/;
    var hasToStringTag = require_shams2()();
    var getProto = Object.getPrototypeOf;
    var getGeneratorFunc = function () {
      if (!hasToStringTag) {
        return false;
      }
      try {
        return Function("return function*() {}")();
      } catch (e) {}
    };
    var GeneratorFunction;
    module.exports = function isGeneratorFunction(fn) {
      if (typeof fn !== "function") {
        return false;
      }
      if (isFnRegex.test(fnToStr.call(fn))) {
        return true;
      }
      if (!hasToStringTag) {
        var str = toStr.call(fn);
        return str === "[object GeneratorFunction]";
      }
      if (!getProto) {
        return false;
      }
      if (typeof GeneratorFunction === "undefined") {
        var generatorFunc = getGeneratorFunc();
        GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
      }
      return getProto(fn) === GeneratorFunction;
    };
  },
});

// node_modules/is-callable/index.js
var require_is_callable = __commonJS({
  "node_modules/is-callable/index.js"(exports, module) {
    "use strict";
    var fnToStr = Function.prototype.toString;
    var reflectApply =
      typeof Reflect === "object" && Reflect !== null && Reflect.apply;
    var badArrayLike;
    var isCallableMarker;
    if (
      typeof reflectApply === "function" &&
      typeof Object.defineProperty === "function"
    ) {
      try {
        badArrayLike = Object.defineProperty({}, "length", {
          get: function () {
            throw isCallableMarker;
          },
        });
        isCallableMarker = {};
        reflectApply(
          function () {
            throw 42;
          },
          null,
          badArrayLike,
        );
      } catch (_) {
        if (_ !== isCallableMarker) {
          reflectApply = null;
        }
      }
    } else {
      reflectApply = null;
    }
    var constructorRegex = /^\s*class\b/;
    var isES6ClassFn = function isES6ClassFunction(value) {
      try {
        var fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
      } catch (e) {
        return false;
      }
    };
    var tryFunctionObject = function tryFunctionToStr(value) {
      try {
        if (isES6ClassFn(value)) {
          return false;
        }
        fnToStr.call(value);
        return true;
      } catch (e) {
        return false;
      }
    };
    var toStr = Object.prototype.toString;
    var objectClass = "[object Object]";
    var fnClass = "[object Function]";
    var genClass = "[object GeneratorFunction]";
    var ddaClass = "[object HTMLAllCollection]";
    var ddaClass2 = "[object HTML document.all class]";
    var ddaClass3 = "[object HTMLCollection]";
    var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
    var isIE68 = !(0 in [,]);
    var isDDA = function isDocumentDotAll() {
      return false;
    };
    if (typeof document === "object") {
      all = document.all;
      if (toStr.call(all) === toStr.call(document.all)) {
        isDDA = function isDocumentDotAll(value) {
          if (
            (isIE68 || !value) &&
            (typeof value === "undefined" || typeof value === "object")
          ) {
            try {
              var str = toStr.call(value);
              return (
                (str === ddaClass ||
                  str === ddaClass2 ||
                  str === ddaClass3 ||
                  str === objectClass) &&
                value("") == null
              );
            } catch (e) {}
          }
          return false;
        };
      }
    }
    var all;
    module.exports = reflectApply
      ? function isCallable(value) {
          if (isDDA(value)) {
            return true;
          }
          if (!value) {
            return false;
          }
          if (typeof value !== "function" && typeof value !== "object") {
            return false;
          }
          try {
            reflectApply(value, null, badArrayLike);
          } catch (e) {
            if (e !== isCallableMarker) {
              return false;
            }
          }
          return !isES6ClassFn(value) && tryFunctionObject(value);
        }
      : function isCallable(value) {
          if (isDDA(value)) {
            return true;
          }
          if (!value) {
            return false;
          }
          if (typeof value !== "function" && typeof value !== "object") {
            return false;
          }
          if (hasToStringTag) {
            return tryFunctionObject(value);
          }
          if (isES6ClassFn(value)) {
            return false;
          }
          var strClass = toStr.call(value);
          if (
            strClass !== fnClass &&
            strClass !== genClass &&
            !/^\[object HTML/.test(strClass)
          ) {
            return false;
          }
          return tryFunctionObject(value);
        };
  },
});

// node_modules/for-each/index.js
var require_for_each = __commonJS({
  "node_modules/for-each/index.js"(exports, module) {
    "use strict";
    var isCallable = require_is_callable();
    var toStr = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var forEachArray = function forEachArray2(array, iterator, receiver) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
          if (receiver == null) {
            iterator(array[i], i, array);
          } else {
            iterator.call(receiver, array[i], i, array);
          }
        }
      }
    };
    var forEachString = function forEachString2(string, iterator, receiver) {
      for (var i = 0, len = string.length; i < len; i++) {
        if (receiver == null) {
          iterator(string.charAt(i), i, string);
        } else {
          iterator.call(receiver, string.charAt(i), i, string);
        }
      }
    };
    var forEachObject = function forEachObject2(object, iterator, receiver) {
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          if (receiver == null) {
            iterator(object[k], k, object);
          } else {
            iterator.call(receiver, object[k], k, object);
          }
        }
      }
    };
    var forEach = function forEach2(list, iterator, thisArg) {
      if (!isCallable(iterator)) {
        throw new TypeError("iterator must be a function");
      }
      var receiver;
      if (arguments.length >= 3) {
        receiver = thisArg;
      }
      if (toStr.call(list) === "[object Array]") {
        forEachArray(list, iterator, receiver);
      } else if (typeof list === "string") {
        forEachString(list, iterator, receiver);
      } else {
        forEachObject(list, iterator, receiver);
      }
    };
    module.exports = forEach;
  },
});

// node_modules/available-typed-arrays/index.js
var require_available_typed_arrays = __commonJS({
  "node_modules/available-typed-arrays/index.js"(exports, module) {
    "use strict";
    var possibleNames = [
      "BigInt64Array",
      "BigUint64Array",
      "Float32Array",
      "Float64Array",
      "Int16Array",
      "Int32Array",
      "Int8Array",
      "Uint16Array",
      "Uint32Array",
      "Uint8Array",
      "Uint8ClampedArray",
    ];
    var g = typeof globalThis === "undefined" ? global : globalThis;
    module.exports = function availableTypedArrays() {
      var out = [];
      for (var i = 0; i < possibleNames.length; i++) {
        if (typeof g[possibleNames[i]] === "function") {
          out[out.length] = possibleNames[i];
        }
      }
      return out;
    };
  },
});

// node_modules/gopd/index.js
var require_gopd = __commonJS({
  "node_modules/gopd/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  },
});

// node_modules/which-typed-array/index.js
var require_which_typed_array = __commonJS({
  "node_modules/which-typed-array/index.js"(exports, module) {
    "use strict";
    var forEach = require_for_each();
    var availableTypedArrays = require_available_typed_arrays();
    var callBind = require_call_bind();
    var callBound = require_callBound();
    var gOPD = require_gopd();
    var $toString = callBound("Object.prototype.toString");
    var hasToStringTag = require_shams2()();
    var g = typeof globalThis === "undefined" ? global : globalThis;
    var typedArrays = availableTypedArrays();
    var $slice = callBound("String.prototype.slice");
    var getPrototypeOf = Object.getPrototypeOf;
    var $indexOf =
      callBound("Array.prototype.indexOf", true) ||
      function indexOf(array, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i] === value) {
            return i;
          }
        }
        return -1;
      };
    var cache = { __proto__: null };
    if (hasToStringTag && gOPD && getPrototypeOf) {
      forEach(typedArrays, function (typedArray) {
        var arr = new g[typedArray]();
        if (Symbol.toStringTag in arr) {
          var proto = getPrototypeOf(arr);
          var descriptor = gOPD(proto, Symbol.toStringTag);
          if (!descriptor) {
            var superProto = getPrototypeOf(proto);
            descriptor = gOPD(superProto, Symbol.toStringTag);
          }
          cache["$" + typedArray] = callBind(descriptor.get);
        }
      });
    } else {
      forEach(typedArrays, function (typedArray) {
        var arr = new g[typedArray]();
        cache["$" + typedArray] = callBind(arr.slice);
      });
    }
    var tryTypedArrays = function tryAllTypedArrays(value) {
      var found = false;
      forEach(cache, function (getter, typedArray) {
        if (!found) {
          try {
            if ("$" + getter(value) === typedArray) {
              found = $slice(typedArray, 1);
            }
          } catch (e) {}
        }
      });
      return found;
    };
    var trySlices = function tryAllSlices(value) {
      var found = false;
      forEach(cache, function (getter, name) {
        if (!found) {
          try {
            getter(value);
            found = $slice(name, 1);
          } catch (e) {}
        }
      });
      return found;
    };
    module.exports = function whichTypedArray(value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (!hasToStringTag) {
        var tag = $slice($toString(value), 8, -1);
        if ($indexOf(typedArrays, tag) > -1) {
          return tag;
        }
        if (tag !== "Object") {
          return false;
        }
        return trySlices(value);
      }
      if (!gOPD) {
        return null;
      }
      return tryTypedArrays(value);
    };
  },
});

// node_modules/is-typed-array/index.js
var require_is_typed_array = __commonJS({
  "node_modules/is-typed-array/index.js"(exports, module) {
    "use strict";
    var whichTypedArray = require_which_typed_array();
    module.exports = function isTypedArray(value) {
      return !!whichTypedArray(value);
    };
  },
});

// node_modules/util/support/types.js
var require_types = __commonJS({
  "node_modules/util/support/types.js"(exports) {
    "use strict";
    var isArgumentsObject = require_is_arguments();
    var isGeneratorFunction = require_is_generator_function();
    var whichTypedArray = require_which_typed_array();
    var isTypedArray = require_is_typed_array();
    function uncurryThis(f) {
      return f.call.bind(f);
    }
    var BigIntSupported = typeof BigInt !== "undefined";
    var SymbolSupported = typeof Symbol !== "undefined";
    var ObjectToString = uncurryThis(Object.prototype.toString);
    var numberValue = uncurryThis(Number.prototype.valueOf);
    var stringValue = uncurryThis(String.prototype.valueOf);
    var booleanValue = uncurryThis(Boolean.prototype.valueOf);
    if (BigIntSupported) {
      bigIntValue = uncurryThis(BigInt.prototype.valueOf);
    }
    var bigIntValue;
    if (SymbolSupported) {
      symbolValue = uncurryThis(Symbol.prototype.valueOf);
    }
    var symbolValue;
    function checkBoxedPrimitive(value, prototypeValueOf) {
      if (typeof value !== "object") {
        return false;
      }
      try {
        prototypeValueOf(value);
        return true;
      } catch (e) {
        return false;
      }
    }
    exports.isArgumentsObject = isArgumentsObject;
    exports.isGeneratorFunction = isGeneratorFunction;
    exports.isTypedArray = isTypedArray;
    function isPromise(input) {
      return (
        (typeof Promise !== "undefined" && input instanceof Promise) ||
        (input !== null &&
          typeof input === "object" &&
          typeof input.then === "function" &&
          typeof input.catch === "function")
      );
    }
    exports.isPromise = isPromise;
    function isArrayBufferView(value) {
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(value);
      }
      return isTypedArray(value) || isDataView(value);
    }
    exports.isArrayBufferView = isArrayBufferView;
    function isUint8Array(value) {
      return whichTypedArray(value) === "Uint8Array";
    }
    exports.isUint8Array = isUint8Array;
    function isUint8ClampedArray(value) {
      return whichTypedArray(value) === "Uint8ClampedArray";
    }
    exports.isUint8ClampedArray = isUint8ClampedArray;
    function isUint16Array(value) {
      return whichTypedArray(value) === "Uint16Array";
    }
    exports.isUint16Array = isUint16Array;
    function isUint32Array(value) {
      return whichTypedArray(value) === "Uint32Array";
    }
    exports.isUint32Array = isUint32Array;
    function isInt8Array(value) {
      return whichTypedArray(value) === "Int8Array";
    }
    exports.isInt8Array = isInt8Array;
    function isInt16Array(value) {
      return whichTypedArray(value) === "Int16Array";
    }
    exports.isInt16Array = isInt16Array;
    function isInt32Array(value) {
      return whichTypedArray(value) === "Int32Array";
    }
    exports.isInt32Array = isInt32Array;
    function isFloat32Array(value) {
      return whichTypedArray(value) === "Float32Array";
    }
    exports.isFloat32Array = isFloat32Array;
    function isFloat64Array(value) {
      return whichTypedArray(value) === "Float64Array";
    }
    exports.isFloat64Array = isFloat64Array;
    function isBigInt64Array(value) {
      return whichTypedArray(value) === "BigInt64Array";
    }
    exports.isBigInt64Array = isBigInt64Array;
    function isBigUint64Array(value) {
      return whichTypedArray(value) === "BigUint64Array";
    }
    exports.isBigUint64Array = isBigUint64Array;
    function isMapToString(value) {
      return ObjectToString(value) === "[object Map]";
    }
    isMapToString.working =
      typeof Map !== "undefined" && isMapToString(/* @__PURE__ */ new Map());
    function isMap(value) {
      if (typeof Map === "undefined") {
        return false;
      }
      return isMapToString.working
        ? isMapToString(value)
        : value instanceof Map;
    }
    exports.isMap = isMap;
    function isSetToString(value) {
      return ObjectToString(value) === "[object Set]";
    }
    isSetToString.working =
      typeof Set !== "undefined" && isSetToString(/* @__PURE__ */ new Set());
    function isSet(value) {
      if (typeof Set === "undefined") {
        return false;
      }
      return isSetToString.working
        ? isSetToString(value)
        : value instanceof Set;
    }
    exports.isSet = isSet;
    function isWeakMapToString(value) {
      return ObjectToString(value) === "[object WeakMap]";
    }
    isWeakMapToString.working =
      typeof WeakMap !== "undefined" &&
      isWeakMapToString(/* @__PURE__ */ new WeakMap());
    function isWeakMap(value) {
      if (typeof WeakMap === "undefined") {
        return false;
      }
      return isWeakMapToString.working
        ? isWeakMapToString(value)
        : value instanceof WeakMap;
    }
    exports.isWeakMap = isWeakMap;
    function isWeakSetToString(value) {
      return ObjectToString(value) === "[object WeakSet]";
    }
    isWeakSetToString.working =
      typeof WeakSet !== "undefined" &&
      isWeakSetToString(/* @__PURE__ */ new WeakSet());
    function isWeakSet(value) {
      return isWeakSetToString(value);
    }
    exports.isWeakSet = isWeakSet;
    function isArrayBufferToString(value) {
      return ObjectToString(value) === "[object ArrayBuffer]";
    }
    isArrayBufferToString.working =
      typeof ArrayBuffer !== "undefined" &&
      isArrayBufferToString(new ArrayBuffer());
    function isArrayBuffer(value) {
      if (typeof ArrayBuffer === "undefined") {
        return false;
      }
      return isArrayBufferToString.working
        ? isArrayBufferToString(value)
        : value instanceof ArrayBuffer;
    }
    exports.isArrayBuffer = isArrayBuffer;
    function isDataViewToString(value) {
      return ObjectToString(value) === "[object DataView]";
    }
    isDataViewToString.working =
      typeof ArrayBuffer !== "undefined" &&
      typeof DataView !== "undefined" &&
      isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1));
    function isDataView(value) {
      if (typeof DataView === "undefined") {
        return false;
      }
      return isDataViewToString.working
        ? isDataViewToString(value)
        : value instanceof DataView;
    }
    exports.isDataView = isDataView;
    var SharedArrayBufferCopy =
      typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : void 0;
    function isSharedArrayBufferToString(value) {
      return ObjectToString(value) === "[object SharedArrayBuffer]";
    }
    function isSharedArrayBuffer(value) {
      if (typeof SharedArrayBufferCopy === "undefined") {
        return false;
      }
      if (typeof isSharedArrayBufferToString.working === "undefined") {
        isSharedArrayBufferToString.working = isSharedArrayBufferToString(
          new SharedArrayBufferCopy(),
        );
      }
      return isSharedArrayBufferToString.working
        ? isSharedArrayBufferToString(value)
        : value instanceof SharedArrayBufferCopy;
    }
    exports.isSharedArrayBuffer = isSharedArrayBuffer;
    function isAsyncFunction(value) {
      return ObjectToString(value) === "[object AsyncFunction]";
    }
    exports.isAsyncFunction = isAsyncFunction;
    function isMapIterator(value) {
      return ObjectToString(value) === "[object Map Iterator]";
    }
    exports.isMapIterator = isMapIterator;
    function isSetIterator(value) {
      return ObjectToString(value) === "[object Set Iterator]";
    }
    exports.isSetIterator = isSetIterator;
    function isGeneratorObject(value) {
      return ObjectToString(value) === "[object Generator]";
    }
    exports.isGeneratorObject = isGeneratorObject;
    function isWebAssemblyCompiledModule(value) {
      return ObjectToString(value) === "[object WebAssembly.Module]";
    }
    exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;
    function isNumberObject(value) {
      return checkBoxedPrimitive(value, numberValue);
    }
    exports.isNumberObject = isNumberObject;
    function isStringObject(value) {
      return checkBoxedPrimitive(value, stringValue);
    }
    exports.isStringObject = isStringObject;
    function isBooleanObject(value) {
      return checkBoxedPrimitive(value, booleanValue);
    }
    exports.isBooleanObject = isBooleanObject;
    function isBigIntObject(value) {
      return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
    }
    exports.isBigIntObject = isBigIntObject;
    function isSymbolObject(value) {
      return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
    }
    exports.isSymbolObject = isSymbolObject;
    function isBoxedPrimitive(value) {
      return (
        isNumberObject(value) ||
        isStringObject(value) ||
        isBooleanObject(value) ||
        isBigIntObject(value) ||
        isSymbolObject(value)
      );
    }
    exports.isBoxedPrimitive = isBoxedPrimitive;
    function isAnyArrayBuffer(value) {
      return (
        typeof Uint8Array !== "undefined" &&
        (isArrayBuffer(value) || isSharedArrayBuffer(value))
      );
    }
    exports.isAnyArrayBuffer = isAnyArrayBuffer;
    ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(
      function (method) {
        Object.defineProperty(exports, method, {
          enumerable: false,
          value: function () {
            throw new Error(method + " is not supported in userland");
          },
        });
      },
    );
  },
});

// node_modules/util/support/isBufferBrowser.js
var require_isBufferBrowser = __commonJS({
  "node_modules/util/support/isBufferBrowser.js"(exports, module) {
    module.exports = function isBuffer(arg) {
      return (
        arg &&
        typeof arg === "object" &&
        typeof arg.copy === "function" &&
        typeof arg.fill === "function" &&
        typeof arg.readUInt8 === "function"
      );
    };
  },
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true,
            },
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function () {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  },
});

// node_modules/util/util.js
var require_util = __commonJS({
  "node_modules/util/util.js"(exports) {
    var getOwnPropertyDescriptors =
      Object.getOwnPropertyDescriptors ||
      function getOwnPropertyDescriptors2(obj) {
        var keys = Object.keys(obj);
        var descriptors = {};
        for (var i = 0; i < keys.length; i++) {
          descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
        }
        return descriptors;
      };
    var formatRegExp = /%[sdj%]/g;
    exports.format = function (f) {
      if (!isString(f)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(inspect(arguments[i]));
        }
        return objects.join(" ");
      }
      var i = 1;
      var args = arguments;
      var len = args.length;
      var str = String(f).replace(formatRegExp, function (x2) {
        if (x2 === "%%") return "%";
        if (i >= len) return x2;
        switch (x2) {
          case "%s":
            return String(args[i++]);
          case "%d":
            return Number(args[i++]);
          case "%j":
            try {
              return JSON.stringify(args[i++]);
            } catch (_) {
              return "[Circular]";
            }
          default:
            return x2;
        }
      });
      for (var x = args[i]; i < len; x = args[++i]) {
        if (isNull(x) || !isObject(x)) {
          str += " " + x;
        } else {
          str += " " + inspect(x);
        }
      }
      return str;
    };
    exports.deprecate = function (fn, msg) {
      if (typeof process !== "undefined" && process.noDeprecation === true) {
        return fn;
      }
      if (typeof process === "undefined") {
        return function () {
          return exports.deprecate(fn, msg).apply(this, arguments);
        };
      }
      var warned = false;
      function deprecated() {
        if (!warned) {
          if (process.throwDeprecation) {
            throw new Error(msg);
          } else if (process.traceDeprecation) {
            console.trace(msg);
          } else {
            console.error(msg);
          }
          warned = true;
        }
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
    var debugs = {};
    var debugEnvRegex = /^$/;
    if (process.env.NODE_DEBUG) {
      debugEnv = process.env.NODE_DEBUG;
      debugEnv = debugEnv
        .replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/,/g, "$|^")
        .toUpperCase();
      debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
    }
    var debugEnv;
    exports.debuglog = function (set) {
      set = set.toUpperCase();
      if (!debugs[set]) {
        if (debugEnvRegex.test(set)) {
          var pid = process.pid;
          debugs[set] = function () {
            var msg = exports.format.apply(exports, arguments);
            console.error("%s %d: %s", set, pid, msg);
          };
        } else {
          debugs[set] = function () {};
        }
      }
      return debugs[set];
    };
    function inspect(obj, opts) {
      var ctx = {
        seen: [],
        stylize: stylizeNoColor,
      };
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean(opts)) {
        ctx.showHidden = opts;
      } else if (opts) {
        exports._extend(ctx, opts);
      }
      if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined(ctx.depth)) ctx.depth = 2;
      if (isUndefined(ctx.colors)) ctx.colors = false;
      if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }
    exports.inspect = inspect;
    inspect.colors = {
      bold: [1, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      white: [37, 39],
      grey: [90, 39],
      black: [30, 39],
      blue: [34, 39],
      cyan: [36, 39],
      green: [32, 39],
      magenta: [35, 39],
      red: [31, 39],
      yellow: [33, 39],
    };
    inspect.styles = {
      special: "cyan",
      number: "yellow",
      boolean: "yellow",
      undefined: "grey",
      null: "bold",
      string: "green",
      date: "magenta",
      // "name": intentionally not styling
      regexp: "red",
    };
    function stylizeWithColor(str, styleType) {
      var style = inspect.styles[styleType];
      if (style) {
        return (
          "\x1B[" +
          inspect.colors[style][0] +
          "m" +
          str +
          "\x1B[" +
          inspect.colors[style][1] +
          "m"
        );
      } else {
        return str;
      }
    }
    function stylizeNoColor(str, styleType) {
      return str;
    }
    function arrayToHash(array) {
      var hash = {};
      array.forEach(function (val, idx) {
        hash[val] = true;
      });
      return hash;
    }
    function formatValue(ctx, value, recurseTimes) {
      if (
        ctx.customInspect &&
        value &&
        isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)
      ) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);
      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }
      if (
        isError(value) &&
        (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)
      ) {
        return formatError(value);
      }
      if (keys.length === 0) {
        if (isFunction(value)) {
          var name = value.name ? ": " + value.name : "";
          return ctx.stylize("[Function" + name + "]", "special");
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), "date");
        }
        if (isError(value)) {
          return formatError(value);
        }
      }
      var base = "",
        array = false,
        braces = ["{", "}"];
      if (isArray(value)) {
        array = true;
        braces = ["[", "]"];
      }
      if (isFunction(value)) {
        var n = value.name ? ": " + value.name : "";
        base = " [Function" + n + "]";
      }
      if (isRegExp(value)) {
        base = " " + RegExp.prototype.toString.call(value);
      }
      if (isDate(value)) {
        base = " " + Date.prototype.toUTCString.call(value);
      }
      if (isError(value)) {
        base = " " + formatError(value);
      }
      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        } else {
          return ctx.stylize("[Object]", "special");
        }
      }
      ctx.seen.push(value);
      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function (key) {
          return formatProperty(
            ctx,
            value,
            recurseTimes,
            visibleKeys,
            key,
            array,
          );
        });
      }
      ctx.seen.pop();
      return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
      if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
      if (isString(value)) {
        var simple =
          "'" +
          JSON.stringify(value)
            .replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') +
          "'";
        return ctx.stylize(simple, "string");
      }
      if (isNumber(value)) return ctx.stylize("" + value, "number");
      if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
      if (isNull(value)) return ctx.stylize("null", "null");
    }
    function formatError(value) {
      return "[" + Error.prototype.toString.call(value) + "]";
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(
            formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              String(i),
              true,
            ),
          );
        } else {
          output.push("");
        }
      }
      keys.forEach(function (key) {
        if (!key.match(/^\d+$/)) {
          output.push(
            formatProperty(ctx, value, recurseTimes, visibleKeys, key, true),
          );
        }
      });
      return output;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key],
      };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize("[Getter/Setter]", "special");
        } else {
          str = ctx.stylize("[Getter]", "special");
        }
      } else {
        if (desc.set) {
          str = ctx.stylize("[Setter]", "special");
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = "[" + key + "]";
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf("\n") > -1) {
            if (array) {
              str = str
                .split("\n")
                .map(function (line) {
                  return "  " + line;
                })
                .join("\n")
                .slice(2);
            } else {
              str =
                "\n" +
                str
                  .split("\n")
                  .map(function (line) {
                    return "   " + line;
                  })
                  .join("\n");
            }
          }
        } else {
          str = ctx.stylize("[Circular]", "special");
        }
      }
      if (isUndefined(name)) {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify("" + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.slice(1, -1);
          name = ctx.stylize(name, "name");
        } else {
          name = name
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, "string");
        }
      }
      return name + ": " + str;
    }
    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function (prev, cur) {
        numLinesEst++;
        if (cur.indexOf("\n") >= 0) numLinesEst++;
        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
      }, 0);
      if (length > 60) {
        return (
          braces[0] +
          (base === "" ? "" : base + "\n ") +
          " " +
          output.join(",\n  ") +
          " " +
          braces[1]
        );
      }
      return braces[0] + base + " " + output.join(", ") + " " + braces[1];
    }
    exports.types = require_types();
    function isArray(ar) {
      return Array.isArray(ar);
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return isObject(re) && objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    exports.types.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return isObject(d) && objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    exports.types.isDate = isDate;
    function isError(e) {
      return (
        isObject(e) &&
        (objectToString(e) === "[object Error]" || e instanceof Error)
      );
    }
    exports.isError = isError;
    exports.types.isNativeError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return (
        arg === null ||
        typeof arg === "boolean" ||
        typeof arg === "number" ||
        typeof arg === "string" ||
        typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined"
      );
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = require_isBufferBrowser();
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
    function pad(n) {
      return n < 10 ? "0" + n.toString(10) : n.toString(10);
    }
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    function timestamp() {
      var d = /* @__PURE__ */ new Date();
      var time = [
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds()),
      ].join(":");
      return [d.getDate(), months[d.getMonth()], time].join(" ");
    }
    exports.log = function () {
      console.log(
        "%s - %s",
        timestamp(),
        exports.format.apply(exports, arguments),
      );
    };
    exports.inherits = require_inherits_browser();
    exports._extend = function (origin, add) {
      if (!add || !isObject(add)) return origin;
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    };
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    var kCustomPromisifiedSymbol =
      typeof Symbol !== "undefined" ? Symbol("util.promisify.custom") : void 0;
    exports.promisify = function promisify(original) {
      if (typeof original !== "function")
        throw new TypeError('The "original" argument must be of type Function');
      if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
        var fn = original[kCustomPromisifiedSymbol];
        if (typeof fn !== "function") {
          throw new TypeError(
            'The "util.promisify.custom" argument must be of type Function',
          );
        }
        Object.defineProperty(fn, kCustomPromisifiedSymbol, {
          value: fn,
          enumerable: false,
          writable: false,
          configurable: true,
        });
        return fn;
      }
      function fn() {
        var promiseResolve, promiseReject;
        var promise = new Promise(function (resolve, reject) {
          promiseResolve = resolve;
          promiseReject = reject;
        });
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        args.push(function (err, value) {
          if (err) {
            promiseReject(err);
          } else {
            promiseResolve(value);
          }
        });
        try {
          original.apply(this, args);
        } catch (err) {
          promiseReject(err);
        }
        return promise;
      }
      Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
      if (kCustomPromisifiedSymbol)
        Object.defineProperty(fn, kCustomPromisifiedSymbol, {
          value: fn,
          enumerable: false,
          writable: false,
          configurable: true,
        });
      return Object.defineProperties(fn, getOwnPropertyDescriptors(original));
    };
    exports.promisify.custom = kCustomPromisifiedSymbol;
    function callbackifyOnRejected(reason, cb) {
      if (!reason) {
        var newReason = new Error("Promise was rejected with a falsy value");
        newReason.reason = reason;
        reason = newReason;
      }
      return cb(reason);
    }
    function callbackify(original) {
      if (typeof original !== "function") {
        throw new TypeError('The "original" argument must be of type Function');
      }
      function callbackified() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        var maybeCb = args.pop();
        if (typeof maybeCb !== "function") {
          throw new TypeError("The last argument must be of type Function");
        }
        var self = this;
        var cb = function () {
          return maybeCb.apply(self, arguments);
        };
        original.apply(this, args).then(
          function (ret) {
            process.nextTick(cb.bind(null, null, ret));
          },
          function (rej) {
            process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
          },
        );
      }
      Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
      Object.defineProperties(
        callbackified,
        getOwnPropertyDescriptors(original),
      );
      return callbackified;
    }
    exports.callbackify = callbackify;
  },
});

// node_modules/assert/build/internal/errors.js
var require_errors = __commonJS({
  "node_modules/assert/build/internal/errors.js"(exports, module) {
    "use strict";
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 &&
            typeof Symbol === "function" &&
            obj2.constructor === Symbol &&
            obj2 !== Symbol.prototype
            ? "symbol"
            : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
      }
      return _assertThisInitialized(self);
    }
    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError(
          "this hasn't been initialised - super() hasn't been called",
        );
      }
      return self;
    }
    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf
        ? Object.getPrototypeOf
        : function _getPrototypeOf2(o2) {
            return o2.__proto__ || Object.getPrototypeOf(o2);
          };
      return _getPrototypeOf(o);
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError(
          "Super expression must either be null or a function",
        );
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: { value: subClass, writable: true, configurable: true },
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }
    function _setPrototypeOf(o, p) {
      _setPrototypeOf =
        Object.setPrototypeOf ||
        function _setPrototypeOf2(o2, p2) {
          o2.__proto__ = p2;
          return o2;
        };
      return _setPrototypeOf(o, p);
    }
    var codes = {};
    var assert;
    var util;
    function createErrorType(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      function getMessage(arg1, arg2, arg3) {
        if (typeof message === "string") {
          return message;
        } else {
          return message(arg1, arg2, arg3);
        }
      }
      var NodeError = /* @__PURE__ */ (function (_Base) {
        _inherits(NodeError2, _Base);
        function NodeError2(arg1, arg2, arg3) {
          var _this;
          _classCallCheck(this, NodeError2);
          _this = _possibleConstructorReturn(
            this,
            _getPrototypeOf(NodeError2).call(
              this,
              getMessage(arg1, arg2, arg3),
            ),
          );
          _this.code = code;
          return _this;
        }
        return NodeError2;
      })(Base);
      codes[code] = NodeError;
    }
    function oneOf(expected, thing) {
      if (Array.isArray(expected)) {
        var len = expected.length;
        expected = expected.map(function (i) {
          return String(i);
        });
        if (len > 2) {
          return (
            "one of "
              .concat(thing, " ")
              .concat(expected.slice(0, len - 1).join(", "), ", or ") +
            expected[len - 1]
          );
        } else if (len === 2) {
          return "one of "
            .concat(thing, " ")
            .concat(expected[0], " or ")
            .concat(expected[1]);
        } else {
          return "of ".concat(thing, " ").concat(expected[0]);
        }
      } else {
        return "of ".concat(thing, " ").concat(String(expected));
      }
    }
    function startsWith(str, search, pos) {
      return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    }
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function includes(str, search, start) {
      if (typeof start !== "number") {
        start = 0;
      }
      if (start + search.length > str.length) {
        return false;
      } else {
        return str.indexOf(search, start) !== -1;
      }
    }
    createErrorType(
      "ERR_AMBIGUOUS_ARGUMENT",
      'The "%s" argument is ambiguous. %s',
      TypeError,
    );
    createErrorType(
      "ERR_INVALID_ARG_TYPE",
      function (name, expected, actual) {
        if (assert === void 0) assert = require_assert();
        assert(typeof name === "string", "'name' must be a string");
        var determiner;
        if (typeof expected === "string" && startsWith(expected, "not ")) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        var msg;
        if (endsWith(name, " argument")) {
          msg = "The "
            .concat(name, " ")
            .concat(determiner, " ")
            .concat(oneOf(expected, "type"));
        } else {
          var type = includes(name, ".") ? "property" : "argument";
          msg = 'The "'
            .concat(name, '" ')
            .concat(type, " ")
            .concat(determiner, " ")
            .concat(oneOf(expected, "type"));
        }
        msg += ". Received type ".concat(_typeof(actual));
        return msg;
      },
      TypeError,
    );
    createErrorType(
      "ERR_INVALID_ARG_VALUE",
      function (name, value) {
        var reason =
          arguments.length > 2 && arguments[2] !== void 0
            ? arguments[2]
            : "is invalid";
        if (util === void 0) util = require_util();
        var inspected = util.inspect(value);
        if (inspected.length > 128) {
          inspected = "".concat(inspected.slice(0, 128), "...");
        }
        return "The argument '"
          .concat(name, "' ")
          .concat(reason, ". Received ")
          .concat(inspected);
      },
      TypeError,
      RangeError,
    );
    createErrorType(
      "ERR_INVALID_RETURN_VALUE",
      function (input, name, value) {
        var type;
        if (value && value.constructor && value.constructor.name) {
          type = "instance of ".concat(value.constructor.name);
        } else {
          type = "type ".concat(_typeof(value));
        }
        return (
          "Expected "
            .concat(input, ' to be returned from the "')
            .concat(name, '"') + " function but got ".concat(type, ".")
        );
      },
      TypeError,
    );
    createErrorType(
      "ERR_MISSING_ARGS",
      function () {
        for (
          var _len = arguments.length, args = new Array(_len), _key = 0;
          _key < _len;
          _key++
        ) {
          args[_key] = arguments[_key];
        }
        if (assert === void 0) assert = require_assert();
        assert(args.length > 0, "At least one arg needs to be specified");
        var msg = "The ";
        var len = args.length;
        args = args.map(function (a) {
          return '"'.concat(a, '"');
        });
        switch (len) {
          case 1:
            msg += "".concat(args[0], " argument");
            break;
          case 2:
            msg += "".concat(args[0], " and ").concat(args[1], " arguments");
            break;
          default:
            msg += args.slice(0, len - 1).join(", ");
            msg += ", and ".concat(args[len - 1], " arguments");
            break;
        }
        return "".concat(msg, " must be specified");
      },
      TypeError,
    );
    module.exports.codes = codes;
  },
});

// node_modules/assert/build/internal/assert/assertion_error.js
var require_assertion_error = __commonJS({
  "node_modules/assert/build/internal/assert/assertion_error.js"(
    exports,
    module,
  ) {
    "use strict";
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
          ownKeys = ownKeys.concat(
            Object.getOwnPropertySymbols(source).filter(function (sym) {
              return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }),
          );
        }
        ownKeys.forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }
    function _possibleConstructorReturn(self, call) {
      if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
      }
      return _assertThisInitialized(self);
    }
    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError(
          "this hasn't been initialised - super() hasn't been called",
        );
      }
      return self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError(
          "Super expression must either be null or a function",
        );
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: { value: subClass, writable: true, configurable: true },
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }
    function _wrapNativeSuper(Class) {
      var _cache =
        typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
      _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
        if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
        if (typeof Class2 !== "function") {
          throw new TypeError(
            "Super expression must either be null or a function",
          );
        }
        if (typeof _cache !== "undefined") {
          if (_cache.has(Class2)) return _cache.get(Class2);
          _cache.set(Class2, Wrapper);
        }
        function Wrapper() {
          return _construct(
            Class2,
            arguments,
            _getPrototypeOf(this).constructor,
          );
        }
        Wrapper.prototype = Object.create(Class2.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true,
          },
        });
        return _setPrototypeOf(Wrapper, Class2);
      };
      return _wrapNativeSuper(Class);
    }
    function isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;
      try {
        Date.prototype.toString.call(
          Reflect.construct(Date, [], function () {}),
        );
        return true;
      } catch (e) {
        return false;
      }
    }
    function _construct(Parent, args, Class) {
      if (isNativeReflectConstruct()) {
        _construct = Reflect.construct;
      } else {
        _construct = function _construct2(Parent2, args2, Class2) {
          var a = [null];
          a.push.apply(a, args2);
          var Constructor = Function.bind.apply(Parent2, a);
          var instance = new Constructor();
          if (Class2) _setPrototypeOf(instance, Class2.prototype);
          return instance;
        };
      }
      return _construct.apply(null, arguments);
    }
    function _isNativeFunction(fn) {
      return Function.toString.call(fn).indexOf("[native code]") !== -1;
    }
    function _setPrototypeOf(o, p) {
      _setPrototypeOf =
        Object.setPrototypeOf ||
        function _setPrototypeOf2(o2, p2) {
          o2.__proto__ = p2;
          return o2;
        };
      return _setPrototypeOf(o, p);
    }
    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf
        ? Object.getPrototypeOf
        : function _getPrototypeOf2(o2) {
            return o2.__proto__ || Object.getPrototypeOf(o2);
          };
      return _getPrototypeOf(o);
    }
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 &&
            typeof Symbol === "function" &&
            obj2.constructor === Symbol &&
            obj2 !== Symbol.prototype
            ? "symbol"
            : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    var _require = require_util();
    var inspect = _require.inspect;
    var _require2 = require_errors();
    var ERR_INVALID_ARG_TYPE = _require2.codes.ERR_INVALID_ARG_TYPE;
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function repeat(str, count) {
      count = Math.floor(count);
      if (str.length == 0 || count == 0) return "";
      var maxCount = str.length * count;
      count = Math.floor(Math.log(count) / Math.log(2));
      while (count) {
        str += str;
        count--;
      }
      str += str.substring(0, maxCount - str.length);
      return str;
    }
    var blue = "";
    var green = "";
    var red = "";
    var white = "";
    var kReadableOperator = {
      deepStrictEqual: "Expected values to be strictly deep-equal:",
      strictEqual: "Expected values to be strictly equal:",
      strictEqualObject:
        'Expected "actual" to be reference-equal to "expected":',
      deepEqual: "Expected values to be loosely deep-equal:",
      equal: "Expected values to be loosely equal:",
      notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
      notStrictEqual: 'Expected "actual" to be strictly unequal to:',
      notStrictEqualObject:
        'Expected "actual" not to be reference-equal to "expected":',
      notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
      notEqual: 'Expected "actual" to be loosely unequal to:',
      notIdentical: "Values identical but not reference-equal:",
    };
    var kMaxShortLength = 10;
    function copyError(source) {
      var keys = Object.keys(source);
      var target = Object.create(Object.getPrototypeOf(source));
      keys.forEach(function (key) {
        target[key] = source[key];
      });
      Object.defineProperty(target, "message", {
        value: source.message,
      });
      return target;
    }
    function inspectValue(val) {
      return inspect(val, {
        compact: false,
        customInspect: false,
        depth: 1e3,
        maxArrayLength: Infinity,
        // Assert compares only enumerable properties (with a few exceptions).
        showHidden: false,
        // Having a long line as error is better than wrapping the line for
        // comparison for now.
        // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
        // have meta information about the inspected properties (i.e., know where
        // in what line the property starts and ends).
        breakLength: Infinity,
        // Assert does not detect proxies currently.
        showProxy: false,
        sorted: true,
        // Inspect getters as we also check them when comparing entries.
        getters: true,
      });
    }
    function createErrDiff(actual, expected, operator) {
      var other = "";
      var res = "";
      var lastPos = 0;
      var end = "";
      var skipped = false;
      var actualInspected = inspectValue(actual);
      var actualLines = actualInspected.split("\n");
      var expectedLines = inspectValue(expected).split("\n");
      var i = 0;
      var indicator = "";
      if (
        operator === "strictEqual" &&
        _typeof(actual) === "object" &&
        _typeof(expected) === "object" &&
        actual !== null &&
        expected !== null
      ) {
        operator = "strictEqualObject";
      }
      if (
        actualLines.length === 1 &&
        expectedLines.length === 1 &&
        actualLines[0] !== expectedLines[0]
      ) {
        var inputLength = actualLines[0].length + expectedLines[0].length;
        if (inputLength <= kMaxShortLength) {
          if (
            (_typeof(actual) !== "object" || actual === null) &&
            (_typeof(expected) !== "object" || expected === null) &&
            (actual !== 0 || expected !== 0)
          ) {
            return (
              "".concat(kReadableOperator[operator], "\n\n") +
              "".concat(actualLines[0], " !== ").concat(expectedLines[0], "\n")
            );
          }
        } else if (operator !== "strictEqualObject") {
          var maxLength =
            process.stderr && process.stderr.isTTY
              ? process.stderr.columns
              : 80;
          if (inputLength < maxLength) {
            while (actualLines[0][i] === expectedLines[0][i]) {
              i++;
            }
            if (i > 2) {
              indicator = "\n  ".concat(repeat(" ", i), "^");
              i = 0;
            }
          }
        }
      }
      var a = actualLines[actualLines.length - 1];
      var b = expectedLines[expectedLines.length - 1];
      while (a === b) {
        if (i++ < 2) {
          end = "\n  ".concat(a).concat(end);
        } else {
          other = a;
        }
        actualLines.pop();
        expectedLines.pop();
        if (actualLines.length === 0 || expectedLines.length === 0) break;
        a = actualLines[actualLines.length - 1];
        b = expectedLines[expectedLines.length - 1];
      }
      var maxLines = Math.max(actualLines.length, expectedLines.length);
      if (maxLines === 0) {
        var _actualLines = actualInspected.split("\n");
        if (_actualLines.length > 30) {
          _actualLines[26] = "".concat(blue, "...").concat(white);
          while (_actualLines.length > 27) {
            _actualLines.pop();
          }
        }
        return ""
          .concat(kReadableOperator.notIdentical, "\n\n")
          .concat(_actualLines.join("\n"), "\n");
      }
      if (i > 3) {
        end = "\n".concat(blue, "...").concat(white).concat(end);
        skipped = true;
      }
      if (other !== "") {
        end = "\n  ".concat(other).concat(end);
        other = "";
      }
      var printedLines = 0;
      var msg =
        kReadableOperator[operator] +
        "\n"
          .concat(green, "+ actual")
          .concat(white, " ")
          .concat(red, "- expected")
          .concat(white);
      var skippedMsg = " ".concat(blue, "...").concat(white, " Lines skipped");
      for (i = 0; i < maxLines; i++) {
        var cur = i - lastPos;
        if (actualLines.length < i + 1) {
          if (cur > 1 && i > 2) {
            if (cur > 4) {
              res += "\n".concat(blue, "...").concat(white);
              skipped = true;
            } else if (cur > 3) {
              res += "\n  ".concat(expectedLines[i - 2]);
              printedLines++;
            }
            res += "\n  ".concat(expectedLines[i - 1]);
            printedLines++;
          }
          lastPos = i;
          other += "\n"
            .concat(red, "-")
            .concat(white, " ")
            .concat(expectedLines[i]);
          printedLines++;
        } else if (expectedLines.length < i + 1) {
          if (cur > 1 && i > 2) {
            if (cur > 4) {
              res += "\n".concat(blue, "...").concat(white);
              skipped = true;
            } else if (cur > 3) {
              res += "\n  ".concat(actualLines[i - 2]);
              printedLines++;
            }
            res += "\n  ".concat(actualLines[i - 1]);
            printedLines++;
          }
          lastPos = i;
          res += "\n"
            .concat(green, "+")
            .concat(white, " ")
            .concat(actualLines[i]);
          printedLines++;
        } else {
          var expectedLine = expectedLines[i];
          var actualLine = actualLines[i];
          var divergingLines =
            actualLine !== expectedLine &&
            (!endsWith(actualLine, ",") ||
              actualLine.slice(0, -1) !== expectedLine);
          if (
            divergingLines &&
            endsWith(expectedLine, ",") &&
            expectedLine.slice(0, -1) === actualLine
          ) {
            divergingLines = false;
            actualLine += ",";
          }
          if (divergingLines) {
            if (cur > 1 && i > 2) {
              if (cur > 4) {
                res += "\n".concat(blue, "...").concat(white);
                skipped = true;
              } else if (cur > 3) {
                res += "\n  ".concat(actualLines[i - 2]);
                printedLines++;
              }
              res += "\n  ".concat(actualLines[i - 1]);
              printedLines++;
            }
            lastPos = i;
            res += "\n"
              .concat(green, "+")
              .concat(white, " ")
              .concat(actualLine);
            other += "\n"
              .concat(red, "-")
              .concat(white, " ")
              .concat(expectedLine);
            printedLines += 2;
          } else {
            res += other;
            other = "";
            if (cur === 1 || i === 0) {
              res += "\n  ".concat(actualLine);
              printedLines++;
            }
          }
        }
        if (printedLines > 20 && i < maxLines - 2) {
          return (
            ""
              .concat(msg)
              .concat(skippedMsg, "\n")
              .concat(res, "\n")
              .concat(blue, "...")
              .concat(white)
              .concat(other, "\n") + "".concat(blue, "...").concat(white)
          );
        }
      }
      return ""
        .concat(msg)
        .concat(skipped ? skippedMsg : "", "\n")
        .concat(res)
        .concat(other)
        .concat(end)
        .concat(indicator);
    }
    var AssertionError = /* @__PURE__ */ (function (_Error) {
      _inherits(AssertionError2, _Error);
      function AssertionError2(options) {
        var _this;
        _classCallCheck(this, AssertionError2);
        if (_typeof(options) !== "object" || options === null) {
          throw new ERR_INVALID_ARG_TYPE("options", "Object", options);
        }
        var message = options.message,
          operator = options.operator,
          stackStartFn = options.stackStartFn;
        var actual = options.actual,
          expected = options.expected;
        var limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        if (message != null) {
          _this = _possibleConstructorReturn(
            this,
            _getPrototypeOf(AssertionError2).call(this, String(message)),
          );
        } else {
          if (process.stderr && process.stderr.isTTY) {
            if (
              process.stderr &&
              process.stderr.getColorDepth &&
              process.stderr.getColorDepth() !== 1
            ) {
              blue = "\x1B[34m";
              green = "\x1B[32m";
              white = "\x1B[39m";
              red = "\x1B[31m";
            } else {
              blue = "";
              green = "";
              white = "";
              red = "";
            }
          }
          if (
            _typeof(actual) === "object" &&
            actual !== null &&
            _typeof(expected) === "object" &&
            expected !== null &&
            "stack" in actual &&
            actual instanceof Error &&
            "stack" in expected &&
            expected instanceof Error
          ) {
            actual = copyError(actual);
            expected = copyError(expected);
          }
          if (operator === "deepStrictEqual" || operator === "strictEqual") {
            _this = _possibleConstructorReturn(
              this,
              _getPrototypeOf(AssertionError2).call(
                this,
                createErrDiff(actual, expected, operator),
              ),
            );
          } else if (
            operator === "notDeepStrictEqual" ||
            operator === "notStrictEqual"
          ) {
            var base = kReadableOperator[operator];
            var res = inspectValue(actual).split("\n");
            if (
              operator === "notStrictEqual" &&
              _typeof(actual) === "object" &&
              actual !== null
            ) {
              base = kReadableOperator.notStrictEqualObject;
            }
            if (res.length > 30) {
              res[26] = "".concat(blue, "...").concat(white);
              while (res.length > 27) {
                res.pop();
              }
            }
            if (res.length === 1) {
              _this = _possibleConstructorReturn(
                this,
                _getPrototypeOf(AssertionError2).call(
                  this,
                  "".concat(base, " ").concat(res[0]),
                ),
              );
            } else {
              _this = _possibleConstructorReturn(
                this,
                _getPrototypeOf(AssertionError2).call(
                  this,
                  "".concat(base, "\n\n").concat(res.join("\n"), "\n"),
                ),
              );
            }
          } else {
            var _res = inspectValue(actual);
            var other = "";
            var knownOperators = kReadableOperator[operator];
            if (operator === "notDeepEqual" || operator === "notEqual") {
              _res = ""
                .concat(kReadableOperator[operator], "\n\n")
                .concat(_res);
              if (_res.length > 1024) {
                _res = "".concat(_res.slice(0, 1021), "...");
              }
            } else {
              other = "".concat(inspectValue(expected));
              if (_res.length > 512) {
                _res = "".concat(_res.slice(0, 509), "...");
              }
              if (other.length > 512) {
                other = "".concat(other.slice(0, 509), "...");
              }
              if (operator === "deepEqual" || operator === "equal") {
                _res = ""
                  .concat(knownOperators, "\n\n")
                  .concat(_res, "\n\nshould equal\n\n");
              } else {
                other = " ".concat(operator, " ").concat(other);
              }
            }
            _this = _possibleConstructorReturn(
              this,
              _getPrototypeOf(AssertionError2).call(
                this,
                "".concat(_res).concat(other),
              ),
            );
          }
        }
        Error.stackTraceLimit = limit;
        _this.generatedMessage = !message;
        Object.defineProperty(_assertThisInitialized(_this), "name", {
          value: "AssertionError [ERR_ASSERTION]",
          enumerable: false,
          writable: true,
          configurable: true,
        });
        _this.code = "ERR_ASSERTION";
        _this.actual = actual;
        _this.expected = expected;
        _this.operator = operator;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(_assertThisInitialized(_this), stackStartFn);
        }
        _this.stack;
        _this.name = "AssertionError";
        return _possibleConstructorReturn(_this);
      }
      _createClass(AssertionError2, [
        {
          key: "toString",
          value: function toString() {
            return ""
              .concat(this.name, " [")
              .concat(this.code, "]: ")
              .concat(this.message);
          },
        },
        {
          key: inspect.custom,
          value: function value(recurseTimes, ctx) {
            return inspect(
              this,
              _objectSpread({}, ctx, {
                customInspect: false,
                depth: 0,
              }),
            );
          },
        },
      ]);
      return AssertionError2;
    })(_wrapNativeSuper(Error));
    module.exports = AssertionError;
  },
});

// node_modules/es6-object-assign/index.js
var require_es6_object_assign = __commonJS({
  "node_modules/es6-object-assign/index.js"(exports, module) {
    "use strict";
    function assign(target, firstSource) {
      if (target === void 0 || target === null) {
        throw new TypeError("Cannot convert first argument to object");
      }
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === void 0 || nextSource === null) {
          continue;
        }
        var keysArray = Object.keys(Object(nextSource));
        for (
          var nextIndex = 0, len = keysArray.length;
          nextIndex < len;
          nextIndex++
        ) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== void 0 && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
    function polyfill() {
      if (!Object.assign) {
        Object.defineProperty(Object, "assign", {
          enumerable: false,
          configurable: true,
          writable: true,
          value: assign,
        });
      }
    }
    module.exports = {
      assign,
      polyfill,
    };
  },
});

// node_modules/object-keys/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/object-keys/isArguments.js"(exports, module) {
    "use strict";
    var toStr = Object.prototype.toString;
    module.exports = function isArguments(value) {
      var str = toStr.call(value);
      var isArgs = str === "[object Arguments]";
      if (!isArgs) {
        isArgs =
          str !== "[object Array]" &&
          value !== null &&
          typeof value === "object" &&
          typeof value.length === "number" &&
          value.length >= 0 &&
          toStr.call(value.callee) === "[object Function]";
      }
      return isArgs;
    };
  },
});

// node_modules/object-keys/implementation.js
var require_implementation2 = __commonJS({
  "node_modules/object-keys/implementation.js"(exports, module) {
    "use strict";
    var keysShim;
    if (!Object.keys) {
      has = Object.prototype.hasOwnProperty;
      toStr = Object.prototype.toString;
      isArgs = require_isArguments();
      isEnumerable = Object.prototype.propertyIsEnumerable;
      hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
      hasProtoEnumBug = isEnumerable.call(function () {}, "prototype");
      dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor",
      ];
      equalsConstructorPrototype = function (o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
      };
      excludedKeys = {
        $applicationCache: true,
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $onmozfullscreenchange: true,
        $onmozfullscreenerror: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true,
      };
      hasAutomationEqualityBug = (function () {
        if (typeof window === "undefined") {
          return false;
        }
        for (var k in window) {
          try {
            if (
              !excludedKeys["$" + k] &&
              has.call(window, k) &&
              window[k] !== null &&
              typeof window[k] === "object"
            ) {
              try {
                equalsConstructorPrototype(window[k]);
              } catch (e) {
                return true;
              }
            }
          } catch (e) {
            return true;
          }
        }
        return false;
      })();
      equalsConstructorPrototypeIfNotBuggy = function (o) {
        if (typeof window === "undefined" || !hasAutomationEqualityBug) {
          return equalsConstructorPrototype(o);
        }
        try {
          return equalsConstructorPrototype(o);
        } catch (e) {
          return false;
        }
      };
      keysShim = function keys(object) {
        var isObject = object !== null && typeof object === "object";
        var isFunction = toStr.call(object) === "[object Function]";
        var isArguments = isArgs(object);
        var isString = isObject && toStr.call(object) === "[object String]";
        var theKeys = [];
        if (!isObject && !isFunction && !isArguments) {
          throw new TypeError("Object.keys called on a non-object");
        }
        var skipProto = hasProtoEnumBug && isFunction;
        if (isString && object.length > 0 && !has.call(object, 0)) {
          for (var i = 0; i < object.length; ++i) {
            theKeys.push(String(i));
          }
        }
        if (isArguments && object.length > 0) {
          for (var j = 0; j < object.length; ++j) {
            theKeys.push(String(j));
          }
        } else {
          for (var name in object) {
            if (
              !(skipProto && name === "prototype") &&
              has.call(object, name)
            ) {
              theKeys.push(String(name));
            }
          }
        }
        if (hasDontEnumBug) {
          var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
          for (var k = 0; k < dontEnums.length; ++k) {
            if (
              !(skipConstructor && dontEnums[k] === "constructor") &&
              has.call(object, dontEnums[k])
            ) {
              theKeys.push(dontEnums[k]);
            }
          }
        }
        return theKeys;
      };
    }
    var has;
    var toStr;
    var isArgs;
    var isEnumerable;
    var hasDontEnumBug;
    var hasProtoEnumBug;
    var dontEnums;
    var equalsConstructorPrototype;
    var excludedKeys;
    var hasAutomationEqualityBug;
    var equalsConstructorPrototypeIfNotBuggy;
    module.exports = keysShim;
  },
});

// node_modules/object-keys/index.js
var require_object_keys = __commonJS({
  "node_modules/object-keys/index.js"(exports, module) {
    "use strict";
    var slice = Array.prototype.slice;
    var isArgs = require_isArguments();
    var origKeys = Object.keys;
    var keysShim = origKeys
      ? function keys(o) {
          return origKeys(o);
        }
      : require_implementation2();
    var originalKeys = Object.keys;
    keysShim.shim = function shimObjectKeys() {
      if (Object.keys) {
        var keysWorksWithArguments = (function () {
          var args = Object.keys(arguments);
          return args && args.length === arguments.length;
        })(1, 2);
        if (!keysWorksWithArguments) {
          Object.keys = function keys(object) {
            if (isArgs(object)) {
              return originalKeys(slice.call(object));
            }
            return originalKeys(object);
          };
        }
      } else {
        Object.keys = keysShim;
      }
      return Object.keys || keysShim;
    };
    module.exports = keysShim;
  },
});

// node_modules/has-property-descriptors/index.js
var require_has_property_descriptors = __commonJS({
  "node_modules/has-property-descriptors/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var hasPropertyDescriptors = function hasPropertyDescriptors2() {
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
          return true;
        } catch (e) {
          return false;
        }
      }
      return false;
    };
    hasPropertyDescriptors.hasArrayLengthDefineBug =
      function hasArrayLengthDefineBug() {
        if (!hasPropertyDescriptors()) {
          return null;
        }
        try {
          return $defineProperty([], "length", { value: 1 }).length !== 1;
        } catch (e) {
          return true;
        }
      };
    module.exports = hasPropertyDescriptors;
  },
});

// node_modules/define-properties/index.js
var require_define_properties = __commonJS({
  "node_modules/define-properties/index.js"(exports, module) {
    "use strict";
    var keys = require_object_keys();
    var hasSymbols =
      typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
    var toStr = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;
    var isFunction = function (fn) {
      return typeof fn === "function" && toStr.call(fn) === "[object Function]";
    };
    var hasPropertyDescriptors = require_has_property_descriptors()();
    var supportsDescriptors = origDefineProperty && hasPropertyDescriptors;
    var defineProperty = function (object, name, value, predicate) {
      if (name in object) {
        if (predicate === true) {
          if (object[name] === value) {
            return;
          }
        } else if (!isFunction(predicate) || !predicate()) {
          return;
        }
      }
      if (supportsDescriptors) {
        origDefineProperty(object, name, {
          configurable: true,
          enumerable: false,
          value,
          writable: true,
        });
      } else {
        object[name] = value;
      }
    };
    var defineProperties = function (object, map) {
      var predicates = arguments.length > 2 ? arguments[2] : {};
      var props = keys(map);
      if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
      }
      for (var i = 0; i < props.length; i += 1) {
        defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
      }
    };
    defineProperties.supportsDescriptors = !!supportsDescriptors;
    module.exports = defineProperties;
  },
});

// node_modules/object-is/implementation.js
var require_implementation3 = __commonJS({
  "node_modules/object-is/implementation.js"(exports, module) {
    "use strict";
    var numberIsNaN = function (value) {
      return value !== value;
    };
    module.exports = function is(a, b) {
      if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
      }
      if (a === b) {
        return true;
      }
      if (numberIsNaN(a) && numberIsNaN(b)) {
        return true;
      }
      return false;
    };
  },
});

// node_modules/object-is/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/object-is/polyfill.js"(exports, module) {
    "use strict";
    var implementation = require_implementation3();
    module.exports = function getPolyfill() {
      return typeof Object.is === "function" ? Object.is : implementation;
    };
  },
});

// node_modules/object-is/shim.js
var require_shim = __commonJS({
  "node_modules/object-is/shim.js"(exports, module) {
    "use strict";
    var getPolyfill = require_polyfill();
    var define = require_define_properties();
    module.exports = function shimObjectIs() {
      var polyfill = getPolyfill();
      define(
        Object,
        { is: polyfill },
        {
          is: function testObjectIs() {
            return Object.is !== polyfill;
          },
        },
      );
      return polyfill;
    };
  },
});

// node_modules/object-is/index.js
var require_object_is = __commonJS({
  "node_modules/object-is/index.js"(exports, module) {
    "use strict";
    var define = require_define_properties();
    var callBind = require_call_bind();
    var implementation = require_implementation3();
    var getPolyfill = require_polyfill();
    var shim = require_shim();
    var polyfill = callBind(getPolyfill(), Object);
    define(polyfill, {
      getPolyfill,
      implementation,
      shim,
    });
    module.exports = polyfill;
  },
});

// node_modules/is-nan/implementation.js
var require_implementation4 = __commonJS({
  "node_modules/is-nan/implementation.js"(exports, module) {
    "use strict";
    module.exports = function isNaN2(value) {
      return value !== value;
    };
  },
});

// node_modules/is-nan/polyfill.js
var require_polyfill2 = __commonJS({
  "node_modules/is-nan/polyfill.js"(exports, module) {
    "use strict";
    var implementation = require_implementation4();
    module.exports = function getPolyfill() {
      if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN("a")) {
        return Number.isNaN;
      }
      return implementation;
    };
  },
});

// node_modules/is-nan/shim.js
var require_shim2 = __commonJS({
  "node_modules/is-nan/shim.js"(exports, module) {
    "use strict";
    var define = require_define_properties();
    var getPolyfill = require_polyfill2();
    module.exports = function shimNumberIsNaN() {
      var polyfill = getPolyfill();
      define(
        Number,
        { isNaN: polyfill },
        {
          isNaN: function testIsNaN() {
            return Number.isNaN !== polyfill;
          },
        },
      );
      return polyfill;
    };
  },
});

// node_modules/is-nan/index.js
var require_is_nan = __commonJS({
  "node_modules/is-nan/index.js"(exports, module) {
    "use strict";
    var callBind = require_call_bind();
    var define = require_define_properties();
    var implementation = require_implementation4();
    var getPolyfill = require_polyfill2();
    var shim = require_shim2();
    var polyfill = callBind(getPolyfill(), Number);
    define(polyfill, {
      getPolyfill,
      implementation,
      shim,
    });
    module.exports = polyfill;
  },
});

// node_modules/assert/build/internal/util/comparisons.js
var require_comparisons = __commonJS({
  "node_modules/assert/build/internal/util/comparisons.js"(exports, module) {
    "use strict";
    function _slicedToArray(arr, i) {
      return (
        _arrayWithHoles(arr) ||
        _iterableToArrayLimit(arr, i) ||
        _nonIterableRest()
      );
    }
    function _nonIterableRest() {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance",
      );
    }
    function _iterableToArrayLimit(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = void 0;
      try {
        for (
          var _i = arr[Symbol.iterator](), _s;
          !(_n = (_s = _i.next()).done);
          _n = true
        ) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 &&
            typeof Symbol === "function" &&
            obj2.constructor === Symbol &&
            obj2 !== Symbol.prototype
            ? "symbol"
            : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    var regexFlagsSupported = /a/g.flags !== void 0;
    var arrayFromSet = function arrayFromSet2(set) {
      var array = [];
      set.forEach(function (value) {
        return array.push(value);
      });
      return array;
    };
    var arrayFromMap = function arrayFromMap2(map) {
      var array = [];
      map.forEach(function (value, key) {
        return array.push([key, value]);
      });
      return array;
    };
    var objectIs = Object.is ? Object.is : require_object_is();
    var objectGetOwnPropertySymbols = Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols
      : function () {
          return [];
        };
    var numberIsNaN = Number.isNaN ? Number.isNaN : require_is_nan();
    function uncurryThis(f) {
      return f.call.bind(f);
    }
    var hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
    var propertyIsEnumerable = uncurryThis(
      Object.prototype.propertyIsEnumerable,
    );
    var objectToString = uncurryThis(Object.prototype.toString);
    var _require$types = require_util().types;
    var isAnyArrayBuffer = _require$types.isAnyArrayBuffer;
    var isArrayBufferView = _require$types.isArrayBufferView;
    var isDate = _require$types.isDate;
    var isMap = _require$types.isMap;
    var isRegExp = _require$types.isRegExp;
    var isSet = _require$types.isSet;
    var isNativeError = _require$types.isNativeError;
    var isBoxedPrimitive = _require$types.isBoxedPrimitive;
    var isNumberObject = _require$types.isNumberObject;
    var isStringObject = _require$types.isStringObject;
    var isBooleanObject = _require$types.isBooleanObject;
    var isBigIntObject = _require$types.isBigIntObject;
    var isSymbolObject = _require$types.isSymbolObject;
    var isFloat32Array = _require$types.isFloat32Array;
    var isFloat64Array = _require$types.isFloat64Array;
    function isNonIndex(key) {
      if (key.length === 0 || key.length > 10) return true;
      for (var i = 0; i < key.length; i++) {
        var code = key.charCodeAt(i);
        if (code < 48 || code > 57) return true;
      }
      return key.length === 10 && key >= Math.pow(2, 32);
    }
    function getOwnNonIndexProperties(value) {
      return Object.keys(value)
        .filter(isNonIndex)
        .concat(
          objectGetOwnPropertySymbols(value).filter(
            Object.prototype.propertyIsEnumerable.bind(value),
          ),
        );
    }
    function compare(a, b) {
      if (a === b) {
        return 0;
      }
      var x = a.length;
      var y = b.length;
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) {
        return -1;
      }
      if (y < x) {
        return 1;
      }
      return 0;
    }
    var ONLY_ENUMERABLE = void 0;
    var kStrict = true;
    var kLoose = false;
    var kNoIterator = 0;
    var kIsArray = 1;
    var kIsSet = 2;
    var kIsMap = 3;
    function areSimilarRegExps(a, b) {
      return regexFlagsSupported
        ? a.source === b.source && a.flags === b.flags
        : RegExp.prototype.toString.call(a) ===
            RegExp.prototype.toString.call(b);
    }
    function areSimilarFloatArrays(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      for (var offset = 0; offset < a.byteLength; offset++) {
        if (a[offset] !== b[offset]) {
          return false;
        }
      }
      return true;
    }
    function areSimilarTypedArrays(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return (
        compare(
          new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
          new Uint8Array(b.buffer, b.byteOffset, b.byteLength),
        ) === 0
      );
    }
    function areEqualArrayBuffers(buf1, buf2) {
      return (
        buf1.byteLength === buf2.byteLength &&
        compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0
      );
    }
    function isEqualBoxedPrimitive(val1, val2) {
      if (isNumberObject(val1)) {
        return (
          isNumberObject(val2) &&
          objectIs(
            Number.prototype.valueOf.call(val1),
            Number.prototype.valueOf.call(val2),
          )
        );
      }
      if (isStringObject(val1)) {
        return (
          isStringObject(val2) &&
          String.prototype.valueOf.call(val1) ===
            String.prototype.valueOf.call(val2)
        );
      }
      if (isBooleanObject(val1)) {
        return (
          isBooleanObject(val2) &&
          Boolean.prototype.valueOf.call(val1) ===
            Boolean.prototype.valueOf.call(val2)
        );
      }
      if (isBigIntObject(val1)) {
        return (
          isBigIntObject(val2) &&
          BigInt.prototype.valueOf.call(val1) ===
            BigInt.prototype.valueOf.call(val2)
        );
      }
      return (
        isSymbolObject(val2) &&
        Symbol.prototype.valueOf.call(val1) ===
          Symbol.prototype.valueOf.call(val2)
      );
    }
    function innerDeepEqual(val1, val2, strict, memos) {
      if (val1 === val2) {
        if (val1 !== 0) return true;
        return strict ? objectIs(val1, val2) : true;
      }
      if (strict) {
        if (_typeof(val1) !== "object") {
          return (
            typeof val1 === "number" && numberIsNaN(val1) && numberIsNaN(val2)
          );
        }
        if (_typeof(val2) !== "object" || val1 === null || val2 === null) {
          return false;
        }
        if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
          return false;
        }
      } else {
        if (val1 === null || _typeof(val1) !== "object") {
          if (val2 === null || _typeof(val2) !== "object") {
            return val1 == val2;
          }
          return false;
        }
        if (val2 === null || _typeof(val2) !== "object") {
          return false;
        }
      }
      var val1Tag = objectToString(val1);
      var val2Tag = objectToString(val2);
      if (val1Tag !== val2Tag) {
        return false;
      }
      if (Array.isArray(val1)) {
        if (val1.length !== val2.length) {
          return false;
        }
        var keys1 = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
        var keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
        if (keys1.length !== keys2.length) {
          return false;
        }
        return keyCheck(val1, val2, strict, memos, kIsArray, keys1);
      }
      if (val1Tag === "[object Object]") {
        if ((!isMap(val1) && isMap(val2)) || (!isSet(val1) && isSet(val2))) {
          return false;
        }
      }
      if (isDate(val1)) {
        if (
          !isDate(val2) ||
          Date.prototype.getTime.call(val1) !==
            Date.prototype.getTime.call(val2)
        ) {
          return false;
        }
      } else if (isRegExp(val1)) {
        if (!isRegExp(val2) || !areSimilarRegExps(val1, val2)) {
          return false;
        }
      } else if (isNativeError(val1) || val1 instanceof Error) {
        if (val1.message !== val2.message || val1.name !== val2.name) {
          return false;
        }
      } else if (isArrayBufferView(val1)) {
        if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
          if (!areSimilarFloatArrays(val1, val2)) {
            return false;
          }
        } else if (!areSimilarTypedArrays(val1, val2)) {
          return false;
        }
        var _keys = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
        var _keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
        if (_keys.length !== _keys2.length) {
          return false;
        }
        return keyCheck(val1, val2, strict, memos, kNoIterator, _keys);
      } else if (isSet(val1)) {
        if (!isSet(val2) || val1.size !== val2.size) {
          return false;
        }
        return keyCheck(val1, val2, strict, memos, kIsSet);
      } else if (isMap(val1)) {
        if (!isMap(val2) || val1.size !== val2.size) {
          return false;
        }
        return keyCheck(val1, val2, strict, memos, kIsMap);
      } else if (isAnyArrayBuffer(val1)) {
        if (!areEqualArrayBuffers(val1, val2)) {
          return false;
        }
      } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
        return false;
      }
      return keyCheck(val1, val2, strict, memos, kNoIterator);
    }
    function getEnumerables(val, keys) {
      return keys.filter(function (k) {
        return propertyIsEnumerable(val, k);
      });
    }
    function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
      if (arguments.length === 5) {
        aKeys = Object.keys(val1);
        var bKeys = Object.keys(val2);
        if (aKeys.length !== bKeys.length) {
          return false;
        }
      }
      var i = 0;
      for (; i < aKeys.length; i++) {
        if (!hasOwnProperty(val2, aKeys[i])) {
          return false;
        }
      }
      if (strict && arguments.length === 5) {
        var symbolKeysA = objectGetOwnPropertySymbols(val1);
        if (symbolKeysA.length !== 0) {
          var count = 0;
          for (i = 0; i < symbolKeysA.length; i++) {
            var key = symbolKeysA[i];
            if (propertyIsEnumerable(val1, key)) {
              if (!propertyIsEnumerable(val2, key)) {
                return false;
              }
              aKeys.push(key);
              count++;
            } else if (propertyIsEnumerable(val2, key)) {
              return false;
            }
          }
          var symbolKeysB = objectGetOwnPropertySymbols(val2);
          if (
            symbolKeysA.length !== symbolKeysB.length &&
            getEnumerables(val2, symbolKeysB).length !== count
          ) {
            return false;
          }
        } else {
          var _symbolKeysB = objectGetOwnPropertySymbols(val2);
          if (
            _symbolKeysB.length !== 0 &&
            getEnumerables(val2, _symbolKeysB).length !== 0
          ) {
            return false;
          }
        }
      }
      if (
        aKeys.length === 0 &&
        (iterationType === kNoIterator ||
          (iterationType === kIsArray && val1.length === 0) ||
          val1.size === 0)
      ) {
        return true;
      }
      if (memos === void 0) {
        memos = {
          val1: /* @__PURE__ */ new Map(),
          val2: /* @__PURE__ */ new Map(),
          position: 0,
        };
      } else {
        var val2MemoA = memos.val1.get(val1);
        if (val2MemoA !== void 0) {
          var val2MemoB = memos.val2.get(val2);
          if (val2MemoB !== void 0) {
            return val2MemoA === val2MemoB;
          }
        }
        memos.position++;
      }
      memos.val1.set(val1, memos.position);
      memos.val2.set(val2, memos.position);
      var areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
      memos.val1.delete(val1);
      memos.val2.delete(val2);
      return areEq;
    }
    function setHasEqualElement(set, val1, strict, memo) {
      var setValues = arrayFromSet(set);
      for (var i = 0; i < setValues.length; i++) {
        var val2 = setValues[i];
        if (innerDeepEqual(val1, val2, strict, memo)) {
          set.delete(val2);
          return true;
        }
      }
      return false;
    }
    function findLooseMatchingPrimitives(prim) {
      switch (_typeof(prim)) {
        case "undefined":
          return null;
        case "object":
          return void 0;
        case "symbol":
          return false;
        case "string":
          prim = +prim;
        case "number":
          if (numberIsNaN(prim)) {
            return false;
          }
      }
      return true;
    }
    function setMightHaveLoosePrim(a, b, prim) {
      var altValue = findLooseMatchingPrimitives(prim);
      if (altValue != null) return altValue;
      return b.has(altValue) && !a.has(altValue);
    }
    function mapMightHaveLoosePrim(a, b, prim, item, memo) {
      var altValue = findLooseMatchingPrimitives(prim);
      if (altValue != null) {
        return altValue;
      }
      var curB = b.get(altValue);
      if (
        (curB === void 0 && !b.has(altValue)) ||
        !innerDeepEqual(item, curB, false, memo)
      ) {
        return false;
      }
      return !a.has(altValue) && innerDeepEqual(item, curB, false, memo);
    }
    function setEquiv(a, b, strict, memo) {
      var set = null;
      var aValues = arrayFromSet(a);
      for (var i = 0; i < aValues.length; i++) {
        var val = aValues[i];
        if (_typeof(val) === "object" && val !== null) {
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(val);
        } else if (!b.has(val)) {
          if (strict) return false;
          if (!setMightHaveLoosePrim(a, b, val)) {
            return false;
          }
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(val);
        }
      }
      if (set !== null) {
        var bValues = arrayFromSet(b);
        for (var _i = 0; _i < bValues.length; _i++) {
          var _val = bValues[_i];
          if (_typeof(_val) === "object" && _val !== null) {
            if (!setHasEqualElement(set, _val, strict, memo)) return false;
          } else if (
            !strict &&
            !a.has(_val) &&
            !setHasEqualElement(set, _val, strict, memo)
          ) {
            return false;
          }
        }
        return set.size === 0;
      }
      return true;
    }
    function mapHasEqualEntry(set, map, key1, item1, strict, memo) {
      var setValues = arrayFromSet(set);
      for (var i = 0; i < setValues.length; i++) {
        var key2 = setValues[i];
        if (
          innerDeepEqual(key1, key2, strict, memo) &&
          innerDeepEqual(item1, map.get(key2), strict, memo)
        ) {
          set.delete(key2);
          return true;
        }
      }
      return false;
    }
    function mapEquiv(a, b, strict, memo) {
      var set = null;
      var aEntries = arrayFromMap(a);
      for (var i = 0; i < aEntries.length; i++) {
        var _aEntries$i = _slicedToArray(aEntries[i], 2),
          key = _aEntries$i[0],
          item1 = _aEntries$i[1];
        if (_typeof(key) === "object" && key !== null) {
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(key);
        } else {
          var item2 = b.get(key);
          if (
            (item2 === void 0 && !b.has(key)) ||
            !innerDeepEqual(item1, item2, strict, memo)
          ) {
            if (strict) return false;
            if (!mapMightHaveLoosePrim(a, b, key, item1, memo)) return false;
            if (set === null) {
              set = /* @__PURE__ */ new Set();
            }
            set.add(key);
          }
        }
      }
      if (set !== null) {
        var bEntries = arrayFromMap(b);
        for (var _i2 = 0; _i2 < bEntries.length; _i2++) {
          var _bEntries$_i = _slicedToArray(bEntries[_i2], 2),
            key = _bEntries$_i[0],
            item = _bEntries$_i[1];
          if (_typeof(key) === "object" && key !== null) {
            if (!mapHasEqualEntry(set, a, key, item, strict, memo))
              return false;
          } else if (
            !strict &&
            (!a.has(key) || !innerDeepEqual(a.get(key), item, false, memo)) &&
            !mapHasEqualEntry(set, a, key, item, false, memo)
          ) {
            return false;
          }
        }
        return set.size === 0;
      }
      return true;
    }
    function objEquiv(a, b, strict, keys, memos, iterationType) {
      var i = 0;
      if (iterationType === kIsSet) {
        if (!setEquiv(a, b, strict, memos)) {
          return false;
        }
      } else if (iterationType === kIsMap) {
        if (!mapEquiv(a, b, strict, memos)) {
          return false;
        }
      } else if (iterationType === kIsArray) {
        for (; i < a.length; i++) {
          if (hasOwnProperty(a, i)) {
            if (
              !hasOwnProperty(b, i) ||
              !innerDeepEqual(a[i], b[i], strict, memos)
            ) {
              return false;
            }
          } else if (hasOwnProperty(b, i)) {
            return false;
          } else {
            var keysA = Object.keys(a);
            for (; i < keysA.length; i++) {
              var key = keysA[i];
              if (
                !hasOwnProperty(b, key) ||
                !innerDeepEqual(a[key], b[key], strict, memos)
              ) {
                return false;
              }
            }
            if (keysA.length !== Object.keys(b).length) {
              return false;
            }
            return true;
          }
        }
      }
      for (i = 0; i < keys.length; i++) {
        var _key = keys[i];
        if (!innerDeepEqual(a[_key], b[_key], strict, memos)) {
          return false;
        }
      }
      return true;
    }
    function isDeepEqual(val1, val2) {
      return innerDeepEqual(val1, val2, kLoose);
    }
    function isDeepStrictEqual(val1, val2) {
      return innerDeepEqual(val1, val2, kStrict);
    }
    module.exports = {
      isDeepEqual,
      isDeepStrictEqual,
    };
  },
});

// node_modules/assert/build/assert.js
var require_assert = __commonJS({
  "node_modules/assert/build/assert.js"(exports, module) {
    "use strict";
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 &&
            typeof Symbol === "function" &&
            obj2.constructor === Symbol &&
            obj2 !== Symbol.prototype
            ? "symbol"
            : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var _require = require_errors();
    var _require$codes = _require.codes;
    var ERR_AMBIGUOUS_ARGUMENT = _require$codes.ERR_AMBIGUOUS_ARGUMENT;
    var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
    var ERR_INVALID_ARG_VALUE = _require$codes.ERR_INVALID_ARG_VALUE;
    var ERR_INVALID_RETURN_VALUE = _require$codes.ERR_INVALID_RETURN_VALUE;
    var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
    var AssertionError = require_assertion_error();
    var _require2 = require_util();
    var inspect = _require2.inspect;
    var _require$types = require_util().types;
    var isPromise = _require$types.isPromise;
    var isRegExp = _require$types.isRegExp;
    var objectAssign = Object.assign
      ? Object.assign
      : require_es6_object_assign().assign;
    var objectIs = Object.is ? Object.is : require_object_is();
    var isDeepEqual;
    var isDeepStrictEqual;
    function lazyLoadComparison() {
      var comparison = require_comparisons();
      isDeepEqual = comparison.isDeepEqual;
      isDeepStrictEqual = comparison.isDeepStrictEqual;
    }
    var warned = false;
    var assert = (module.exports = ok);
    var NO_EXCEPTION_SENTINEL = {};
    function innerFail(obj) {
      if (obj.message instanceof Error) throw obj.message;
      throw new AssertionError(obj);
    }
    function fail(actual, expected, message, operator, stackStartFn) {
      var argsLen = arguments.length;
      var internalMessage;
      if (argsLen === 0) {
        internalMessage = "Failed";
      } else if (argsLen === 1) {
        message = actual;
        actual = void 0;
      } else {
        if (warned === false) {
          warned = true;
          var warn = process.emitWarning
            ? process.emitWarning
            : console.warn.bind(console);
          warn(
            "assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.",
            "DeprecationWarning",
            "DEP0094",
          );
        }
        if (argsLen === 2) operator = "!=";
      }
      if (message instanceof Error) throw message;
      var errArgs = {
        actual,
        expected,
        operator: operator === void 0 ? "fail" : operator,
        stackStartFn: stackStartFn || fail,
      };
      if (message !== void 0) {
        errArgs.message = message;
      }
      var err = new AssertionError(errArgs);
      if (internalMessage) {
        err.message = internalMessage;
        err.generatedMessage = true;
      }
      throw err;
    }
    assert.fail = fail;
    assert.AssertionError = AssertionError;
    function innerOk(fn, argLen, value, message) {
      if (!value) {
        var generatedMessage = false;
        if (argLen === 0) {
          generatedMessage = true;
          message = "No value argument passed to `assert.ok()`";
        } else if (message instanceof Error) {
          throw message;
        }
        var err = new AssertionError({
          actual: value,
          expected: true,
          message,
          operator: "==",
          stackStartFn: fn,
        });
        err.generatedMessage = generatedMessage;
        throw err;
      }
    }
    function ok() {
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }
      innerOk.apply(void 0, [ok, args.length].concat(args));
    }
    assert.ok = ok;
    assert.equal = function equal(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (actual != expected) {
        innerFail({
          actual,
          expected,
          message,
          operator: "==",
          stackStartFn: equal,
        });
      }
    };
    assert.notEqual = function notEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (actual == expected) {
        innerFail({
          actual,
          expected,
          message,
          operator: "!=",
          stackStartFn: notEqual,
        });
      }
    };
    assert.deepEqual = function deepEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (!isDeepEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "deepEqual",
          stackStartFn: deepEqual,
        });
      }
    };
    assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (isDeepEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notDeepEqual",
          stackStartFn: notDeepEqual,
        });
      }
    };
    assert.deepStrictEqual = function deepStrictEqual(
      actual,
      expected,
      message,
    ) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (!isDeepStrictEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "deepStrictEqual",
          stackStartFn: deepStrictEqual,
        });
      }
    };
    assert.notDeepStrictEqual = notDeepStrictEqual;
    function notDeepStrictEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (isDeepStrictEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notDeepStrictEqual",
          stackStartFn: notDeepStrictEqual,
        });
      }
    }
    assert.strictEqual = function strictEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (!objectIs(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "strictEqual",
          stackStartFn: strictEqual,
        });
      }
    };
    assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (objectIs(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notStrictEqual",
          stackStartFn: notStrictEqual,
        });
      }
    };
    var Comparison = function Comparison2(obj, keys, actual) {
      var _this = this;
      _classCallCheck(this, Comparison2);
      keys.forEach(function (key) {
        if (key in obj) {
          if (
            actual !== void 0 &&
            typeof actual[key] === "string" &&
            isRegExp(obj[key]) &&
            obj[key].test(actual[key])
          ) {
            _this[key] = actual[key];
          } else {
            _this[key] = obj[key];
          }
        }
      });
    };
    function compareExceptionKey(actual, expected, key, message, keys, fn) {
      if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
        if (!message) {
          var a = new Comparison(actual, keys);
          var b = new Comparison(expected, keys, actual);
          var err = new AssertionError({
            actual: a,
            expected: b,
            operator: "deepStrictEqual",
            stackStartFn: fn,
          });
          err.actual = actual;
          err.expected = expected;
          err.operator = fn.name;
          throw err;
        }
        innerFail({
          actual,
          expected,
          message,
          operator: fn.name,
          stackStartFn: fn,
        });
      }
    }
    function expectedException(actual, expected, msg, fn) {
      if (typeof expected !== "function") {
        if (isRegExp(expected)) return expected.test(actual);
        if (arguments.length === 2) {
          throw new ERR_INVALID_ARG_TYPE(
            "expected",
            ["Function", "RegExp"],
            expected,
          );
        }
        if (_typeof(actual) !== "object" || actual === null) {
          var err = new AssertionError({
            actual,
            expected,
            message: msg,
            operator: "deepStrictEqual",
            stackStartFn: fn,
          });
          err.operator = fn.name;
          throw err;
        }
        var keys = Object.keys(expected);
        if (expected instanceof Error) {
          keys.push("name", "message");
        } else if (keys.length === 0) {
          throw new ERR_INVALID_ARG_VALUE(
            "error",
            expected,
            "may not be an empty object",
          );
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        keys.forEach(function (key) {
          if (
            typeof actual[key] === "string" &&
            isRegExp(expected[key]) &&
            expected[key].test(actual[key])
          ) {
            return;
          }
          compareExceptionKey(actual, expected, key, msg, keys, fn);
        });
        return true;
      }
      if (expected.prototype !== void 0 && actual instanceof expected) {
        return true;
      }
      if (Error.isPrototypeOf(expected)) {
        return false;
      }
      return expected.call({}, actual) === true;
    }
    function getActual(fn) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", "Function", fn);
      }
      try {
        fn();
      } catch (e) {
        return e;
      }
      return NO_EXCEPTION_SENTINEL;
    }
    function checkIsPromise(obj) {
      return (
        isPromise(obj) ||
        (obj !== null &&
          _typeof(obj) === "object" &&
          typeof obj.then === "function" &&
          typeof obj.catch === "function")
      );
    }
    function waitForActual(promiseFn) {
      return Promise.resolve().then(function () {
        var resultPromise;
        if (typeof promiseFn === "function") {
          resultPromise = promiseFn();
          if (!checkIsPromise(resultPromise)) {
            throw new ERR_INVALID_RETURN_VALUE(
              "instance of Promise",
              "promiseFn",
              resultPromise,
            );
          }
        } else if (checkIsPromise(promiseFn)) {
          resultPromise = promiseFn;
        } else {
          throw new ERR_INVALID_ARG_TYPE(
            "promiseFn",
            ["Function", "Promise"],
            promiseFn,
          );
        }
        return Promise.resolve()
          .then(function () {
            return resultPromise;
          })
          .then(function () {
            return NO_EXCEPTION_SENTINEL;
          })
          .catch(function (e) {
            return e;
          });
      });
    }
    function expectsError(stackStartFn, actual, error, message) {
      if (typeof error === "string") {
        if (arguments.length === 4) {
          throw new ERR_INVALID_ARG_TYPE(
            "error",
            ["Object", "Error", "Function", "RegExp"],
            error,
          );
        }
        if (_typeof(actual) === "object" && actual !== null) {
          if (actual.message === error) {
            throw new ERR_AMBIGUOUS_ARGUMENT(
              "error/message",
              'The error message "'.concat(
                actual.message,
                '" is identical to the message.',
              ),
            );
          }
        } else if (actual === error) {
          throw new ERR_AMBIGUOUS_ARGUMENT(
            "error/message",
            'The error "'.concat(actual, '" is identical to the message.'),
          );
        }
        message = error;
        error = void 0;
      } else if (
        error != null &&
        _typeof(error) !== "object" &&
        typeof error !== "function"
      ) {
        throw new ERR_INVALID_ARG_TYPE(
          "error",
          ["Object", "Error", "Function", "RegExp"],
          error,
        );
      }
      if (actual === NO_EXCEPTION_SENTINEL) {
        var details = "";
        if (error && error.name) {
          details += " (".concat(error.name, ")");
        }
        details += message ? ": ".concat(message) : ".";
        var fnType =
          stackStartFn.name === "rejects" ? "rejection" : "exception";
        innerFail({
          actual: void 0,
          expected: error,
          operator: stackStartFn.name,
          message: "Missing expected ".concat(fnType).concat(details),
          stackStartFn,
        });
      }
      if (error && !expectedException(actual, error, message, stackStartFn)) {
        throw actual;
      }
    }
    function expectsNoError(stackStartFn, actual, error, message) {
      if (actual === NO_EXCEPTION_SENTINEL) return;
      if (typeof error === "string") {
        message = error;
        error = void 0;
      }
      if (!error || expectedException(actual, error)) {
        var details = message ? ": ".concat(message) : ".";
        var fnType =
          stackStartFn.name === "doesNotReject" ? "rejection" : "exception";
        innerFail({
          actual,
          expected: error,
          operator: stackStartFn.name,
          message:
            "Got unwanted ".concat(fnType).concat(details, "\n") +
            'Actual message: "'.concat(actual && actual.message, '"'),
          stackStartFn,
        });
      }
      throw actual;
    }
    assert.throws = function throws(promiseFn) {
      for (
        var _len2 = arguments.length,
          args = new Array(_len2 > 1 ? _len2 - 1 : 0),
          _key2 = 1;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2 - 1] = arguments[_key2];
      }
      expectsError.apply(void 0, [throws, getActual(promiseFn)].concat(args));
    };
    assert.rejects = function rejects(promiseFn) {
      for (
        var _len3 = arguments.length,
          args = new Array(_len3 > 1 ? _len3 - 1 : 0),
          _key3 = 1;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3 - 1] = arguments[_key3];
      }
      return waitForActual(promiseFn).then(function (result) {
        return expectsError.apply(void 0, [rejects, result].concat(args));
      });
    };
    assert.doesNotThrow = function doesNotThrow(fn) {
      for (
        var _len4 = arguments.length,
          args = new Array(_len4 > 1 ? _len4 - 1 : 0),
          _key4 = 1;
        _key4 < _len4;
        _key4++
      ) {
        args[_key4 - 1] = arguments[_key4];
      }
      expectsNoError.apply(void 0, [doesNotThrow, getActual(fn)].concat(args));
    };
    assert.doesNotReject = function doesNotReject(fn) {
      for (
        var _len5 = arguments.length,
          args = new Array(_len5 > 1 ? _len5 - 1 : 0),
          _key5 = 1;
        _key5 < _len5;
        _key5++
      ) {
        args[_key5 - 1] = arguments[_key5];
      }
      return waitForActual(fn).then(function (result) {
        return expectsNoError.apply(
          void 0,
          [doesNotReject, result].concat(args),
        );
      });
    };
    assert.ifError = function ifError(err) {
      if (err !== null && err !== void 0) {
        var message = "ifError got unwanted exception: ";
        if (_typeof(err) === "object" && typeof err.message === "string") {
          if (err.message.length === 0 && err.constructor) {
            message += err.constructor.name;
          } else {
            message += err.message;
          }
        } else {
          message += inspect(err);
        }
        var newErr = new AssertionError({
          actual: err,
          expected: null,
          operator: "ifError",
          message,
          stackStartFn: ifError,
        });
        var origStack = err.stack;
        if (typeof origStack === "string") {
          var tmp2 = origStack.split("\n");
          tmp2.shift();
          var tmp1 = newErr.stack.split("\n");
          for (var i = 0; i < tmp2.length; i++) {
            var pos = tmp1.indexOf(tmp2[i]);
            if (pos !== -1) {
              tmp1 = tmp1.slice(0, pos);
              break;
            }
          }
          newErr.stack = ""
            .concat(tmp1.join("\n"), "\n")
            .concat(tmp2.join("\n"));
        }
        throw newErr;
      }
    };
    function strict() {
      for (
        var _len6 = arguments.length, args = new Array(_len6), _key6 = 0;
        _key6 < _len6;
        _key6++
      ) {
        args[_key6] = arguments[_key6];
      }
      innerOk.apply(void 0, [strict, args.length].concat(args));
    }
    assert.strict = objectAssign(strict, assert, {
      equal: assert.strictEqual,
      deepEqual: assert.deepStrictEqual,
      notEqual: assert.notStrictEqual,
      notDeepEqual: assert.notDeepStrictEqual,
    });
    assert.strict.strict = assert.strict;
  },
});

// node_modules/memfs/lib/internal/errors.js
var require_errors2 = __commonJS({
  "node_modules/memfs/lib/internal/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.E =
      exports.AssertionError =
      exports.message =
      exports.RangeError =
      exports.TypeError =
      exports.Error =
        void 0;
    var assert = require_assert();
    var util = require_util();
    var kCode = typeof Symbol === "undefined" ? "_kCode" : Symbol("code");
    var messages = {};
    function makeNodeError(Base) {
      return class NodeError extends Base {
        constructor(key, ...args) {
          super(message(key, args));
          this.code = key;
          this[kCode] = key;
          this.name = `${super.name} [${this[kCode]}]`;
        }
      };
    }
    var g = typeof globalThis !== "undefined" ? globalThis : global;
    var AssertionError = class extends g.Error {
      constructor(options) {
        if (typeof options !== "object" || options === null) {
          throw new exports.TypeError(
            "ERR_INVALID_ARG_TYPE",
            "options",
            "object",
          );
        }
        if (options.message) {
          super(options.message);
        } else {
          super(
            `${util.inspect(options.actual).slice(0, 128)} ${options.operator} ${util.inspect(options.expected).slice(0, 128)}`,
          );
        }
        this.generatedMessage = !options.message;
        this.name = "AssertionError [ERR_ASSERTION]";
        this.code = "ERR_ASSERTION";
        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = options.operator;
        exports.Error.captureStackTrace(this, options.stackStartFunction);
      }
    };
    exports.AssertionError = AssertionError;
    function message(key, args) {
      assert.strictEqual(typeof key, "string");
      const msg = messages[key];
      assert(msg, `An invalid error message key was used: ${key}.`);
      let fmt;
      if (typeof msg === "function") {
        fmt = msg;
      } else {
        fmt = util.format;
        if (args === void 0 || args.length === 0) return msg;
        args.unshift(msg);
      }
      return String(fmt.apply(null, args));
    }
    exports.message = message;
    function E(sym, val) {
      messages[sym] = typeof val === "function" ? val : String(val);
    }
    exports.E = E;
    exports.Error = makeNodeError(g.Error);
    exports.TypeError = makeNodeError(g.TypeError);
    exports.RangeError = makeNodeError(g.RangeError);
    E("ERR_ARG_NOT_ITERABLE", "%s must be iterable");
    E("ERR_ASSERTION", "%s");
    E("ERR_BUFFER_OUT_OF_BOUNDS", bufferOutOfBounds);
    E("ERR_CHILD_CLOSED_BEFORE_REPLY", "Child closed before reply received");
    E(
      "ERR_CONSOLE_WRITABLE_STREAM",
      "Console expects a writable stream instance for %s",
    );
    E("ERR_CPU_USAGE", "Unable to obtain cpu usage %s");
    E(
      "ERR_DNS_SET_SERVERS_FAILED",
      (err, servers) => `c-ares failed to set servers: "${err}" [${servers}]`,
    );
    E("ERR_FALSY_VALUE_REJECTION", "Promise was rejected with falsy value");
    E(
      "ERR_ENCODING_NOT_SUPPORTED",
      (enc) => `The "${enc}" encoding is not supported`,
    );
    E(
      "ERR_ENCODING_INVALID_ENCODED_DATA",
      (enc) => `The encoded data was not valid for encoding ${enc}`,
    );
    E(
      "ERR_HTTP_HEADERS_SENT",
      "Cannot render headers after they are sent to the client",
    );
    E("ERR_HTTP_INVALID_STATUS_CODE", "Invalid status code: %s");
    E(
      "ERR_HTTP_TRAILER_INVALID",
      "Trailers are invalid with this transfer encoding",
    );
    E("ERR_INDEX_OUT_OF_RANGE", "Index out of range");
    E("ERR_INVALID_ARG_TYPE", invalidArgType);
    E("ERR_INVALID_ARRAY_LENGTH", (name, len, actual) => {
      assert.strictEqual(typeof actual, "number");
      return `The array "${name}" (length ${actual}) must be of length ${len}.`;
    });
    E("ERR_INVALID_BUFFER_SIZE", "Buffer size must be a multiple of %s");
    E("ERR_INVALID_CALLBACK", "Callback must be a function");
    E("ERR_INVALID_CHAR", "Invalid character in %s");
    E(
      "ERR_INVALID_CURSOR_POS",
      "Cannot set cursor row without setting its column",
    );
    E("ERR_INVALID_FD", '"fd" must be a positive integer: %s');
    E(
      "ERR_INVALID_FILE_URL_HOST",
      'File URL host must be "localhost" or empty on %s',
    );
    E("ERR_INVALID_FILE_URL_PATH", "File URL path %s");
    E("ERR_INVALID_HANDLE_TYPE", "This handle type cannot be sent");
    E("ERR_INVALID_IP_ADDRESS", "Invalid IP address: %s");
    E("ERR_INVALID_OPT_VALUE", (name, value) => {
      return `The value "${String(value)}" is invalid for option "${name}"`;
    });
    E(
      "ERR_INVALID_OPT_VALUE_ENCODING",
      (value) =>
        `The value "${String(value)}" is invalid for option "encoding"`,
    );
    E(
      "ERR_INVALID_REPL_EVAL_CONFIG",
      'Cannot specify both "breakEvalOnSigint" and "eval" for REPL',
    );
    E(
      "ERR_INVALID_SYNC_FORK_INPUT",
      "Asynchronous forks do not support Buffer, Uint8Array or string input: %s",
    );
    E("ERR_INVALID_THIS", 'Value of "this" must be of type %s');
    E("ERR_INVALID_TUPLE", "%s must be an iterable %s tuple");
    E("ERR_INVALID_URL", "Invalid URL: %s");
    E(
      "ERR_INVALID_URL_SCHEME",
      (expected) => `The URL must be ${oneOf(expected, "scheme")}`,
    );
    E("ERR_IPC_CHANNEL_CLOSED", "Channel closed");
    E("ERR_IPC_DISCONNECTED", "IPC channel is already disconnected");
    E("ERR_IPC_ONE_PIPE", "Child process can have only one IPC pipe");
    E("ERR_IPC_SYNC_FORK", "IPC cannot be used with synchronous forks");
    E("ERR_MISSING_ARGS", missingArgs);
    E("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
    E("ERR_NAPI_CONS_FUNCTION", "Constructor must be a function");
    E(
      "ERR_NAPI_CONS_PROTOTYPE_OBJECT",
      "Constructor.prototype must be an object",
    );
    E("ERR_NO_CRYPTO", "Node.js is not compiled with OpenSSL crypto support");
    E("ERR_NO_LONGER_SUPPORTED", "%s is no longer supported");
    E("ERR_PARSE_HISTORY_DATA", "Could not parse history data in %s");
    E("ERR_SOCKET_ALREADY_BOUND", "Socket is already bound");
    E("ERR_SOCKET_BAD_PORT", "Port should be > 0 and < 65536");
    E(
      "ERR_SOCKET_BAD_TYPE",
      "Bad socket type specified. Valid types are: udp4, udp6",
    );
    E("ERR_SOCKET_CANNOT_SEND", "Unable to send data");
    E("ERR_SOCKET_CLOSED", "Socket is closed");
    E("ERR_SOCKET_DGRAM_NOT_RUNNING", "Not running");
    E("ERR_STDERR_CLOSE", "process.stderr cannot be closed");
    E("ERR_STDOUT_CLOSE", "process.stdout cannot be closed");
    E("ERR_STREAM_WRAP", "Stream has StringDecoder set or is in objectMode");
    E(
      "ERR_TLS_CERT_ALTNAME_INVALID",
      "Hostname/IP does not match certificate's altnames: %s",
    );
    E(
      "ERR_TLS_DH_PARAM_SIZE",
      (size) => `DH parameter size ${size} is less than 2048`,
    );
    E("ERR_TLS_HANDSHAKE_TIMEOUT", "TLS handshake timeout");
    E("ERR_TLS_RENEGOTIATION_FAILED", "Failed to renegotiate");
    E(
      "ERR_TLS_REQUIRED_SERVER_NAME",
      '"servername" is required parameter for Server.addContext',
    );
    E("ERR_TLS_SESSION_ATTACK", "TSL session renegotiation attack detected");
    E(
      "ERR_TRANSFORM_ALREADY_TRANSFORMING",
      "Calling transform done when still transforming",
    );
    E(
      "ERR_TRANSFORM_WITH_LENGTH_0",
      "Calling transform done when writableState.length != 0",
    );
    E("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s");
    E("ERR_UNKNOWN_SIGNAL", "Unknown signal: %s");
    E("ERR_UNKNOWN_STDIN_TYPE", "Unknown stdin file type");
    E("ERR_UNKNOWN_STREAM_TYPE", "Unknown stream file type");
    E(
      "ERR_V8BREAKITERATOR",
      "Full ICU data not installed. See https://github.com/nodejs/node/wiki/Intl",
    );
    function invalidArgType(name, expected, actual) {
      assert(name, "name is required");
      let determiner;
      if (expected.includes("not ")) {
        determiner = "must not be";
        expected = expected.split("not ")[1];
      } else {
        determiner = "must be";
      }
      let msg;
      if (Array.isArray(name)) {
        const names = name.map((val) => `"${val}"`).join(", ");
        msg = `The ${names} arguments ${determiner} ${oneOf(expected, "type")}`;
      } else if (name.includes(" argument")) {
        msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
      } else {
        const type = name.includes(".") ? "property" : "argument";
        msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
      }
      if (arguments.length >= 3) {
        msg += `. Received type ${actual !== null ? typeof actual : "null"}`;
      }
      return msg;
    }
    function missingArgs(...args) {
      assert(args.length > 0, "At least one arg needs to be specified");
      let msg = "The ";
      const len = args.length;
      args = args.map((a) => `"${a}"`);
      switch (len) {
        case 1:
          msg += `${args[0]} argument`;
          break;
        case 2:
          msg += `${args[0]} and ${args[1]} arguments`;
          break;
        default:
          msg += args.slice(0, len - 1).join(", ");
          msg += `, and ${args[len - 1]} arguments`;
          break;
      }
      return `${msg} must be specified`;
    }
    function oneOf(expected, thing) {
      assert(expected, "expected is required");
      assert(typeof thing === "string", "thing is required");
      if (Array.isArray(expected)) {
        const len = expected.length;
        assert(len > 0, "At least one expected value needs to be specified");
        expected = expected.map((i) => String(i));
        if (len > 2) {
          return (
            `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` +
            expected[len - 1]
          );
        } else if (len === 2) {
          return `one of ${thing} ${expected[0]} or ${expected[1]}`;
        } else {
          return `of ${thing} ${expected[0]}`;
        }
      } else {
        return `of ${thing} ${String(expected)}`;
      }
    }
    function bufferOutOfBounds(name, isWriting) {
      if (isWriting) {
        return "Attempt to write outside buffer bounds";
      } else {
        return `"${name}" is outside of buffer bounds`;
      }
    }
  },
});

// node_modules/memfs/lib/encoding.js
var require_encoding = __commonJS({
  "node_modules/memfs/lib/encoding.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.strToEncoding =
      exports.assertEncoding =
      exports.ENCODING_UTF8 =
        void 0;
    var buffer_1 = require_buffer2();
    var errors = require_errors2();
    exports.ENCODING_UTF8 = "utf8";
    function assertEncoding(encoding) {
      if (encoding && !buffer_1.Buffer.isEncoding(encoding))
        throw new errors.TypeError("ERR_INVALID_OPT_VALUE_ENCODING", encoding);
    }
    exports.assertEncoding = assertEncoding;
    function strToEncoding(str, encoding) {
      if (!encoding || encoding === exports.ENCODING_UTF8) return str;
      if (encoding === "buffer") return new buffer_1.Buffer(str);
      return new buffer_1.Buffer(str).toString(encoding);
    }
    exports.strToEncoding = strToEncoding;
  },
});

// node_modules/memfs/lib/Dirent.js
var require_Dirent = __commonJS({
  "node_modules/memfs/lib/Dirent.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Dirent = void 0;
    var constants_1 = require_constants();
    var encoding_1 = require_encoding();
    var {
      S_IFMT,
      S_IFDIR,
      S_IFREG,
      S_IFBLK,
      S_IFCHR,
      S_IFLNK,
      S_IFIFO,
      S_IFSOCK,
    } = constants_1.constants;
    var Dirent = class _Dirent {
      constructor() {
        this.name = "";
        this.path = "";
        this.mode = 0;
      }
      static build(link, encoding) {
        const dirent = new _Dirent();
        const { mode } = link.getNode();
        dirent.name = (0, encoding_1.strToEncoding)(link.getName(), encoding);
        dirent.mode = mode;
        dirent.path = link.getPath();
        return dirent;
      }
      _checkModeProperty(property) {
        return (this.mode & S_IFMT) === property;
      }
      isDirectory() {
        return this._checkModeProperty(S_IFDIR);
      }
      isFile() {
        return this._checkModeProperty(S_IFREG);
      }
      isBlockDevice() {
        return this._checkModeProperty(S_IFBLK);
      }
      isCharacterDevice() {
        return this._checkModeProperty(S_IFCHR);
      }
      isSymbolicLink() {
        return this._checkModeProperty(S_IFLNK);
      }
      isFIFO() {
        return this._checkModeProperty(S_IFIFO);
      }
      isSocket() {
        return this._checkModeProperty(S_IFSOCK);
      }
    };
    exports.Dirent = Dirent;
    exports.default = Dirent;
  },
});

// node_modules/path/node_modules/util/support/isBufferBrowser.js
var require_isBufferBrowser2 = __commonJS({
  "node_modules/path/node_modules/util/support/isBufferBrowser.js"(
    exports,
    module,
  ) {
    module.exports = function isBuffer(arg) {
      return (
        arg &&
        typeof arg === "object" &&
        typeof arg.copy === "function" &&
        typeof arg.fill === "function" &&
        typeof arg.readUInt8 === "function"
      );
    };
  },
});

// node_modules/path/node_modules/inherits/inherits_browser.js
var require_inherits_browser2 = __commonJS({
  "node_modules/path/node_modules/inherits/inherits_browser.js"(
    exports,
    module,
  ) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true,
          },
        });
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      };
    }
  },
});

// node_modules/path/node_modules/util/util.js
var require_util2 = __commonJS({
  "node_modules/path/node_modules/util/util.js"(exports) {
    var formatRegExp = /%[sdj%]/g;
    exports.format = function (f) {
      if (!isString(f)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(inspect(arguments[i]));
        }
        return objects.join(" ");
      }
      var i = 1;
      var args = arguments;
      var len = args.length;
      var str = String(f).replace(formatRegExp, function (x2) {
        if (x2 === "%%") return "%";
        if (i >= len) return x2;
        switch (x2) {
          case "%s":
            return String(args[i++]);
          case "%d":
            return Number(args[i++]);
          case "%j":
            try {
              return JSON.stringify(args[i++]);
            } catch (_) {
              return "[Circular]";
            }
          default:
            return x2;
        }
      });
      for (var x = args[i]; i < len; x = args[++i]) {
        if (isNull(x) || !isObject(x)) {
          str += " " + x;
        } else {
          str += " " + inspect(x);
        }
      }
      return str;
    };
    exports.deprecate = function (fn, msg) {
      if (isUndefined(global.process)) {
        return function () {
          return exports.deprecate(fn, msg).apply(this, arguments);
        };
      }
      if (process.noDeprecation === true) {
        return fn;
      }
      var warned = false;
      function deprecated() {
        if (!warned) {
          if (process.throwDeprecation) {
            throw new Error(msg);
          } else if (process.traceDeprecation) {
            console.trace(msg);
          } else {
            console.error(msg);
          }
          warned = true;
        }
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
    var debugs = {};
    var debugEnviron;
    exports.debuglog = function (set) {
      if (isUndefined(debugEnviron))
        debugEnviron = process.env.NODE_DEBUG || "";
      set = set.toUpperCase();
      if (!debugs[set]) {
        if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
          var pid = process.pid;
          debugs[set] = function () {
            var msg = exports.format.apply(exports, arguments);
            console.error("%s %d: %s", set, pid, msg);
          };
        } else {
          debugs[set] = function () {};
        }
      }
      return debugs[set];
    };
    function inspect(obj, opts) {
      var ctx = {
        seen: [],
        stylize: stylizeNoColor,
      };
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean(opts)) {
        ctx.showHidden = opts;
      } else if (opts) {
        exports._extend(ctx, opts);
      }
      if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined(ctx.depth)) ctx.depth = 2;
      if (isUndefined(ctx.colors)) ctx.colors = false;
      if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }
    exports.inspect = inspect;
    inspect.colors = {
      bold: [1, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      white: [37, 39],
      grey: [90, 39],
      black: [30, 39],
      blue: [34, 39],
      cyan: [36, 39],
      green: [32, 39],
      magenta: [35, 39],
      red: [31, 39],
      yellow: [33, 39],
    };
    inspect.styles = {
      special: "cyan",
      number: "yellow",
      boolean: "yellow",
      undefined: "grey",
      null: "bold",
      string: "green",
      date: "magenta",
      // "name": intentionally not styling
      regexp: "red",
    };
    function stylizeWithColor(str, styleType) {
      var style = inspect.styles[styleType];
      if (style) {
        return (
          "\x1B[" +
          inspect.colors[style][0] +
          "m" +
          str +
          "\x1B[" +
          inspect.colors[style][1] +
          "m"
        );
      } else {
        return str;
      }
    }
    function stylizeNoColor(str, styleType) {
      return str;
    }
    function arrayToHash(array) {
      var hash = {};
      array.forEach(function (val, idx) {
        hash[val] = true;
      });
      return hash;
    }
    function formatValue(ctx, value, recurseTimes) {
      if (
        ctx.customInspect &&
        value &&
        isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)
      ) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);
      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }
      if (
        isError(value) &&
        (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)
      ) {
        return formatError(value);
      }
      if (keys.length === 0) {
        if (isFunction(value)) {
          var name = value.name ? ": " + value.name : "";
          return ctx.stylize("[Function" + name + "]", "special");
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), "date");
        }
        if (isError(value)) {
          return formatError(value);
        }
      }
      var base = "",
        array = false,
        braces = ["{", "}"];
      if (isArray(value)) {
        array = true;
        braces = ["[", "]"];
      }
      if (isFunction(value)) {
        var n = value.name ? ": " + value.name : "";
        base = " [Function" + n + "]";
      }
      if (isRegExp(value)) {
        base = " " + RegExp.prototype.toString.call(value);
      }
      if (isDate(value)) {
        base = " " + Date.prototype.toUTCString.call(value);
      }
      if (isError(value)) {
        base = " " + formatError(value);
      }
      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        } else {
          return ctx.stylize("[Object]", "special");
        }
      }
      ctx.seen.push(value);
      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function (key) {
          return formatProperty(
            ctx,
            value,
            recurseTimes,
            visibleKeys,
            key,
            array,
          );
        });
      }
      ctx.seen.pop();
      return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
      if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
      if (isString(value)) {
        var simple =
          "'" +
          JSON.stringify(value)
            .replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') +
          "'";
        return ctx.stylize(simple, "string");
      }
      if (isNumber(value)) return ctx.stylize("" + value, "number");
      if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
      if (isNull(value)) return ctx.stylize("null", "null");
    }
    function formatError(value) {
      return "[" + Error.prototype.toString.call(value) + "]";
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(
            formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              String(i),
              true,
            ),
          );
        } else {
          output.push("");
        }
      }
      keys.forEach(function (key) {
        if (!key.match(/^\d+$/)) {
          output.push(
            formatProperty(ctx, value, recurseTimes, visibleKeys, key, true),
          );
        }
      });
      return output;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key],
      };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize("[Getter/Setter]", "special");
        } else {
          str = ctx.stylize("[Getter]", "special");
        }
      } else {
        if (desc.set) {
          str = ctx.stylize("[Setter]", "special");
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = "[" + key + "]";
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf("\n") > -1) {
            if (array) {
              str = str
                .split("\n")
                .map(function (line) {
                  return "  " + line;
                })
                .join("\n")
                .substr(2);
            } else {
              str =
                "\n" +
                str
                  .split("\n")
                  .map(function (line) {
                    return "   " + line;
                  })
                  .join("\n");
            }
          }
        } else {
          str = ctx.stylize("[Circular]", "special");
        }
      }
      if (isUndefined(name)) {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify("" + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, "name");
        } else {
          name = name
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, "string");
        }
      }
      return name + ": " + str;
    }
    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function (prev, cur) {
        numLinesEst++;
        if (cur.indexOf("\n") >= 0) numLinesEst++;
        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
      }, 0);
      if (length > 60) {
        return (
          braces[0] +
          (base === "" ? "" : base + "\n ") +
          " " +
          output.join(",\n  ") +
          " " +
          braces[1]
        );
      }
      return braces[0] + base + " " + output.join(", ") + " " + braces[1];
    }
    function isArray(ar) {
      return Array.isArray(ar);
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return isObject(re) && objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return isObject(d) && objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    function isError(e) {
      return (
        isObject(e) &&
        (objectToString(e) === "[object Error]" || e instanceof Error)
      );
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return (
        arg === null ||
        typeof arg === "boolean" ||
        typeof arg === "number" ||
        typeof arg === "string" ||
        typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined"
      );
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = require_isBufferBrowser2();
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
    function pad(n) {
      return n < 10 ? "0" + n.toString(10) : n.toString(10);
    }
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    function timestamp() {
      var d = /* @__PURE__ */ new Date();
      var time = [
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds()),
      ].join(":");
      return [d.getDate(), months[d.getMonth()], time].join(" ");
    }
    exports.log = function () {
      console.log(
        "%s - %s",
        timestamp(),
        exports.format.apply(exports, arguments),
      );
    };
    exports.inherits = require_inherits_browser2();
    exports._extend = function (origin, add) {
      if (!add || !isObject(add)) return origin;
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    };
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  },
});

// node_modules/path/path.js
var require_path = __commonJS({
  "node_modules/path/path.js"(exports, module) {
    "use strict";
    var isWindows = process.platform === "win32";
    var util = require_util2();
    function normalizeArray(parts, allowAboveRoot) {
      var res = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!p || p === ".") continue;
        if (p === "..") {
          if (res.length && res[res.length - 1] !== "..") {
            res.pop();
          } else if (allowAboveRoot) {
            res.push("..");
          }
        } else {
          res.push(p);
        }
      }
      return res;
    }
    function trimArray(arr) {
      var lastIndex = arr.length - 1;
      var start = 0;
      for (; start <= lastIndex; start++) {
        if (arr[start]) break;
      }
      var end = lastIndex;
      for (; end >= 0; end--) {
        if (arr[end]) break;
      }
      if (start === 0 && end === lastIndex) return arr;
      if (start > end) return [];
      return arr.slice(start, end + 1);
    }
    var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var splitTailRe =
      /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;
    var win32 = {};
    function win32SplitPath(filename) {
      var result = splitDeviceRe.exec(filename),
        device = (result[1] || "") + (result[2] || ""),
        tail = result[3] || "";
      var result2 = splitTailRe.exec(tail),
        dir = result2[1],
        basename = result2[2],
        ext = result2[3];
      return [device, dir, basename, ext];
    }
    function win32StatPath(path) {
      var result = splitDeviceRe.exec(path),
        device = result[1] || "",
        isUnc = !!device && device[1] !== ":";
      return {
        device,
        isUnc,
        isAbsolute: isUnc || !!result[2],
        // UNC paths are always absolute
        tail: result[3],
      };
    }
    function normalizeUNCRoot(device) {
      return "\\\\" + device.replace(/^[\\\/]+/, "").replace(/[\\\/]+/g, "\\");
    }
    win32.resolve = function () {
      var resolvedDevice = "",
        resolvedTail = "",
        resolvedAbsolute = false;
      for (var i = arguments.length - 1; i >= -1; i--) {
        var path;
        if (i >= 0) {
          path = arguments[i];
        } else if (!resolvedDevice) {
          path = process.cwd();
        } else {
          path = process.env["=" + resolvedDevice];
          if (
            !path ||
            path.substr(0, 3).toLowerCase() !==
              resolvedDevice.toLowerCase() + "\\"
          ) {
            path = resolvedDevice + "\\";
          }
        }
        if (!util.isString(path)) {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          continue;
        }
        var result = win32StatPath(path),
          device = result.device,
          isUnc = result.isUnc,
          isAbsolute = result.isAbsolute,
          tail = result.tail;
        if (
          device &&
          resolvedDevice &&
          device.toLowerCase() !== resolvedDevice.toLowerCase()
        ) {
          continue;
        }
        if (!resolvedDevice) {
          resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
          resolvedTail = tail + "\\" + resolvedTail;
          resolvedAbsolute = isAbsolute;
        }
        if (resolvedDevice && resolvedAbsolute) {
          break;
        }
      }
      if (isUnc) {
        resolvedDevice = normalizeUNCRoot(resolvedDevice);
      }
      resolvedTail = normalizeArray(
        resolvedTail.split(/[\\\/]+/),
        !resolvedAbsolute,
      ).join("\\");
      return (
        resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || "."
      );
    };
    win32.normalize = function (path) {
      var result = win32StatPath(path),
        device = result.device,
        isUnc = result.isUnc,
        isAbsolute = result.isAbsolute,
        tail = result.tail,
        trailingSlash = /[\\\/]$/.test(tail);
      tail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join("\\");
      if (!tail && !isAbsolute) {
        tail = ".";
      }
      if (tail && trailingSlash) {
        tail += "\\";
      }
      if (isUnc) {
        device = normalizeUNCRoot(device);
      }
      return device + (isAbsolute ? "\\" : "") + tail;
    };
    win32.isAbsolute = function (path) {
      return win32StatPath(path).isAbsolute;
    };
    win32.join = function () {
      var paths = [];
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!util.isString(arg)) {
          throw new TypeError("Arguments to path.join must be strings");
        }
        if (arg) {
          paths.push(arg);
        }
      }
      var joined = paths.join("\\");
      if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
        joined = joined.replace(/^[\\\/]{2,}/, "\\");
      }
      return win32.normalize(joined);
    };
    win32.relative = function (from, to) {
      from = win32.resolve(from);
      to = win32.resolve(to);
      var lowerFrom = from.toLowerCase();
      var lowerTo = to.toLowerCase();
      var toParts = trimArray(to.split("\\"));
      var lowerFromParts = trimArray(lowerFrom.split("\\"));
      var lowerToParts = trimArray(lowerTo.split("\\"));
      var length = Math.min(lowerFromParts.length, lowerToParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (lowerFromParts[i] !== lowerToParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      if (samePartsLength == 0) {
        return to;
      }
      var outputParts = [];
      for (var i = samePartsLength; i < lowerFromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("\\");
    };
    win32._makeLong = function (path) {
      if (!util.isString(path)) return path;
      if (!path) {
        return "";
      }
      var resolvedPath = win32.resolve(path);
      if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
        return "\\\\?\\" + resolvedPath;
      } else if (/^\\\\[^?.]/.test(resolvedPath)) {
        return "\\\\?\\UNC\\" + resolvedPath.substring(2);
      }
      return path;
    };
    win32.dirname = function (path) {
      var result = win32SplitPath(path),
        root = result[0],
        dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    };
    win32.basename = function (path, ext) {
      var f = win32SplitPath(path)[2];
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
    };
    win32.extname = function (path) {
      return win32SplitPath(path)[3];
    };
    win32.format = function (pathObject) {
      if (!util.isObject(pathObject)) {
        throw new TypeError(
          "Parameter 'pathObject' must be an object, not " + typeof pathObject,
        );
      }
      var root = pathObject.root || "";
      if (!util.isString(root)) {
        throw new TypeError(
          "'pathObject.root' must be a string or undefined, not " +
            typeof pathObject.root,
        );
      }
      var dir = pathObject.dir;
      var base = pathObject.base || "";
      if (!dir) {
        return base;
      }
      if (dir[dir.length - 1] === win32.sep) {
        return dir + base;
      }
      return dir + win32.sep + base;
    };
    win32.parse = function (pathString) {
      if (!util.isString(pathString)) {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString,
        );
      }
      var allParts = win32SplitPath(pathString);
      if (!allParts || allParts.length !== 4) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[0],
        dir: allParts[0] + allParts[1].slice(0, -1),
        base: allParts[2],
        ext: allParts[3],
        name: allParts[2].slice(0, allParts[2].length - allParts[3].length),
      };
    };
    win32.sep = "\\";
    win32.delimiter = ";";
    var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    var posix = {};
    function posixSplitPath(filename) {
      return splitPathRe.exec(filename).slice(1);
    }
    posix.resolve = function () {
      var resolvedPath = "",
        resolvedAbsolute = false;
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? arguments[i] : process.cwd();
        if (!util.isString(path)) {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          continue;
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path[0] === "/";
      }
      resolvedPath = normalizeArray(
        resolvedPath.split("/"),
        !resolvedAbsolute,
      ).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    };
    posix.normalize = function (path) {
      var isAbsolute = posix.isAbsolute(path),
        trailingSlash = path && path[path.length - 1] === "/";
      path = normalizeArray(path.split("/"), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    };
    posix.isAbsolute = function (path) {
      return path.charAt(0) === "/";
    };
    posix.join = function () {
      var path = "";
      for (var i = 0; i < arguments.length; i++) {
        var segment = arguments[i];
        if (!util.isString(segment)) {
          throw new TypeError("Arguments to path.join must be strings");
        }
        if (segment) {
          if (!path) {
            path += segment;
          } else {
            path += "/" + segment;
          }
        }
      }
      return posix.normalize(path);
    };
    posix.relative = function (from, to) {
      from = posix.resolve(from).substr(1);
      to = posix.resolve(to).substr(1);
      var fromParts = trimArray(from.split("/"));
      var toParts = trimArray(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    };
    posix._makeLong = function (path) {
      return path;
    };
    posix.dirname = function (path) {
      var result = posixSplitPath(path),
        root = result[0],
        dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    };
    posix.basename = function (path, ext) {
      var f = posixSplitPath(path)[2];
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
    };
    posix.extname = function (path) {
      return posixSplitPath(path)[3];
    };
    posix.format = function (pathObject) {
      if (!util.isObject(pathObject)) {
        throw new TypeError(
          "Parameter 'pathObject' must be an object, not " + typeof pathObject,
        );
      }
      var root = pathObject.root || "";
      if (!util.isString(root)) {
        throw new TypeError(
          "'pathObject.root' must be a string or undefined, not " +
            typeof pathObject.root,
        );
      }
      var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
      var base = pathObject.base || "";
      return dir + base;
    };
    posix.parse = function (pathString) {
      if (!util.isString(pathString)) {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString,
        );
      }
      var allParts = posixSplitPath(pathString);
      if (!allParts || allParts.length !== 4) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      allParts[1] = allParts[1] || "";
      allParts[2] = allParts[2] || "";
      allParts[3] = allParts[3] || "";
      return {
        root: allParts[0],
        dir: allParts[0] + allParts[1].slice(0, -1),
        base: allParts[2],
        ext: allParts[3],
        name: allParts[2].slice(0, allParts[2].length - allParts[3].length),
      };
    };
    posix.sep = "/";
    posix.delimiter = ":";
    if (isWindows) module.exports = win32;
    else module.exports = posix;
    module.exports.posix = posix;
    module.exports.win32 = win32;
  },
});

// node_modules/process/browser.js
var require_browser = __commonJS({
  "node_modules/process/browser.js"(exports, module) {
    var process2 = (module.exports = {});
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function () {
      try {
        if (typeof setTimeout === "function") {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === "function") {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
      }
      if (
        (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
        setTimeout
      ) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e2) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
      }
      if (
        (cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) &&
        clearTimeout
      ) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e2) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }
    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process2.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process2.title = "browser";
    process2.browser = true;
    process2.env = {};
    process2.argv = [];
    process2.version = "";
    process2.versions = {};
    function noop() {}
    process2.on = noop;
    process2.addListener = noop;
    process2.once = noop;
    process2.off = noop;
    process2.removeListener = noop;
    process2.removeAllListeners = noop;
    process2.emit = noop;
    process2.prependListener = noop;
    process2.prependOnceListener = noop;
    process2.listeners = function (name) {
      return [];
    };
    process2.binding = function (name) {
      throw new Error("process.binding is not supported");
    };
    process2.cwd = function () {
      return "/";
    };
    process2.chdir = function (dir) {
      throw new Error("process.chdir is not supported");
    };
    process2.umask = function () {
      return 0;
    };
  },
});

// node_modules/memfs/lib/process.js
var require_process = __commonJS({
  "node_modules/memfs/lib/process.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createProcess = void 0;
    var maybeReturnProcess = () => {
      if (typeof process !== "undefined") {
        return process;
      }
      try {
        return require_browser();
      } catch (_a) {
        return void 0;
      }
    };
    function createProcess() {
      const p = maybeReturnProcess() || {};
      if (!p.cwd) p.cwd = () => "/";
      if (!p.emitWarning)
        p.emitWarning = (message, type) => {
          console.warn(`${type}${type ? ": " : ""}${message}`);
        };
      if (!p.env) p.env = {};
      return p;
    }
    exports.createProcess = createProcess;
    exports.default = createProcess();
  },
});

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module) {
    "use strict";
    var R = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply =
      R && typeof R.apply === "function"
        ? R.apply
        : function ReflectApply2(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args);
          };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === "function") {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(
          Object.getOwnPropertySymbols(target),
        );
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }
    var NumberIsNaN =
      Number.isNaN ||
      function NumberIsNaN2(value) {
        return value !== value;
      };
    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    module.exports = EventEmitter;
    module.exports.once = once;
    EventEmitter.EventEmitter = EventEmitter;
    EventEmitter.prototype._events = void 0;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError(
          'The "listener" argument must be of type Function. Received type ' +
            typeof listener,
        );
      }
    }
    Object.defineProperty(EventEmitter, "defaultMaxListeners", {
      enumerable: true,
      get: function () {
        return defaultMaxListeners;
      },
      set: function (arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError(
            'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
              arg +
              ".",
          );
        }
        defaultMaxListeners = arg;
      },
    });
    EventEmitter.init = function () {
      if (
        this._events === void 0 ||
        this._events === Object.getPrototypeOf(this)._events
      ) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
        throw new RangeError(
          'The value of "n" is out of range. It must be a non-negative number. Received ' +
            n +
            ".",
        );
      }
      this._maxListeners = n;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0) doError = doError && events.error === void 0;
      else if (!doError) return false;
      if (doError) {
        var er;
        if (args.length > 0) er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error(
          "Unhandled error." + (er ? " (" + er.message + ")" : ""),
        );
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0) return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener,
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend
            ? [listener, existing]
            : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          var w = new Error(
            "Possible EventEmitter memory leak detected. " +
              existing.length +
              " " +
              String(type) +
              " listeners added. Use emitter.setMaxListeners() to increase limit",
          );
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }
      return target;
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.prependListener = function prependListener(
      type,
      listener,
    ) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0) return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.prependOnceListener = function prependOnceListener(
      type,
      listener,
    ) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.removeListener = function removeListener(
      type,
      listener,
    ) {
      var list, events, position, i, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0) return this;
      list = events[type];
      if (list === void 0) return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }
        if (position < 0) return this;
        if (position === 0) list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1) events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(
      type,
    ) {
      var listeners, events, i;
      events = this._events;
      if (events === void 0) return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0) return [];
      var evlistener = events[type];
      if (evlistener === void 0) return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap
        ? unwrapListeners(evlistener)
        : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter.listenerCount = function (emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i) copy[i] = arr[i];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++) list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function (resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError(
          'The "emitter" argument must be of type EventEmitter. Received type ' +
            typeof emitter,
        );
      }
    }
  },
});

// node_modules/memfs/lib/node.js
var require_node = __commonJS({
  "node_modules/memfs/lib/node.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.File = exports.Link = exports.Node = exports.SEP = void 0;
    var process_1 = require_process();
    var buffer_1 = require_buffer2();
    var constants_1 = require_constants();
    var events_1 = require_events();
    var Stats_1 = require_Stats();
    var { S_IFMT, S_IFDIR, S_IFREG, S_IFLNK, O_APPEND } = constants_1.constants;
    var getuid = () => {
      var _a, _b;
      return (_b =
        (_a = process_1.default.getuid) === null || _a === void 0
          ? void 0
          : _a.call(process_1.default)) !== null && _b !== void 0
        ? _b
        : 0;
    };
    var getgid = () => {
      var _a, _b;
      return (_b =
        (_a = process_1.default.getgid) === null || _a === void 0
          ? void 0
          : _a.call(process_1.default)) !== null && _b !== void 0
        ? _b
        : 0;
    };
    exports.SEP = "/";
    var Node = class extends events_1.EventEmitter {
      constructor(ino, perm = 438) {
        super();
        this._uid = getuid();
        this._gid = getgid();
        this._atime = /* @__PURE__ */ new Date();
        this._mtime = /* @__PURE__ */ new Date();
        this._ctime = /* @__PURE__ */ new Date();
        this._perm = 438;
        this.mode = S_IFREG;
        this._nlink = 1;
        this._perm = perm;
        this.mode |= perm;
        this.ino = ino;
      }
      set ctime(ctime) {
        this._ctime = ctime;
      }
      get ctime() {
        return this._ctime;
      }
      set uid(uid) {
        this._uid = uid;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get uid() {
        return this._uid;
      }
      set gid(gid) {
        this._gid = gid;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get gid() {
        return this._gid;
      }
      set atime(atime) {
        this._atime = atime;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get atime() {
        return this._atime;
      }
      set mtime(mtime) {
        this._mtime = mtime;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get mtime() {
        return this._mtime;
      }
      set perm(perm) {
        this._perm = perm;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get perm() {
        return this._perm;
      }
      set nlink(nlink) {
        this._nlink = nlink;
        this.ctime = /* @__PURE__ */ new Date();
      }
      get nlink() {
        return this._nlink;
      }
      getString(encoding = "utf8") {
        this.atime = /* @__PURE__ */ new Date();
        return this.getBuffer().toString(encoding);
      }
      setString(str) {
        this.buf = (0, buffer_1.bufferFrom)(str, "utf8");
        this.touch();
      }
      getBuffer() {
        this.atime = /* @__PURE__ */ new Date();
        if (!this.buf) this.setBuffer((0, buffer_1.bufferAllocUnsafe)(0));
        return (0, buffer_1.bufferFrom)(this.buf);
      }
      setBuffer(buf) {
        this.buf = (0, buffer_1.bufferFrom)(buf);
        this.touch();
      }
      getSize() {
        return this.buf ? this.buf.length : 0;
      }
      setModeProperty(property) {
        this.mode = (this.mode & ~S_IFMT) | property;
      }
      setIsFile() {
        this.setModeProperty(S_IFREG);
      }
      setIsDirectory() {
        this.setModeProperty(S_IFDIR);
      }
      setIsSymlink() {
        this.setModeProperty(S_IFLNK);
      }
      isFile() {
        return (this.mode & S_IFMT) === S_IFREG;
      }
      isDirectory() {
        return (this.mode & S_IFMT) === S_IFDIR;
      }
      isSymlink() {
        return (this.mode & S_IFMT) === S_IFLNK;
      }
      makeSymlink(steps) {
        this.symlink = steps;
        this.setIsSymlink();
      }
      write(buf, off = 0, len = buf.length, pos = 0) {
        if (!this.buf) this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        if (pos + len > this.buf.length) {
          const newBuf = (0, buffer_1.bufferAllocUnsafe)(pos + len);
          this.buf.copy(newBuf, 0, 0, this.buf.length);
          this.buf = newBuf;
        }
        buf.copy(this.buf, pos, off, off + len);
        this.touch();
        return len;
      }
      // Returns the number of bytes read.
      read(buf, off = 0, len = buf.byteLength, pos = 0) {
        this.atime = /* @__PURE__ */ new Date();
        if (!this.buf) this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        let actualLen = len;
        if (actualLen > buf.byteLength) {
          actualLen = buf.byteLength;
        }
        if (actualLen + pos > this.buf.length) {
          actualLen = this.buf.length - pos;
        }
        const buf2 =
          buf instanceof buffer_1.Buffer
            ? buf
            : buffer_1.Buffer.from(buf.buffer);
        this.buf.copy(buf2, off, pos, pos + actualLen);
        return actualLen;
      }
      truncate(len = 0) {
        if (!len) this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        else {
          if (!this.buf) this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
          if (len <= this.buf.length) {
            this.buf = this.buf.slice(0, len);
          } else {
            const buf = (0, buffer_1.bufferAllocUnsafe)(len);
            this.buf.copy(buf);
            buf.fill(0, this.buf.length);
            this.buf = buf;
          }
        }
        this.touch();
      }
      chmod(perm) {
        this.perm = perm;
        this.mode = (this.mode & ~511) | perm;
        this.touch();
      }
      chown(uid, gid) {
        this.uid = uid;
        this.gid = gid;
        this.touch();
      }
      touch() {
        this.mtime = /* @__PURE__ */ new Date();
        this.emit("change", this);
      }
      canRead(uid = getuid(), gid = getgid()) {
        if (this.perm & 4) {
          return true;
        }
        if (gid === this.gid) {
          if (this.perm & 32) {
            return true;
          }
        }
        if (uid === this.uid) {
          if (this.perm & 256) {
            return true;
          }
        }
        return false;
      }
      canWrite(uid = getuid(), gid = getgid()) {
        if (this.perm & 2) {
          return true;
        }
        if (gid === this.gid) {
          if (this.perm & 16) {
            return true;
          }
        }
        if (uid === this.uid) {
          if (this.perm & 128) {
            return true;
          }
        }
        return false;
      }
      del() {
        this.emit("delete", this);
      }
      toJSON() {
        return {
          ino: this.ino,
          uid: this.uid,
          gid: this.gid,
          atime: this.atime.getTime(),
          mtime: this.mtime.getTime(),
          ctime: this.ctime.getTime(),
          perm: this.perm,
          mode: this.mode,
          nlink: this.nlink,
          symlink: this.symlink,
          data: this.getString(),
        };
      }
    };
    exports.Node = Node;
    var Link = class _Link extends events_1.EventEmitter {
      get steps() {
        return this._steps;
      }
      // Recursively sync children steps, e.g. in case of dir rename
      set steps(val) {
        this._steps = val;
        for (const [child, link] of this.children.entries()) {
          if (child === "." || child === "..") {
            continue;
          }
          link === null || link === void 0 ? void 0 : link.syncSteps();
        }
      }
      constructor(vol, parent, name) {
        super();
        this.children = /* @__PURE__ */ new Map();
        this._steps = [];
        this.ino = 0;
        this.length = 0;
        this.vol = vol;
        this.parent = parent;
        this.name = name;
        this.syncSteps();
      }
      setNode(node) {
        this.node = node;
        this.ino = node.ino;
      }
      getNode() {
        return this.node;
      }
      createChild(name, node = this.vol.createNode()) {
        const link = new _Link(this.vol, this, name);
        link.setNode(node);
        if (node.isDirectory()) {
          link.children.set(".", link);
          link.getNode().nlink++;
        }
        this.setChild(name, link);
        return link;
      }
      setChild(name, link = new _Link(this.vol, this, name)) {
        this.children.set(name, link);
        link.parent = this;
        this.length++;
        const node = link.getNode();
        if (node.isDirectory()) {
          link.children.set("..", this);
          this.getNode().nlink++;
        }
        this.getNode().mtime = /* @__PURE__ */ new Date();
        this.emit("child:add", link, this);
        return link;
      }
      deleteChild(link) {
        const node = link.getNode();
        if (node.isDirectory()) {
          link.children.delete("..");
          this.getNode().nlink--;
        }
        this.children.delete(link.getName());
        this.length--;
        this.getNode().mtime = /* @__PURE__ */ new Date();
        this.emit("child:delete", link, this);
      }
      getChild(name) {
        this.getNode().mtime = /* @__PURE__ */ new Date();
        return this.children.get(name);
      }
      getPath() {
        return this.steps.join(exports.SEP);
      }
      getName() {
        return this.steps[this.steps.length - 1];
      }
      // del() {
      //     const parent = this.parent;
      //     if(parent) {
      //         parent.deleteChild(link);
      //     }
      //     this.parent = null;
      //     this.vol = null;
      // }
      /**
       * Walk the tree path and return the `Link` at that location, if any.
       * @param steps {string[]} Desired location.
       * @param stop {number} Max steps to go into.
       * @param i {number} Current step in the `steps` array.
       *
       * @return {Link|null}
       */
      walk(steps, stop = steps.length, i = 0) {
        if (i >= steps.length) return this;
        if (i >= stop) return this;
        const step = steps[i];
        const link = this.getChild(step);
        if (!link) return null;
        return link.walk(steps, stop, i + 1);
      }
      toJSON() {
        return {
          steps: this.steps,
          ino: this.ino,
          children: Array.from(this.children.keys()),
        };
      }
      syncSteps() {
        this.steps = this.parent
          ? this.parent.steps.concat([this.name])
          : [this.name];
      }
    };
    exports.Link = Link;
    var File = class {
      /**
       * Open a Link-Node pair. `node` is provided separately as that might be a different node
       * rather the one `link` points to, because it might be a symlink.
       * @param link
       * @param node
       * @param flags
       * @param fd
       */
      constructor(link, node, flags, fd) {
        this.link = link;
        this.node = node;
        this.flags = flags;
        this.fd = fd;
        this.position = 0;
        if (this.flags & O_APPEND) this.position = this.getSize();
      }
      getString(encoding = "utf8") {
        return this.node.getString();
      }
      setString(str) {
        this.node.setString(str);
      }
      getBuffer() {
        return this.node.getBuffer();
      }
      setBuffer(buf) {
        this.node.setBuffer(buf);
      }
      getSize() {
        return this.node.getSize();
      }
      truncate(len) {
        this.node.truncate(len);
      }
      seekTo(position) {
        this.position = position;
      }
      stats() {
        return Stats_1.default.build(this.node);
      }
      write(buf, offset = 0, length = buf.length, position) {
        if (typeof position !== "number") position = this.position;
        const bytes = this.node.write(buf, offset, length, position);
        this.position = position + bytes;
        return bytes;
      }
      read(buf, offset = 0, length = buf.byteLength, position) {
        if (typeof position !== "number") position = this.position;
        const bytes = this.node.read(buf, offset, length, position);
        this.position = position + bytes;
        return bytes;
      }
      chmod(perm) {
        this.node.chmod(perm);
      }
      chown(uid, gid) {
        this.node.chown(uid, gid);
      }
    };
    exports.File = File;
  },
});

// node_modules/memfs/lib/setImmediate.js
var require_setImmediate = __commonJS({
  "node_modules/memfs/lib/setImmediate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _setImmediate;
    if (typeof setImmediate === "function")
      _setImmediate = setImmediate.bind(
        typeof globalThis !== "undefined" ? globalThis : global,
      );
    else
      _setImmediate = setTimeout.bind(
        typeof globalThis !== "undefined" ? globalThis : global,
      );
    exports.default = _setImmediate;
  },
});

// node_modules/memfs/lib/queueMicrotask.js
var require_queueMicrotask = __commonJS({
  "node_modules/memfs/lib/queueMicrotask.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default =
      typeof queueMicrotask === "function"
        ? queueMicrotask
        : (cb) =>
            Promise.resolve()
              .then(() => cb())
              .catch(() => {});
  },
});

// node_modules/memfs/lib/setTimeoutUnref.js
var require_setTimeoutUnref = __commonJS({
  "node_modules/memfs/lib/setTimeoutUnref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function setTimeoutUnref(callback, time, args) {
      const ref = setTimeout.apply(
        typeof globalThis !== "undefined" ? globalThis : global,
        arguments,
      );
      if (ref && typeof ref === "object" && typeof ref.unref === "function")
        ref.unref();
      return ref;
    }
    exports.default = setTimeoutUnref;
  },
});

// node_modules/emitter-component/index.js
var require_emitter_component = __commonJS({
  "node_modules/emitter-component/index.js"(exports, module) {
    module.exports = Emitter;
    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }
    Emitter.prototype.on = Emitter.prototype.addEventListener = function (
      event,
      fn,
    ) {
      this._callbacks = this._callbacks || {};
      (this._callbacks[event] = this._callbacks[event] || []).push(fn);
      return this;
    };
    Emitter.prototype.once = function (event, fn) {
      var self = this;
      this._callbacks = this._callbacks || {};
      function on() {
        self.off(event, on);
        fn.apply(this, arguments);
      }
      on.fn = fn;
      this.on(event, on);
      return this;
    };
    Emitter.prototype.off =
      Emitter.prototype.removeListener =
      Emitter.prototype.removeAllListeners =
      Emitter.prototype.removeEventListener =
        function (event, fn) {
          this._callbacks = this._callbacks || {};
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }
          var callbacks = this._callbacks[event];
          if (!callbacks) return this;
          if (1 == arguments.length) {
            delete this._callbacks[event];
            return this;
          }
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          return this;
        };
    Emitter.prototype.emit = function (event) {
      this._callbacks = this._callbacks || {};
      var args = [].slice.call(arguments, 1),
        callbacks = this._callbacks[event];
      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }
      return this;
    };
    Emitter.prototype.listeners = function (event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks[event] || [];
    };
    Emitter.prototype.hasListeners = function (event) {
      return !!this.listeners(event).length;
    };
  },
});

// node_modules/stream/index.js
var require_stream = __commonJS({
  "node_modules/stream/index.js"(exports, module) {
    var Emitter = require_emitter_component();
    function Stream() {
      Emitter.call(this);
    }
    Stream.prototype = new Emitter();
    module.exports = Stream;
    Stream.Stream = Stream;
    Stream.prototype.pipe = function (dest, options) {
      var source = this;
      function ondata(chunk) {
        if (dest.writable) {
          if (false === dest.write(chunk) && source.pause) {
            source.pause();
          }
        }
      }
      source.on("data", ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on("drain", ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on("end", onend);
        source.on("close", onclose);
      }
      var didOnEnd = false;
      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === "function") dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (!this.hasListeners("error")) {
          throw er;
        }
      }
      source.on("error", onerror);
      dest.on("error", onerror);
      function cleanup() {
        source.off("data", ondata);
        dest.off("drain", ondrain);
        source.off("end", onend);
        source.off("close", onclose);
        source.off("error", onerror);
        dest.off("error", onerror);
        source.off("end", cleanup);
        source.off("close", cleanup);
        dest.off("end", cleanup);
        dest.off("close", cleanup);
      }
      source.on("end", cleanup);
      source.on("close", cleanup);
      dest.on("end", cleanup);
      dest.on("close", cleanup);
      dest.emit("pipe", source);
      return dest;
    };
  },
});

// node_modules/memfs/lib/node/constants.js
var require_constants2 = __commonJS({
  "node_modules/memfs/lib/node/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FLAGS = exports.ERRSTR = void 0;
    var constants_1 = require_constants();
    exports.ERRSTR = {
      PATH_STR: "path must be a string or Buffer",
      // FD:             'file descriptor must be a unsigned 32-bit integer',
      FD: "fd must be a file descriptor",
      MODE_INT: "mode must be an int",
      CB: "callback must be a function",
      UID: "uid must be an unsigned int",
      GID: "gid must be an unsigned int",
      LEN: "len must be an integer",
      ATIME: "atime must be an integer",
      MTIME: "mtime must be an integer",
      PREFIX: "filename prefix is required",
      BUFFER: "buffer must be an instance of Buffer or StaticBuffer",
      OFFSET: "offset must be an integer",
      LENGTH: "length must be an integer",
      POSITION: "position must be an integer",
    };
    var {
      O_RDONLY,
      O_WRONLY,
      O_RDWR,
      O_CREAT,
      O_EXCL,
      O_TRUNC,
      O_APPEND,
      O_SYNC,
    } = constants_1.constants;
    var FLAGS;
    (function (FLAGS2) {
      FLAGS2[(FLAGS2["r"] = O_RDONLY)] = "r";
      FLAGS2[(FLAGS2["r+"] = O_RDWR)] = "r+";
      FLAGS2[(FLAGS2["rs"] = O_RDONLY | O_SYNC)] = "rs";
      FLAGS2[(FLAGS2["sr"] = FLAGS2.rs)] = "sr";
      FLAGS2[(FLAGS2["rs+"] = O_RDWR | O_SYNC)] = "rs+";
      FLAGS2[(FLAGS2["sr+"] = FLAGS2["rs+"])] = "sr+";
      FLAGS2[(FLAGS2["w"] = O_WRONLY | O_CREAT | O_TRUNC)] = "w";
      FLAGS2[(FLAGS2["wx"] = O_WRONLY | O_CREAT | O_TRUNC | O_EXCL)] = "wx";
      FLAGS2[(FLAGS2["xw"] = FLAGS2.wx)] = "xw";
      FLAGS2[(FLAGS2["w+"] = O_RDWR | O_CREAT | O_TRUNC)] = "w+";
      FLAGS2[(FLAGS2["wx+"] = O_RDWR | O_CREAT | O_TRUNC | O_EXCL)] = "wx+";
      FLAGS2[(FLAGS2["xw+"] = FLAGS2["wx+"])] = "xw+";
      FLAGS2[(FLAGS2["a"] = O_WRONLY | O_APPEND | O_CREAT)] = "a";
      FLAGS2[(FLAGS2["ax"] = O_WRONLY | O_APPEND | O_CREAT | O_EXCL)] = "ax";
      FLAGS2[(FLAGS2["xa"] = FLAGS2.ax)] = "xa";
      FLAGS2[(FLAGS2["a+"] = O_RDWR | O_APPEND | O_CREAT)] = "a+";
      FLAGS2[(FLAGS2["ax+"] = O_RDWR | O_APPEND | O_CREAT | O_EXCL)] = "ax+";
      FLAGS2[(FLAGS2["xa+"] = FLAGS2["ax+"])] = "xa+";
    })(FLAGS || (exports.FLAGS = FLAGS = {}));
  },
});

// node_modules/memfs/lib/node/util.js
var require_util3 = __commonJS({
  "node_modules/memfs/lib/node/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unixify =
      exports.bufferToEncoding =
      exports.getWriteSyncArgs =
      exports.getWriteArgs =
      exports.bufToUint8 =
      exports.dataToBuffer =
      exports.validateFd =
      exports.isFd =
      exports.flagsToNumber =
      exports.genRndStr6 =
      exports.createError =
      exports.pathToFilename =
      exports.nullCheck =
      exports.modeToNumber =
      exports.validateCallback =
      exports.promisify =
      exports.isWin =
        void 0;
    var constants_1 = require_constants2();
    var errors = require_errors2();
    var buffer_1 = require_buffer2();
    var encoding_1 = require_encoding();
    var buffer_2 = require_buffer2();
    var queueMicrotask_1 = require_queueMicrotask();
    exports.isWin = process.platform === "win32";
    function promisify(fs, fn, getResult = (input) => input) {
      return (...args) =>
        new Promise((resolve, reject) => {
          fs[fn].bind(fs)(...args, (error, result) => {
            if (error) return reject(error);
            return resolve(getResult(result));
          });
        });
    }
    exports.promisify = promisify;
    function validateCallback(callback) {
      if (typeof callback !== "function")
        throw TypeError(constants_1.ERRSTR.CB);
      return callback;
    }
    exports.validateCallback = validateCallback;
    function _modeToNumber(mode, def) {
      if (typeof mode === "number") return mode;
      if (typeof mode === "string") return parseInt(mode, 8);
      if (def) return modeToNumber(def);
      return void 0;
    }
    function modeToNumber(mode, def) {
      const result = _modeToNumber(mode, def);
      if (typeof result !== "number" || isNaN(result))
        throw new TypeError(constants_1.ERRSTR.MODE_INT);
      return result;
    }
    exports.modeToNumber = modeToNumber;
    function nullCheck(path, callback) {
      if (("" + path).indexOf("\0") !== -1) {
        const er = new Error("Path must be a string without null bytes");
        er.code = "ENOENT";
        if (typeof callback !== "function") throw er;
        (0, queueMicrotask_1.default)(() => {
          callback(er);
        });
        return false;
      }
      return true;
    }
    exports.nullCheck = nullCheck;
    function getPathFromURLPosix(url) {
      if (url.hostname !== "") {
        throw new errors.TypeError(
          "ERR_INVALID_FILE_URL_HOST",
          process.platform,
        );
      }
      const pathname = url.pathname;
      for (let n = 0; n < pathname.length; n++) {
        if (pathname[n] === "%") {
          const third = pathname.codePointAt(n + 2) | 32;
          if (pathname[n + 1] === "2" && third === 102) {
            throw new errors.TypeError(
              "ERR_INVALID_FILE_URL_PATH",
              "must not include encoded / characters",
            );
          }
        }
      }
      return decodeURIComponent(pathname);
    }
    function pathToFilename(path) {
      if (typeof path !== "string" && !buffer_1.Buffer.isBuffer(path)) {
        try {
          if (!(path instanceof __require("url").URL))
            throw new TypeError(constants_1.ERRSTR.PATH_STR);
        } catch (err) {
          throw new TypeError(constants_1.ERRSTR.PATH_STR);
        }
        path = getPathFromURLPosix(path);
      }
      const pathString = String(path);
      nullCheck(pathString);
      return pathString;
    }
    exports.pathToFilename = pathToFilename;
    var ENOENT = "ENOENT";
    var EBADF = "EBADF";
    var EINVAL = "EINVAL";
    var EPERM = "EPERM";
    var EPROTO = "EPROTO";
    var EEXIST = "EEXIST";
    var ENOTDIR = "ENOTDIR";
    var EMFILE = "EMFILE";
    var EACCES = "EACCES";
    var EISDIR = "EISDIR";
    var ENOTEMPTY = "ENOTEMPTY";
    var ENOSYS = "ENOSYS";
    var ERR_FS_EISDIR = "ERR_FS_EISDIR";
    var ERR_OUT_OF_RANGE = "ERR_OUT_OF_RANGE";
    function formatError(errorCode, func = "", path = "", path2 = "") {
      let pathFormatted = "";
      if (path) pathFormatted = ` '${path}'`;
      if (path2) pathFormatted += ` -> '${path2}'`;
      switch (errorCode) {
        case ENOENT:
          return `ENOENT: no such file or directory, ${func}${pathFormatted}`;
        case EBADF:
          return `EBADF: bad file descriptor, ${func}${pathFormatted}`;
        case EINVAL:
          return `EINVAL: invalid argument, ${func}${pathFormatted}`;
        case EPERM:
          return `EPERM: operation not permitted, ${func}${pathFormatted}`;
        case EPROTO:
          return `EPROTO: protocol error, ${func}${pathFormatted}`;
        case EEXIST:
          return `EEXIST: file already exists, ${func}${pathFormatted}`;
        case ENOTDIR:
          return `ENOTDIR: not a directory, ${func}${pathFormatted}`;
        case EISDIR:
          return `EISDIR: illegal operation on a directory, ${func}${pathFormatted}`;
        case EACCES:
          return `EACCES: permission denied, ${func}${pathFormatted}`;
        case ENOTEMPTY:
          return `ENOTEMPTY: directory not empty, ${func}${pathFormatted}`;
        case EMFILE:
          return `EMFILE: too many open files, ${func}${pathFormatted}`;
        case ENOSYS:
          return `ENOSYS: function not implemented, ${func}${pathFormatted}`;
        case ERR_FS_EISDIR:
          return `[ERR_FS_EISDIR]: Path is a directory: ${func} returned EISDIR (is a directory) ${path}`;
        case ERR_OUT_OF_RANGE:
          return `[ERR_OUT_OF_RANGE]: value out of range, ${func}${pathFormatted}`;
        default:
          return `${errorCode}: error occurred, ${func}${pathFormatted}`;
      }
    }
    function createError(
      errorCode,
      func = "",
      path = "",
      path2 = "",
      Constructor = Error,
    ) {
      const error = new Constructor(formatError(errorCode, func, path, path2));
      error.code = errorCode;
      if (path) {
        error.path = path;
      }
      return error;
    }
    exports.createError = createError;
    function genRndStr6() {
      const str = (Math.random() + 1).toString(36).substring(2, 8);
      if (str.length === 6) return str;
      else return genRndStr6();
    }
    exports.genRndStr6 = genRndStr6;
    function flagsToNumber(flags) {
      if (typeof flags === "number") return flags;
      if (typeof flags === "string") {
        const flagsNum = constants_1.FLAGS[flags];
        if (typeof flagsNum !== "undefined") return flagsNum;
      }
      throw new errors.TypeError("ERR_INVALID_OPT_VALUE", "flags", flags);
    }
    exports.flagsToNumber = flagsToNumber;
    function isFd(path) {
      return path >>> 0 === path;
    }
    exports.isFd = isFd;
    function validateFd(fd) {
      if (!isFd(fd)) throw TypeError(constants_1.ERRSTR.FD);
    }
    exports.validateFd = validateFd;
    function dataToBuffer(data, encoding = encoding_1.ENCODING_UTF8) {
      if (buffer_1.Buffer.isBuffer(data)) return data;
      else if (data instanceof Uint8Array)
        return (0, buffer_2.bufferFrom)(data);
      else return (0, buffer_2.bufferFrom)(String(data), encoding);
    }
    exports.dataToBuffer = dataToBuffer;
    var bufToUint8 = (buf) =>
      new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    exports.bufToUint8 = bufToUint8;
    var getWriteArgs = (fd, a, b, c, d, e) => {
      validateFd(fd);
      let offset = 0;
      let length;
      let position = null;
      let encoding;
      let callback;
      const tipa = typeof a;
      const tipb = typeof b;
      const tipc = typeof c;
      const tipd = typeof d;
      if (tipa !== "string") {
        if (tipb === "function") {
          callback = b;
        } else if (tipc === "function") {
          offset = b | 0;
          callback = c;
        } else if (tipd === "function") {
          offset = b | 0;
          length = c;
          callback = d;
        } else {
          offset = b | 0;
          length = c;
          position = d;
          callback = e;
        }
      } else {
        if (tipb === "function") {
          callback = b;
        } else if (tipc === "function") {
          position = b;
          callback = c;
        } else if (tipd === "function") {
          position = b;
          encoding = c;
          callback = d;
        }
      }
      const buf = dataToBuffer(a, encoding);
      if (tipa !== "string") {
        if (typeof length === "undefined") length = buf.length;
      } else {
        offset = 0;
        length = buf.length;
      }
      const cb = validateCallback(callback);
      return [fd, tipa === "string", buf, offset, length, position, cb];
    };
    exports.getWriteArgs = getWriteArgs;
    var getWriteSyncArgs = (fd, a, b, c, d) => {
      validateFd(fd);
      let encoding;
      let offset;
      let length;
      let position;
      const isBuffer = typeof a !== "string";
      if (isBuffer) {
        offset = (b || 0) | 0;
        length = c;
        position = d;
      } else {
        position = b;
        encoding = c;
      }
      const buf = dataToBuffer(a, encoding);
      if (isBuffer) {
        if (typeof length === "undefined") {
          length = buf.length;
        }
      } else {
        offset = 0;
        length = buf.length;
      }
      return [fd, buf, offset || 0, length, position];
    };
    exports.getWriteSyncArgs = getWriteSyncArgs;
    function bufferToEncoding(buffer, encoding) {
      if (!encoding || encoding === "buffer") return buffer;
      else return buffer.toString(encoding);
    }
    exports.bufferToEncoding = bufferToEncoding;
    var isSeparator = (str, i) => {
      const char = str[i];
      return i > 0 && (char === "/" || (exports.isWin && char === "\\"));
    };
    var removeTrailingSeparator = (str) => {
      let i = str.length - 1;
      if (i < 2) return str;
      while (isSeparator(str, i)) i--;
      return str.substr(0, i + 1);
    };
    var normalizePath = (str, stripTrailing) => {
      if (typeof str !== "string") throw new TypeError("expected a string");
      str = str.replace(/[\\\/]+/g, "/");
      if (stripTrailing !== false) str = removeTrailingSeparator(str);
      return str;
    };
    var unixify = (filepath, stripTrailing = true) => {
      if (exports.isWin) {
        filepath = normalizePath(filepath, stripTrailing);
        return filepath.replace(/^([a-zA-Z]+:|\.\/)/, "");
      }
      return filepath;
    };
    exports.unixify = unixify;
  },
});

// node_modules/memfs/lib/node/FileHandle.js
var require_FileHandle = __commonJS({
  "node_modules/memfs/lib/node/FileHandle.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileHandle = void 0;
    var util_1 = require_util3();
    var FileHandle = class {
      constructor(fs, fd) {
        this.fs = fs;
        this.fd = fd;
      }
      appendFile(data, options) {
        return (0, util_1.promisify)(this.fs, "appendFile")(
          this.fd,
          data,
          options,
        );
      }
      chmod(mode) {
        return (0, util_1.promisify)(this.fs, "fchmod")(this.fd, mode);
      }
      chown(uid, gid) {
        return (0, util_1.promisify)(this.fs, "fchown")(this.fd, uid, gid);
      }
      close() {
        return (0, util_1.promisify)(this.fs, "close")(this.fd);
      }
      datasync() {
        return (0, util_1.promisify)(this.fs, "fdatasync")(this.fd);
      }
      read(buffer, offset, length, position) {
        return (0, util_1.promisify)(this.fs, "read", (bytesRead) => ({
          bytesRead,
          buffer,
        }))(this.fd, buffer, offset, length, position);
      }
      readv(buffers, position) {
        return (0, util_1.promisify)(this.fs, "readv", (bytesRead) => ({
          bytesRead,
          buffers,
        }))(this.fd, buffers, position);
      }
      readFile(options) {
        return (0, util_1.promisify)(this.fs, "readFile")(this.fd, options);
      }
      stat(options) {
        return (0, util_1.promisify)(this.fs, "fstat")(this.fd, options);
      }
      sync() {
        return (0, util_1.promisify)(this.fs, "fsync")(this.fd);
      }
      truncate(len) {
        return (0, util_1.promisify)(this.fs, "ftruncate")(this.fd, len);
      }
      utimes(atime, mtime) {
        return (0, util_1.promisify)(this.fs, "futimes")(this.fd, atime, mtime);
      }
      write(buffer, offset, length, position) {
        return (0, util_1.promisify)(this.fs, "write", (bytesWritten) => ({
          bytesWritten,
          buffer,
        }))(this.fd, buffer, offset, length, position);
      }
      writev(buffers, position) {
        return (0, util_1.promisify)(this.fs, "writev", (bytesWritten) => ({
          bytesWritten,
          buffers,
        }))(this.fd, buffers, position);
      }
      writeFile(data, options) {
        return (0, util_1.promisify)(this.fs, "writeFile")(
          this.fd,
          data,
          options,
        );
      }
    };
    exports.FileHandle = FileHandle;
  },
});

// node_modules/memfs/lib/node/FsPromises.js
var require_FsPromises = __commonJS({
  "node_modules/memfs/lib/node/FsPromises.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FsPromises = void 0;
    var util_1 = require_util3();
    var constants_1 = require_constants();
    var FsPromises = class {
      constructor(fs, FileHandle) {
        this.fs = fs;
        this.FileHandle = FileHandle;
        this.constants = constants_1.constants;
        this.cp = (0, util_1.promisify)(this.fs, "cp");
        this.opendir = (0, util_1.promisify)(this.fs, "opendir");
        this.statfs = (0, util_1.promisify)(this.fs, "statfs");
        this.lutimes = (0, util_1.promisify)(this.fs, "lutimes");
        this.access = (0, util_1.promisify)(this.fs, "access");
        this.chmod = (0, util_1.promisify)(this.fs, "chmod");
        this.chown = (0, util_1.promisify)(this.fs, "chown");
        this.copyFile = (0, util_1.promisify)(this.fs, "copyFile");
        this.lchmod = (0, util_1.promisify)(this.fs, "lchmod");
        this.lchown = (0, util_1.promisify)(this.fs, "lchown");
        this.link = (0, util_1.promisify)(this.fs, "link");
        this.lstat = (0, util_1.promisify)(this.fs, "lstat");
        this.mkdir = (0, util_1.promisify)(this.fs, "mkdir");
        this.mkdtemp = (0, util_1.promisify)(this.fs, "mkdtemp");
        this.readdir = (0, util_1.promisify)(this.fs, "readdir");
        this.readlink = (0, util_1.promisify)(this.fs, "readlink");
        this.realpath = (0, util_1.promisify)(this.fs, "realpath");
        this.rename = (0, util_1.promisify)(this.fs, "rename");
        this.rmdir = (0, util_1.promisify)(this.fs, "rmdir");
        this.rm = (0, util_1.promisify)(this.fs, "rm");
        this.stat = (0, util_1.promisify)(this.fs, "stat");
        this.symlink = (0, util_1.promisify)(this.fs, "symlink");
        this.truncate = (0, util_1.promisify)(this.fs, "truncate");
        this.unlink = (0, util_1.promisify)(this.fs, "unlink");
        this.utimes = (0, util_1.promisify)(this.fs, "utimes");
        this.readFile = (id, options) => {
          return (0, util_1.promisify)(this.fs, "readFile")(
            id instanceof this.FileHandle ? id.fd : id,
            options,
          );
        };
        this.appendFile = (path, data, options) => {
          return (0, util_1.promisify)(this.fs, "appendFile")(
            path instanceof this.FileHandle ? path.fd : path,
            data,
            options,
          );
        };
        this.open = (path, flags = "r", mode) => {
          return (0, util_1.promisify)(
            this.fs,
            "open",
            (fd) => new this.FileHandle(this.fs, fd),
          )(path, flags, mode);
        };
        this.writeFile = (id, data, options) => {
          return (0, util_1.promisify)(this.fs, "writeFile")(
            id instanceof this.FileHandle ? id.fd : id,
            data,
            options,
          );
        };
        this.watch = () => {
          throw new Error("Not implemented");
        };
      }
    };
    exports.FsPromises = FsPromises;
  },
});

// node_modules/memfs/lib/json-joy/util/print/printTree.js
var require_printTree = __commonJS({
  "node_modules/memfs/lib/json-joy/util/print/printTree.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printTree = void 0;
    var printTree = (tab = "", children) => {
      children = children.filter(Boolean);
      let str = "";
      for (let i = 0; i < children.length; i++) {
        const isLast = i >= children.length - 1;
        const fn = children[i];
        if (!fn) continue;
        const child = fn(tab + `${isLast ? " " : "\u2502"}  `);
        const branch = child
          ? isLast
            ? "\u2514\u2500"
            : "\u251C\u2500"
          : "\u2502 ";
        str += `
${tab}${branch} ${child}`;
      }
      return str;
    };
    exports.printTree = printTree;
  },
});

// node_modules/memfs/lib/node-to-fsa/util.js
var require_util4 = __commonJS({
  "node_modules/memfs/lib/node-to-fsa/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.newNotAllowedError =
      exports.newTypeMismatchError =
      exports.newNotFoundError =
      exports.assertCanWrite =
      exports.assertName =
      exports.basename =
      exports.ctx =
        void 0;
    var ctx = (partial = {}) => {
      return Object.assign(
        { separator: "/", syncHandleAllowed: false, mode: "read" },
        partial,
      );
    };
    exports.ctx = ctx;
    var basename = (path, separator) => {
      if (path[path.length - 1] === separator) path = path.slice(0, -1);
      const lastSlashIndex = path.lastIndexOf(separator);
      return lastSlashIndex === -1 ? path : path.slice(lastSlashIndex + 1);
    };
    exports.basename = basename;
    var nameRegex = /^(\.{1,2})$|^(.*([\/\\]).*)$/;
    var assertName = (name, method, klass) => {
      const isInvalid = !name || nameRegex.test(name);
      if (isInvalid)
        throw new TypeError(
          `Failed to execute '${method}' on '${klass}': Name is not allowed.`,
        );
    };
    exports.assertName = assertName;
    var assertCanWrite = (mode) => {
      if (mode !== "readwrite")
        throw new DOMException(
          "The request is not allowed by the user agent or the platform in the current context.",
          "NotAllowedError",
        );
    };
    exports.assertCanWrite = assertCanWrite;
    var newNotFoundError = () =>
      new DOMException(
        "A requested file or directory could not be found at the time an operation was processed.",
        "NotFoundError",
      );
    exports.newNotFoundError = newNotFoundError;
    var newTypeMismatchError = () =>
      new DOMException(
        "The path supplied exists, but was not an entry of requested type.",
        "TypeMismatchError",
      );
    exports.newTypeMismatchError = newTypeMismatchError;
    var newNotAllowedError = () =>
      new DOMException("Permission not granted.", "NotAllowedError");
    exports.newNotAllowedError = newNotAllowedError;
  },
});

// node_modules/memfs/lib/print/index.js
var require_print = __commonJS({
  "node_modules/memfs/lib/print/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toTreeSync = void 0;
    var printTree_1 = require_printTree();
    var util_1 = require_util4();
    var toTreeSync = (fs, opts = {}) => {
      var _a;
      const separator = opts.separator || "/";
      let dir = opts.dir || separator;
      if (dir[dir.length - 1] !== separator) dir += separator;
      const tab = opts.tab || "";
      const depth = (_a = opts.depth) !== null && _a !== void 0 ? _a : 10;
      let subtree = " (...)";
      if (depth > 0) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        subtree = (0, printTree_1.printTree)(
          tab,
          list.map((entry) => (tab2) => {
            if (entry.isDirectory()) {
              return (0, exports.toTreeSync)(fs, {
                dir: dir + entry.name,
                depth: depth - 1,
                tab: tab2,
              });
            } else if (entry.isSymbolicLink()) {
              return (
                "" + entry.name + " \u2192 " + fs.readlinkSync(dir + entry.name)
              );
            } else {
              return "" + entry.name;
            }
          }),
        );
      }
      const base = (0, util_1.basename)(dir, separator) + separator;
      return base + subtree;
    };
    exports.toTreeSync = toTreeSync;
  },
});

// node_modules/memfs/lib/node/options.js
var require_options = __commonJS({
  "node_modules/memfs/lib/node/options.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWriteFileOptions =
      exports.writeFileDefaults =
      exports.getRealpathOptsAndCb =
      exports.getRealpathOptions =
      exports.getStatOptsAndCb =
      exports.getStatOptions =
      exports.getAppendFileOptsAndCb =
      exports.getAppendFileOpts =
      exports.getReaddirOptsAndCb =
      exports.getReaddirOptions =
      exports.getReadFileOptions =
      exports.getRmOptsAndCb =
      exports.getRmdirOptions =
      exports.getDefaultOptsAndCb =
      exports.getDefaultOpts =
      exports.optsDefaults =
      exports.optsAndCbGenerator =
      exports.optsGenerator =
      exports.getOptions =
      exports.getMkdirOptions =
        void 0;
    var constants_1 = require_constants2();
    var encoding_1 = require_encoding();
    var util_1 = require_util3();
    var mkdirDefaults = {
      mode: 511,
      recursive: false,
    };
    var getMkdirOptions = (options) => {
      if (typeof options === "number")
        return Object.assign({}, mkdirDefaults, { mode: options });
      return Object.assign({}, mkdirDefaults, options);
    };
    exports.getMkdirOptions = getMkdirOptions;
    var ERRSTR_OPTS = (tipeof) =>
      `Expected options to be either an object or a string, but got ${tipeof} instead`;
    function getOptions(defaults, options) {
      let opts;
      if (!options) return defaults;
      else {
        const tipeof = typeof options;
        switch (tipeof) {
          case "string":
            opts = Object.assign({}, defaults, { encoding: options });
            break;
          case "object":
            opts = Object.assign({}, defaults, options);
            break;
          default:
            throw TypeError(ERRSTR_OPTS(tipeof));
        }
      }
      if (opts.encoding !== "buffer")
        (0, encoding_1.assertEncoding)(opts.encoding);
      return opts;
    }
    exports.getOptions = getOptions;
    function optsGenerator(defaults) {
      return (options) => getOptions(defaults, options);
    }
    exports.optsGenerator = optsGenerator;
    function optsAndCbGenerator(getOpts) {
      return (options, callback) =>
        typeof options === "function"
          ? [getOpts(), options]
          : [getOpts(options), (0, util_1.validateCallback)(callback)];
    }
    exports.optsAndCbGenerator = optsAndCbGenerator;
    exports.optsDefaults = {
      encoding: "utf8",
    };
    exports.getDefaultOpts = optsGenerator(exports.optsDefaults);
    exports.getDefaultOptsAndCb = optsAndCbGenerator(exports.getDefaultOpts);
    var rmdirDefaults = {
      recursive: false,
    };
    var getRmdirOptions = (options) => {
      return Object.assign({}, rmdirDefaults, options);
    };
    exports.getRmdirOptions = getRmdirOptions;
    var getRmOpts = optsGenerator(exports.optsDefaults);
    exports.getRmOptsAndCb = optsAndCbGenerator(getRmOpts);
    var readFileOptsDefaults = {
      flag: "r",
    };
    exports.getReadFileOptions = optsGenerator(readFileOptsDefaults);
    var readdirDefaults = {
      encoding: "utf8",
      recursive: false,
      withFileTypes: false,
    };
    exports.getReaddirOptions = optsGenerator(readdirDefaults);
    exports.getReaddirOptsAndCb = optsAndCbGenerator(exports.getReaddirOptions);
    var appendFileDefaults = {
      encoding: "utf8",
      mode: 438,
      flag: constants_1.FLAGS[constants_1.FLAGS.a],
    };
    exports.getAppendFileOpts = optsGenerator(appendFileDefaults);
    exports.getAppendFileOptsAndCb = optsAndCbGenerator(
      exports.getAppendFileOpts,
    );
    var statDefaults = {
      bigint: false,
    };
    var getStatOptions = (options = {}) =>
      Object.assign({}, statDefaults, options);
    exports.getStatOptions = getStatOptions;
    var getStatOptsAndCb = (options, callback) =>
      typeof options === "function"
        ? [(0, exports.getStatOptions)(), options]
        : [
            (0, exports.getStatOptions)(options),
            (0, util_1.validateCallback)(callback),
          ];
    exports.getStatOptsAndCb = getStatOptsAndCb;
    var realpathDefaults = exports.optsDefaults;
    exports.getRealpathOptions = optsGenerator(realpathDefaults);
    exports.getRealpathOptsAndCb = optsAndCbGenerator(
      exports.getRealpathOptions,
    );
    exports.writeFileDefaults = {
      encoding: "utf8",
      mode: 438,
      flag: constants_1.FLAGS[constants_1.FLAGS.w],
    };
    exports.getWriteFileOptions = optsGenerator(exports.writeFileDefaults);
  },
});

// node_modules/memfs/lib/volume.js
var require_volume = __commonJS({
  "node_modules/memfs/lib/volume.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FSWatcher =
      exports.StatWatcher =
      exports.Volume =
      exports.toUnixTimestamp =
      exports.dataToStr =
      exports.pathToSteps =
      exports.filenameToSteps =
        void 0;
    var pathModule = require_path();
    var node_1 = require_node();
    var Stats_1 = require_Stats();
    var Dirent_1 = require_Dirent();
    var buffer_1 = require_buffer2();
    var setImmediate_1 = require_setImmediate();
    var queueMicrotask_1 = require_queueMicrotask();
    var process_1 = require_process();
    var setTimeoutUnref_1 = require_setTimeoutUnref();
    var stream_1 = require_stream();
    var constants_1 = require_constants();
    var events_1 = require_events();
    var encoding_1 = require_encoding();
    var FileHandle_1 = require_FileHandle();
    var util = require_util();
    var FsPromises_1 = require_FsPromises();
    var print_1 = require_print();
    var constants_2 = require_constants2();
    var options_1 = require_options();
    var util_1 = require_util3();
    var resolveCrossPlatform = pathModule.resolve;
    var {
      O_RDONLY,
      O_WRONLY,
      O_RDWR,
      O_CREAT,
      O_EXCL,
      O_TRUNC,
      O_APPEND,
      O_DIRECTORY,
      O_SYMLINK,
      F_OK,
      COPYFILE_EXCL,
      COPYFILE_FICLONE_FORCE,
    } = constants_1.constants;
    var { sep, relative, join, dirname } = pathModule.posix
      ? pathModule.posix
      : pathModule;
    var kMinPoolSpace = 128;
    var EPERM = "EPERM";
    var ENOENT = "ENOENT";
    var EBADF = "EBADF";
    var EINVAL = "EINVAL";
    var EEXIST = "EEXIST";
    var ENOTDIR = "ENOTDIR";
    var EMFILE = "EMFILE";
    var EACCES = "EACCES";
    var EISDIR = "EISDIR";
    var ENOTEMPTY = "ENOTEMPTY";
    var ENOSYS = "ENOSYS";
    var ERR_FS_EISDIR = "ERR_FS_EISDIR";
    var ERR_OUT_OF_RANGE = "ERR_OUT_OF_RANGE";
    var resolve = (filename, base = process_1.default.cwd()) =>
      resolveCrossPlatform(base, filename);
    if (util_1.isWin) {
      const _resolve = resolve;
      resolve = (filename, base) =>
        (0, util_1.unixify)(_resolve(filename, base));
    }
    function filenameToSteps(filename, base) {
      const fullPath = resolve(filename, base);
      const fullPathSansSlash = fullPath.substring(1);
      if (!fullPathSansSlash) return [];
      return fullPathSansSlash.split(sep);
    }
    exports.filenameToSteps = filenameToSteps;
    function pathToSteps(path) {
      return filenameToSteps((0, util_1.pathToFilename)(path));
    }
    exports.pathToSteps = pathToSteps;
    function dataToStr(data, encoding = encoding_1.ENCODING_UTF8) {
      if (buffer_1.Buffer.isBuffer(data)) return data.toString(encoding);
      else if (data instanceof Uint8Array)
        return (0, buffer_1.bufferFrom)(data).toString(encoding);
      else return String(data);
    }
    exports.dataToStr = dataToStr;
    function toUnixTimestamp(time) {
      if (typeof time === "string" && +time == time) {
        return +time;
      }
      if (time instanceof Date) {
        return time.getTime() / 1e3;
      }
      if (isFinite(time)) {
        if (time < 0) {
          return Date.now() / 1e3;
        }
        return time;
      }
      throw new Error("Cannot parse time: " + time);
    }
    exports.toUnixTimestamp = toUnixTimestamp;
    function validateUid(uid) {
      if (typeof uid !== "number") throw TypeError(constants_2.ERRSTR.UID);
    }
    function validateGid(gid) {
      if (typeof gid !== "number") throw TypeError(constants_2.ERRSTR.GID);
    }
    function flattenJSON(nestedJSON) {
      const flatJSON = {};
      function flatten(pathPrefix, node) {
        for (const path in node) {
          const contentOrNode = node[path];
          const joinedPath = join(pathPrefix, path);
          if (
            typeof contentOrNode === "string" ||
            contentOrNode instanceof buffer_1.Buffer
          ) {
            flatJSON[joinedPath] = contentOrNode;
          } else if (
            typeof contentOrNode === "object" &&
            contentOrNode !== null &&
            Object.keys(contentOrNode).length > 0
          ) {
            flatten(joinedPath, contentOrNode);
          } else {
            flatJSON[joinedPath] = null;
          }
        }
      }
      flatten("", nestedJSON);
      return flatJSON;
    }
    var notImplemented = () => {
      throw new Error("Not implemented");
    };
    var Volume = class _Volume {
      static fromJSON(json, cwd) {
        const vol = new _Volume();
        vol.fromJSON(json, cwd);
        return vol;
      }
      static fromNestedJSON(json, cwd) {
        const vol = new _Volume();
        vol.fromNestedJSON(json, cwd);
        return vol;
      }
      get promises() {
        if (this.promisesApi === null)
          throw new Error("Promise is not supported in this environment.");
        return this.promisesApi;
      }
      constructor(props = {}) {
        this.ino = 0;
        this.inodes = {};
        this.releasedInos = [];
        this.fds = {};
        this.releasedFds = [];
        this.maxFiles = 1e4;
        this.openFiles = 0;
        this.promisesApi = new FsPromises_1.FsPromises(
          this,
          FileHandle_1.FileHandle,
        );
        this.statWatchers = {};
        this.cpSync = notImplemented;
        this.lutimesSync = notImplemented;
        this.statfsSync = notImplemented;
        this.opendirSync = notImplemented;
        this.cp = notImplemented;
        this.lutimes = notImplemented;
        this.statfs = notImplemented;
        this.openAsBlob = notImplemented;
        this.opendir = notImplemented;
        this.props = Object.assign(
          { Node: node_1.Node, Link: node_1.Link, File: node_1.File },
          props,
        );
        const root = this.createLink();
        root.setNode(this.createNode(true));
        const self = this;
        this.StatWatcher = class extends StatWatcher {
          constructor() {
            super(self);
          }
        };
        const _ReadStream = FsReadStream;
        this.ReadStream = class extends _ReadStream {
          constructor(...args) {
            super(self, ...args);
          }
        };
        const _WriteStream = FsWriteStream;
        this.WriteStream = class extends _WriteStream {
          constructor(...args) {
            super(self, ...args);
          }
        };
        this.FSWatcher = class extends FSWatcher {
          constructor() {
            super(self);
          }
        };
        root.setChild(".", root);
        root.getNode().nlink++;
        root.setChild("..", root);
        root.getNode().nlink++;
        this.root = root;
      }
      createLink(parent, name, isDirectory = false, perm) {
        if (!parent) {
          return new this.props.Link(this, null, "");
        }
        if (!name) {
          throw new Error("createLink: name cannot be empty");
        }
        return parent.createChild(name, this.createNode(isDirectory, perm));
      }
      deleteLink(link) {
        const parent = link.parent;
        if (parent) {
          parent.deleteChild(link);
          return true;
        }
        return false;
      }
      newInoNumber() {
        const releasedFd = this.releasedInos.pop();
        if (releasedFd) return releasedFd;
        else {
          this.ino = (this.ino + 1) % 4294967295;
          return this.ino;
        }
      }
      newFdNumber() {
        const releasedFd = this.releasedFds.pop();
        return typeof releasedFd === "number" ? releasedFd : _Volume.fd--;
      }
      createNode(isDirectory = false, perm) {
        const node = new this.props.Node(this.newInoNumber(), perm);
        if (isDirectory) node.setIsDirectory();
        this.inodes[node.ino] = node;
        return node;
      }
      deleteNode(node) {
        node.del();
        delete this.inodes[node.ino];
        this.releasedInos.push(node.ino);
      }
      // Returns a `Link` (hard link) referenced by path "split" into steps.
      getLink(steps) {
        return this.root.walk(steps);
      }
      // Just link `getLink`, but throws a correct user error, if link to found.
      getLinkOrThrow(filename, funcName) {
        const steps = filenameToSteps(filename);
        const link = this.getLink(steps);
        if (!link) throw (0, util_1.createError)(ENOENT, funcName, filename);
        return link;
      }
      // Just like `getLink`, but also dereference/resolves symbolic links.
      getResolvedLink(filenameOrSteps) {
        let steps =
          typeof filenameOrSteps === "string"
            ? filenameToSteps(filenameOrSteps)
            : filenameOrSteps;
        let link = this.root;
        let i = 0;
        while (i < steps.length) {
          const step = steps[i];
          link = link.getChild(step);
          if (!link) return null;
          const node = link.getNode();
          if (node.isSymlink()) {
            steps = node.symlink.concat(steps.slice(i + 1));
            link = this.root;
            i = 0;
            continue;
          }
          i++;
        }
        return link;
      }
      // Just like `getLinkOrThrow`, but also dereference/resolves symbolic links.
      getResolvedLinkOrThrow(filename, funcName) {
        const link = this.getResolvedLink(filename);
        if (!link) throw (0, util_1.createError)(ENOENT, funcName, filename);
        return link;
      }
      resolveSymlinks(link) {
        return this.getResolvedLink(link.steps.slice(1));
      }
      // Just like `getLinkOrThrow`, but also verifies that the link is a directory.
      getLinkAsDirOrThrow(filename, funcName) {
        const link = this.getLinkOrThrow(filename, funcName);
        if (!link.getNode().isDirectory())
          throw (0, util_1.createError)(ENOTDIR, funcName, filename);
        return link;
      }
      // Get the immediate parent directory of the link.
      getLinkParent(steps) {
        return this.root.walk(steps, steps.length - 1);
      }
      getLinkParentAsDirOrThrow(filenameOrSteps, funcName) {
        const steps =
          filenameOrSteps instanceof Array
            ? filenameOrSteps
            : filenameToSteps(filenameOrSteps);
        const link = this.getLinkParent(steps);
        if (!link)
          throw (0, util_1.createError)(
            ENOENT,
            funcName,
            sep + steps.join(sep),
          );
        if (!link.getNode().isDirectory())
          throw (0, util_1.createError)(
            ENOTDIR,
            funcName,
            sep + steps.join(sep),
          );
        return link;
      }
      getFileByFd(fd) {
        return this.fds[String(fd)];
      }
      getFileByFdOrThrow(fd, funcName) {
        if (!(0, util_1.isFd)(fd)) throw TypeError(constants_2.ERRSTR.FD);
        const file = this.getFileByFd(fd);
        if (!file) throw (0, util_1.createError)(EBADF, funcName);
        return file;
      }
      /**
       * @todo This is not used anymore. Remove.
       */
      /*
        private getNodeByIdOrCreate(id: TFileId, flags: number, perm: number): Node {
          if (typeof id === 'number') {
            const file = this.getFileByFd(id);
            if (!file) throw Error('File nto found');
            return file.node;
          } else {
            const steps = pathToSteps(id as PathLike);
            let link = this.getLink(steps);
            if (link) return link.getNode();

            // Try creating a node if not found.
            if (flags & O_CREAT) {
              const dirLink = this.getLinkParent(steps);
              if (dirLink) {
                const name = steps[steps.length - 1];
                link = this.createLink(dirLink, name, false, perm);
                return link.getNode();
              }
            }

            throw createError(ENOENT, 'getNodeByIdOrCreate', pathToFilename(id));
          }
        }
        */
      wrapAsync(method, args, callback) {
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
          let result;
          try {
            result = method.apply(this, args);
          } catch (err) {
            callback(err);
            return;
          }
          callback(null, result);
        });
      }
      _toJSON(link = this.root, json = {}, path, asBuffer) {
        let isEmpty = true;
        let children = link.children;
        if (link.getNode().isFile()) {
          children = /* @__PURE__ */ new Map([
            [link.getName(), link.parent.getChild(link.getName())],
          ]);
          link = link.parent;
        }
        for (const name of children.keys()) {
          if (name === "." || name === "..") {
            continue;
          }
          isEmpty = false;
          const child = link.getChild(name);
          if (!child) {
            throw new Error("_toJSON: unexpected undefined");
          }
          const node = child.getNode();
          if (node.isFile()) {
            let filename = child.getPath();
            if (path) filename = relative(path, filename);
            json[filename] = asBuffer ? node.getBuffer() : node.getString();
          } else if (node.isDirectory()) {
            this._toJSON(child, json, path);
          }
        }
        let dirPath = link.getPath();
        if (path) dirPath = relative(path, dirPath);
        if (dirPath && isEmpty) {
          json[dirPath] = null;
        }
        return json;
      }
      toJSON(paths, json = {}, isRelative = false, asBuffer = false) {
        const links = [];
        if (paths) {
          if (!Array.isArray(paths)) paths = [paths];
          for (const path of paths) {
            const filename = (0, util_1.pathToFilename)(path);
            const link = this.getResolvedLink(filename);
            if (!link) continue;
            links.push(link);
          }
        } else {
          links.push(this.root);
        }
        if (!links.length) return json;
        for (const link of links)
          this._toJSON(link, json, isRelative ? link.getPath() : "", asBuffer);
        return json;
      }
      // TODO: `cwd` should probably not invoke `process.cwd()`.
      fromJSON(json, cwd = process_1.default.cwd()) {
        for (let filename in json) {
          const data = json[filename];
          filename = resolve(filename, cwd);
          if (typeof data === "string" || data instanceof buffer_1.Buffer) {
            const dir = dirname(filename);
            this.mkdirpBase(
              dir,
              511,
              /* MODE.DIR */
            );
            this.writeFileSync(filename, data);
          } else {
            this.mkdirpBase(
              filename,
              511,
              /* MODE.DIR */
            );
          }
        }
      }
      fromNestedJSON(json, cwd) {
        this.fromJSON(flattenJSON(json), cwd);
      }
      toTree(opts = { separator: sep }) {
        return (0, print_1.toTreeSync)(this, opts);
      }
      reset() {
        this.ino = 0;
        this.inodes = {};
        this.releasedInos = [];
        this.fds = {};
        this.releasedFds = [];
        this.openFiles = 0;
        this.root = this.createLink();
        this.root.setNode(this.createNode(true));
      }
      // Legacy interface
      mountSync(mountpoint, json) {
        this.fromJSON(json, mountpoint);
      }
      openLink(link, flagsNum, resolveSymlinks = true) {
        if (this.openFiles >= this.maxFiles) {
          throw (0, util_1.createError)(EMFILE, "open", link.getPath());
        }
        let realLink = link;
        if (resolveSymlinks) realLink = this.resolveSymlinks(link);
        if (!realLink)
          throw (0, util_1.createError)(ENOENT, "open", link.getPath());
        const node = realLink.getNode();
        if (node.isDirectory()) {
          if ((flagsNum & (O_RDONLY | O_RDWR | O_WRONLY)) !== O_RDONLY)
            throw (0, util_1.createError)(EISDIR, "open", link.getPath());
        } else {
          if (flagsNum & O_DIRECTORY)
            throw (0, util_1.createError)(ENOTDIR, "open", link.getPath());
        }
        if (!(flagsNum & O_WRONLY)) {
          if (!node.canRead()) {
            throw (0, util_1.createError)(EACCES, "open", link.getPath());
          }
        }
        if (flagsNum & O_RDWR) {
        }
        const file = new this.props.File(
          link,
          node,
          flagsNum,
          this.newFdNumber(),
        );
        this.fds[file.fd] = file;
        this.openFiles++;
        if (flagsNum & O_TRUNC) file.truncate();
        return file;
      }
      openFile(filename, flagsNum, modeNum, resolveSymlinks = true) {
        const steps = filenameToSteps(filename);
        let link = resolveSymlinks
          ? this.getResolvedLink(steps)
          : this.getLink(steps);
        if (link && flagsNum & O_EXCL)
          throw (0, util_1.createError)(EEXIST, "open", filename);
        if (!link && flagsNum & O_CREAT) {
          const dirLink = this.getResolvedLink(
            steps.slice(0, steps.length - 1),
          );
          if (!dirLink)
            throw (0, util_1.createError)(
              ENOENT,
              "open",
              sep + steps.join(sep),
            );
          if (flagsNum & O_CREAT && typeof modeNum === "number") {
            link = this.createLink(
              dirLink,
              steps[steps.length - 1],
              false,
              modeNum,
            );
          }
        }
        if (link) return this.openLink(link, flagsNum, resolveSymlinks);
        throw (0, util_1.createError)(ENOENT, "open", filename);
      }
      openBase(filename, flagsNum, modeNum, resolveSymlinks = true) {
        const file = this.openFile(
          filename,
          flagsNum,
          modeNum,
          resolveSymlinks,
        );
        if (!file) throw (0, util_1.createError)(ENOENT, "open", filename);
        return file.fd;
      }
      openSync(path, flags, mode = 438) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const fileName = (0, util_1.pathToFilename)(path);
        const flagsNum = (0, util_1.flagsToNumber)(flags);
        return this.openBase(
          fileName,
          flagsNum,
          modeNum,
          !(flagsNum & O_SYMLINK),
        );
      }
      open(path, flags, a, b) {
        let mode = a;
        let callback = b;
        if (typeof a === "function") {
          mode = 438;
          callback = a;
        }
        mode = mode || 438;
        const modeNum = (0, util_1.modeToNumber)(mode);
        const fileName = (0, util_1.pathToFilename)(path);
        const flagsNum = (0, util_1.flagsToNumber)(flags);
        this.wrapAsync(
          this.openBase,
          [fileName, flagsNum, modeNum, !(flagsNum & O_SYMLINK)],
          callback,
        );
      }
      closeFile(file) {
        if (!this.fds[file.fd]) return;
        this.openFiles--;
        delete this.fds[file.fd];
        this.releasedFds.push(file.fd);
      }
      closeSync(fd) {
        (0, util_1.validateFd)(fd);
        const file = this.getFileByFdOrThrow(fd, "close");
        this.closeFile(file);
      }
      close(fd, callback) {
        (0, util_1.validateFd)(fd);
        this.wrapAsync(this.closeSync, [fd], callback);
      }
      openFileOrGetById(id, flagsNum, modeNum) {
        if (typeof id === "number") {
          const file = this.fds[id];
          if (!file) throw (0, util_1.createError)(ENOENT);
          return file;
        } else {
          return this.openFile(
            (0, util_1.pathToFilename)(id),
            flagsNum,
            modeNum,
          );
        }
      }
      readBase(fd, buffer, offset, length, position) {
        if (buffer.byteLength < length) {
          throw (0, util_1.createError)(
            ERR_OUT_OF_RANGE,
            "read",
            void 0,
            void 0,
            RangeError,
          );
        }
        const file = this.getFileByFdOrThrow(fd);
        if (file.node.isSymlink()) {
          throw (0, util_1.createError)(EPERM, "read", file.link.getPath());
        }
        return file.read(
          buffer,
          Number(offset),
          Number(length),
          position === -1 || typeof position !== "number" ? void 0 : position,
        );
      }
      readSync(fd, buffer, offset, length, position) {
        (0, util_1.validateFd)(fd);
        return this.readBase(fd, buffer, offset, length, position);
      }
      read(fd, buffer, offset, length, position, callback) {
        (0, util_1.validateCallback)(callback);
        if (length === 0) {
          return (0, queueMicrotask_1.default)(() => {
            if (callback) callback(null, 0, buffer);
          });
        }
        (0, setImmediate_1.default)(() => {
          try {
            const bytes = this.readBase(fd, buffer, offset, length, position);
            callback(null, bytes, buffer);
          } catch (err) {
            callback(err);
          }
        });
      }
      readvBase(fd, buffers, position) {
        const file = this.getFileByFdOrThrow(fd);
        let p = position !== null && position !== void 0 ? position : void 0;
        if (p === -1) {
          p = void 0;
        }
        let bytesRead = 0;
        for (const buffer of buffers) {
          const bytes = file.read(buffer, 0, buffer.byteLength, p);
          p = void 0;
          bytesRead += bytes;
          if (bytes < buffer.byteLength) break;
        }
        return bytesRead;
      }
      readv(fd, buffers, a, b) {
        let position = a;
        let callback = b;
        if (typeof a === "function") {
          position = null;
          callback = a;
        }
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
          try {
            const bytes = this.readvBase(fd, buffers, position);
            callback(null, bytes, buffers);
          } catch (err) {
            callback(err);
          }
        });
      }
      readvSync(fd, buffers, position) {
        (0, util_1.validateFd)(fd);
        return this.readvBase(fd, buffers, position);
      }
      readFileBase(id, flagsNum, encoding) {
        let result;
        const isUserFd = typeof id === "number";
        const userOwnsFd = isUserFd && (0, util_1.isFd)(id);
        let fd;
        if (userOwnsFd) fd = id;
        else {
          const filename = (0, util_1.pathToFilename)(id);
          const steps = filenameToSteps(filename);
          const link = this.getResolvedLink(steps);
          if (link) {
            const node = link.getNode();
            if (node.isDirectory())
              throw (0, util_1.createError)(EISDIR, "open", link.getPath());
          }
          fd = this.openSync(id, flagsNum);
        }
        try {
          result = (0, util_1.bufferToEncoding)(
            this.getFileByFdOrThrow(fd).getBuffer(),
            encoding,
          );
        } finally {
          if (!userOwnsFd) {
            this.closeSync(fd);
          }
        }
        return result;
      }
      readFileSync(file, options) {
        const opts = (0, options_1.getReadFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        return this.readFileBase(file, flagsNum, opts.encoding);
      }
      readFile(id, a, b) {
        const [opts, callback] = (0, options_1.optsAndCbGenerator)(
          options_1.getReadFileOptions,
        )(a, b);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        this.wrapAsync(
          this.readFileBase,
          [id, flagsNum, opts.encoding],
          callback,
        );
      }
      writeBase(fd, buf, offset, length, position) {
        const file = this.getFileByFdOrThrow(fd, "write");
        if (file.node.isSymlink()) {
          throw (0, util_1.createError)(EBADF, "write", file.link.getPath());
        }
        return file.write(
          buf,
          offset,
          length,
          position === -1 || typeof position !== "number" ? void 0 : position,
        );
      }
      writeSync(fd, a, b, c, d) {
        const [, buf, offset, length, position] = (0, util_1.getWriteSyncArgs)(
          fd,
          a,
          b,
          c,
          d,
        );
        return this.writeBase(fd, buf, offset, length, position);
      }
      write(fd, a, b, c, d, e) {
        const [, asStr, buf, offset, length, position, cb] = (0,
        util_1.getWriteArgs)(fd, a, b, c, d, e);
        (0, setImmediate_1.default)(() => {
          try {
            const bytes = this.writeBase(fd, buf, offset, length, position);
            if (!asStr) {
              cb(null, bytes, buf);
            } else {
              cb(null, bytes, a);
            }
          } catch (err) {
            cb(err);
          }
        });
      }
      writevBase(fd, buffers, position) {
        const file = this.getFileByFdOrThrow(fd);
        let p = position !== null && position !== void 0 ? position : void 0;
        if (p === -1) {
          p = void 0;
        }
        let bytesWritten = 0;
        for (const buffer of buffers) {
          const nodeBuf = buffer_1.Buffer.from(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength,
          );
          const bytes = file.write(nodeBuf, 0, nodeBuf.byteLength, p);
          p = void 0;
          bytesWritten += bytes;
          if (bytes < nodeBuf.byteLength) break;
        }
        return bytesWritten;
      }
      writev(fd, buffers, a, b) {
        let position = a;
        let callback = b;
        if (typeof a === "function") {
          position = null;
          callback = a;
        }
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
          try {
            const bytes = this.writevBase(fd, buffers, position);
            callback(null, bytes, buffers);
          } catch (err) {
            callback(err);
          }
        });
      }
      writevSync(fd, buffers, position) {
        (0, util_1.validateFd)(fd);
        return this.writevBase(fd, buffers, position);
      }
      writeFileBase(id, buf, flagsNum, modeNum) {
        const isUserFd = typeof id === "number";
        let fd;
        if (isUserFd) fd = id;
        else {
          fd = this.openBase((0, util_1.pathToFilename)(id), flagsNum, modeNum);
        }
        let offset = 0;
        let length = buf.length;
        let position = flagsNum & O_APPEND ? void 0 : 0;
        try {
          while (length > 0) {
            const written = this.writeSync(fd, buf, offset, length, position);
            offset += written;
            length -= written;
            if (position !== void 0) position += written;
          }
        } finally {
          if (!isUserFd) this.closeSync(fd);
        }
      }
      writeFileSync(id, data, options) {
        const opts = (0, options_1.getWriteFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        const modeNum = (0, util_1.modeToNumber)(opts.mode);
        const buf = (0, util_1.dataToBuffer)(data, opts.encoding);
        this.writeFileBase(id, buf, flagsNum, modeNum);
      }
      writeFile(id, data, a, b) {
        let options = a;
        let callback = b;
        if (typeof a === "function") {
          options = options_1.writeFileDefaults;
          callback = a;
        }
        const cb = (0, util_1.validateCallback)(callback);
        const opts = (0, options_1.getWriteFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        const modeNum = (0, util_1.modeToNumber)(opts.mode);
        const buf = (0, util_1.dataToBuffer)(data, opts.encoding);
        this.wrapAsync(this.writeFileBase, [id, buf, flagsNum, modeNum], cb);
      }
      linkBase(filename1, filename2) {
        const steps1 = filenameToSteps(filename1);
        const link1 = this.getLink(steps1);
        if (!link1)
          throw (0, util_1.createError)(ENOENT, "link", filename1, filename2);
        const steps2 = filenameToSteps(filename2);
        const dir2 = this.getLinkParent(steps2);
        if (!dir2)
          throw (0, util_1.createError)(ENOENT, "link", filename1, filename2);
        const name = steps2[steps2.length - 1];
        if (dir2.getChild(name))
          throw (0, util_1.createError)(EEXIST, "link", filename1, filename2);
        const node = link1.getNode();
        node.nlink++;
        dir2.createChild(name, node);
      }
      copyFileBase(src, dest, flags) {
        const buf = this.readFileSync(src);
        if (flags & COPYFILE_EXCL) {
          if (this.existsSync(dest)) {
            throw (0, util_1.createError)(EEXIST, "copyFile", src, dest);
          }
        }
        if (flags & COPYFILE_FICLONE_FORCE) {
          throw (0, util_1.createError)(ENOSYS, "copyFile", src, dest);
        }
        this.writeFileBase(
          dest,
          buf,
          constants_2.FLAGS.w,
          438,
          /* MODE.DEFAULT */
        );
      }
      copyFileSync(src, dest, flags) {
        const srcFilename = (0, util_1.pathToFilename)(src);
        const destFilename = (0, util_1.pathToFilename)(dest);
        return this.copyFileBase(srcFilename, destFilename, (flags || 0) | 0);
      }
      copyFile(src, dest, a, b) {
        const srcFilename = (0, util_1.pathToFilename)(src);
        const destFilename = (0, util_1.pathToFilename)(dest);
        let flags;
        let callback;
        if (typeof a === "function") {
          flags = 0;
          callback = a;
        } else {
          flags = a;
          callback = b;
        }
        (0, util_1.validateCallback)(callback);
        this.wrapAsync(
          this.copyFileBase,
          [srcFilename, destFilename, flags],
          callback,
        );
      }
      linkSync(existingPath, newPath) {
        const existingPathFilename = (0, util_1.pathToFilename)(existingPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.linkBase(existingPathFilename, newPathFilename);
      }
      link(existingPath, newPath, callback) {
        const existingPathFilename = (0, util_1.pathToFilename)(existingPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.wrapAsync(
          this.linkBase,
          [existingPathFilename, newPathFilename],
          callback,
        );
      }
      unlinkBase(filename) {
        const steps = filenameToSteps(filename);
        const link = this.getLink(steps);
        if (!link) throw (0, util_1.createError)(ENOENT, "unlink", filename);
        if (link.length) throw Error("Dir not empty...");
        this.deleteLink(link);
        const node = link.getNode();
        node.nlink--;
        if (node.nlink <= 0) {
          this.deleteNode(node);
        }
      }
      unlinkSync(path) {
        const filename = (0, util_1.pathToFilename)(path);
        this.unlinkBase(filename);
      }
      unlink(path, callback) {
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.unlinkBase, [filename], callback);
      }
      symlinkBase(targetFilename, pathFilename) {
        const pathSteps = filenameToSteps(pathFilename);
        const dirLink = this.getLinkParent(pathSteps);
        if (!dirLink)
          throw (0, util_1.createError)(
            ENOENT,
            "symlink",
            targetFilename,
            pathFilename,
          );
        const name = pathSteps[pathSteps.length - 1];
        if (dirLink.getChild(name))
          throw (0, util_1.createError)(
            EEXIST,
            "symlink",
            targetFilename,
            pathFilename,
          );
        const symlink = dirLink.createChild(name);
        symlink.getNode().makeSymlink(filenameToSteps(targetFilename));
        return symlink;
      }
      // `type` argument works only on Windows.
      symlinkSync(target, path, type) {
        const targetFilename = (0, util_1.pathToFilename)(target);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.symlinkBase(targetFilename, pathFilename);
      }
      symlink(target, path, a, b) {
        const callback = (0, util_1.validateCallback)(
          typeof a === "function" ? a : b,
        );
        const targetFilename = (0, util_1.pathToFilename)(target);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(
          this.symlinkBase,
          [targetFilename, pathFilename],
          callback,
        );
      }
      realpathBase(filename, encoding) {
        const steps = filenameToSteps(filename);
        const realLink = this.getResolvedLink(steps);
        if (!realLink)
          throw (0, util_1.createError)(ENOENT, "realpath", filename);
        return (0, encoding_1.strToEncoding)(
          realLink.getPath() || "/",
          encoding,
        );
      }
      realpathSync(path, options) {
        return this.realpathBase(
          (0, util_1.pathToFilename)(path),
          (0, options_1.getRealpathOptions)(options).encoding,
        );
      }
      realpath(path, a, b) {
        const [opts, callback] = (0, options_1.getRealpathOptsAndCb)(a, b);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(
          this.realpathBase,
          [pathFilename, opts.encoding],
          callback,
        );
      }
      lstatBase(filename, bigint = false, throwIfNoEntry = false) {
        const link = this.getLink(filenameToSteps(filename));
        if (link) {
          return Stats_1.default.build(link.getNode(), bigint);
        } else if (!throwIfNoEntry) {
          return void 0;
        } else {
          throw (0, util_1.createError)(ENOENT, "lstat", filename);
        }
      }
      lstatSync(path, options) {
        const { throwIfNoEntry = true, bigint = false } = (0,
        options_1.getStatOptions)(options);
        return this.lstatBase(
          (0, util_1.pathToFilename)(path),
          bigint,
          throwIfNoEntry,
        );
      }
      lstat(path, a, b) {
        const [{ throwIfNoEntry = true, bigint = false }, callback] = (0,
        options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(
          this.lstatBase,
          [(0, util_1.pathToFilename)(path), bigint, throwIfNoEntry],
          callback,
        );
      }
      statBase(filename, bigint = false, throwIfNoEntry = true) {
        const link = this.getResolvedLink(filenameToSteps(filename));
        if (link) {
          return Stats_1.default.build(link.getNode(), bigint);
        } else if (!throwIfNoEntry) {
          return void 0;
        } else {
          throw (0, util_1.createError)(ENOENT, "stat", filename);
        }
      }
      statSync(path, options) {
        const { bigint = true, throwIfNoEntry = true } = (0,
        options_1.getStatOptions)(options);
        return this.statBase(
          (0, util_1.pathToFilename)(path),
          bigint,
          throwIfNoEntry,
        );
      }
      stat(path, a, b) {
        const [{ bigint = false, throwIfNoEntry = true }, callback] = (0,
        options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(
          this.statBase,
          [(0, util_1.pathToFilename)(path), bigint, throwIfNoEntry],
          callback,
        );
      }
      fstatBase(fd, bigint = false) {
        const file = this.getFileByFd(fd);
        if (!file) throw (0, util_1.createError)(EBADF, "fstat");
        return Stats_1.default.build(file.node, bigint);
      }
      fstatSync(fd, options) {
        return this.fstatBase(
          fd,
          (0, options_1.getStatOptions)(options).bigint,
        );
      }
      fstat(fd, a, b) {
        const [opts, callback] = (0, options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(this.fstatBase, [fd, opts.bigint], callback);
      }
      renameBase(oldPathFilename, newPathFilename) {
        const link = this.getLink(filenameToSteps(oldPathFilename));
        if (!link)
          throw (0, util_1.createError)(
            ENOENT,
            "rename",
            oldPathFilename,
            newPathFilename,
          );
        const newPathSteps = filenameToSteps(newPathFilename);
        const newPathDirLink = this.getLinkParent(newPathSteps);
        if (!newPathDirLink)
          throw (0, util_1.createError)(
            ENOENT,
            "rename",
            oldPathFilename,
            newPathFilename,
          );
        const oldLinkParent = link.parent;
        if (oldLinkParent) {
          oldLinkParent.deleteChild(link);
        }
        const name = newPathSteps[newPathSteps.length - 1];
        link.name = name;
        link.steps = [...newPathDirLink.steps, name];
        newPathDirLink.setChild(link.getName(), link);
      }
      renameSync(oldPath, newPath) {
        const oldPathFilename = (0, util_1.pathToFilename)(oldPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.renameBase(oldPathFilename, newPathFilename);
      }
      rename(oldPath, newPath, callback) {
        const oldPathFilename = (0, util_1.pathToFilename)(oldPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.wrapAsync(
          this.renameBase,
          [oldPathFilename, newPathFilename],
          callback,
        );
      }
      existsBase(filename) {
        return !!this.statBase(filename);
      }
      existsSync(path) {
        try {
          return this.existsBase((0, util_1.pathToFilename)(path));
        } catch (err) {
          return false;
        }
      }
      exists(path, callback) {
        const filename = (0, util_1.pathToFilename)(path);
        if (typeof callback !== "function") throw Error(constants_2.ERRSTR.CB);
        (0, setImmediate_1.default)(() => {
          try {
            callback(this.existsBase(filename));
          } catch (err) {
            callback(false);
          }
        });
      }
      accessBase(filename, mode) {
        const link = this.getLinkOrThrow(filename, "access");
      }
      accessSync(path, mode = F_OK) {
        const filename = (0, util_1.pathToFilename)(path);
        mode = mode | 0;
        this.accessBase(filename, mode);
      }
      access(path, a, b) {
        let mode = F_OK;
        let callback;
        if (typeof a !== "function") {
          mode = a | 0;
          callback = (0, util_1.validateCallback)(b);
        } else {
          callback = a;
        }
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.accessBase, [filename, mode], callback);
      }
      appendFileSync(id, data, options) {
        const opts = (0, options_1.getAppendFileOpts)(options);
        if (!opts.flag || (0, util_1.isFd)(id)) opts.flag = "a";
        this.writeFileSync(id, data, opts);
      }
      appendFile(id, data, a, b) {
        const [opts, callback] = (0, options_1.getAppendFileOptsAndCb)(a, b);
        if (!opts.flag || (0, util_1.isFd)(id)) opts.flag = "a";
        this.writeFile(id, data, opts, callback);
      }
      readdirBase(filename, options) {
        const steps = filenameToSteps(filename);
        const link = this.getResolvedLink(steps);
        if (!link) throw (0, util_1.createError)(ENOENT, "readdir", filename);
        const node = link.getNode();
        if (!node.isDirectory())
          throw (0, util_1.createError)(ENOTDIR, "scandir", filename);
        const list = [];
        for (const name of link.children.keys()) {
          const child = link.getChild(name);
          if (!child || name === "." || name === "..") continue;
          list.push(Dirent_1.default.build(child, options.encoding));
          if (options.recursive && child.children.size) {
            const recurseOptions = Object.assign(Object.assign({}, options), {
              recursive: true,
              withFileTypes: true,
            });
            const childList = this.readdirBase(child.getPath(), recurseOptions);
            list.push(...childList);
          }
        }
        if (!util_1.isWin && options.encoding !== "buffer")
          list.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
          });
        if (options.withFileTypes) return list;
        let filename2 = filename;
        if (util_1.isWin) {
          filename2 = filename2.replace(/\\/g, "/");
        }
        return list.map((dirent) => {
          if (options.recursive) {
            return dirent.path.replace(filename2 + pathModule.posix.sep, "");
          }
          return dirent.name;
        });
      }
      readdirSync(path, options) {
        const opts = (0, options_1.getReaddirOptions)(options);
        const filename = (0, util_1.pathToFilename)(path);
        return this.readdirBase(filename, opts);
      }
      readdir(path, a, b) {
        const [options, callback] = (0, options_1.getReaddirOptsAndCb)(a, b);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.readdirBase, [filename, options], callback);
      }
      readlinkBase(filename, encoding) {
        const link = this.getLinkOrThrow(filename, "readlink");
        const node = link.getNode();
        if (!node.isSymlink())
          throw (0, util_1.createError)(EINVAL, "readlink", filename);
        const str = sep + node.symlink.join(sep);
        return (0, encoding_1.strToEncoding)(str, encoding);
      }
      readlinkSync(path, options) {
        const opts = (0, options_1.getDefaultOpts)(options);
        const filename = (0, util_1.pathToFilename)(path);
        return this.readlinkBase(filename, opts.encoding);
      }
      readlink(path, a, b) {
        const [opts, callback] = (0, options_1.getDefaultOptsAndCb)(a, b);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.readlinkBase, [filename, opts.encoding], callback);
      }
      fsyncBase(fd) {
        this.getFileByFdOrThrow(fd, "fsync");
      }
      fsyncSync(fd) {
        this.fsyncBase(fd);
      }
      fsync(fd, callback) {
        this.wrapAsync(this.fsyncBase, [fd], callback);
      }
      fdatasyncBase(fd) {
        this.getFileByFdOrThrow(fd, "fdatasync");
      }
      fdatasyncSync(fd) {
        this.fdatasyncBase(fd);
      }
      fdatasync(fd, callback) {
        this.wrapAsync(this.fdatasyncBase, [fd], callback);
      }
      ftruncateBase(fd, len) {
        const file = this.getFileByFdOrThrow(fd, "ftruncate");
        file.truncate(len);
      }
      ftruncateSync(fd, len) {
        this.ftruncateBase(fd, len);
      }
      ftruncate(fd, a, b) {
        const len = typeof a === "number" ? a : 0;
        const callback = (0, util_1.validateCallback)(
          typeof a === "number" ? b : a,
        );
        this.wrapAsync(this.ftruncateBase, [fd, len], callback);
      }
      truncateBase(path, len) {
        const fd = this.openSync(path, "r+");
        try {
          this.ftruncateSync(fd, len);
        } finally {
          this.closeSync(fd);
        }
      }
      /**
       * `id` should be a file descriptor or a path. `id` as file descriptor will
       * not be supported soon.
       */
      truncateSync(id, len) {
        if ((0, util_1.isFd)(id)) return this.ftruncateSync(id, len);
        this.truncateBase(id, len);
      }
      truncate(id, a, b) {
        const len = typeof a === "number" ? a : 0;
        const callback = (0, util_1.validateCallback)(
          typeof a === "number" ? b : a,
        );
        if ((0, util_1.isFd)(id)) return this.ftruncate(id, len, callback);
        this.wrapAsync(this.truncateBase, [id, len], callback);
      }
      futimesBase(fd, atime, mtime) {
        const file = this.getFileByFdOrThrow(fd, "futimes");
        const node = file.node;
        node.atime = new Date(atime * 1e3);
        node.mtime = new Date(mtime * 1e3);
      }
      futimesSync(fd, atime, mtime) {
        this.futimesBase(fd, toUnixTimestamp(atime), toUnixTimestamp(mtime));
      }
      futimes(fd, atime, mtime, callback) {
        this.wrapAsync(
          this.futimesBase,
          [fd, toUnixTimestamp(atime), toUnixTimestamp(mtime)],
          callback,
        );
      }
      utimesBase(filename, atime, mtime) {
        const fd = this.openSync(filename, "r");
        try {
          this.futimesBase(fd, atime, mtime);
        } finally {
          this.closeSync(fd);
        }
      }
      utimesSync(path, atime, mtime) {
        this.utimesBase(
          (0, util_1.pathToFilename)(path),
          toUnixTimestamp(atime),
          toUnixTimestamp(mtime),
        );
      }
      utimes(path, atime, mtime, callback) {
        this.wrapAsync(
          this.utimesBase,
          [
            (0, util_1.pathToFilename)(path),
            toUnixTimestamp(atime),
            toUnixTimestamp(mtime),
          ],
          callback,
        );
      }
      mkdirBase(filename, modeNum) {
        const steps = filenameToSteps(filename);
        if (!steps.length) {
          throw (0, util_1.createError)(EEXIST, "mkdir", filename);
        }
        const dir = this.getLinkParentAsDirOrThrow(filename, "mkdir");
        const name = steps[steps.length - 1];
        if (dir.getChild(name))
          throw (0, util_1.createError)(EEXIST, "mkdir", filename);
        dir.createChild(name, this.createNode(true, modeNum));
      }
      /**
       * Creates directory tree recursively.
       * @param filename
       * @param modeNum
       */
      mkdirpBase(filename, modeNum) {
        const fullPath = resolve(filename);
        const fullPathSansSlash = fullPath.substring(1);
        const steps = !fullPathSansSlash ? [] : fullPathSansSlash.split(sep);
        let link = this.root;
        let created = false;
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (!link.getNode().isDirectory())
            throw (0, util_1.createError)(ENOTDIR, "mkdir", link.getPath());
          const child = link.getChild(step);
          if (child) {
            if (child.getNode().isDirectory()) link = child;
            else
              throw (0, util_1.createError)(ENOTDIR, "mkdir", child.getPath());
          } else {
            link = link.createChild(step, this.createNode(true, modeNum));
            created = true;
          }
        }
        return created ? fullPath : void 0;
      }
      mkdirSync(path, options) {
        const opts = (0, options_1.getMkdirOptions)(options);
        const modeNum = (0, util_1.modeToNumber)(opts.mode, 511);
        const filename = (0, util_1.pathToFilename)(path);
        if (opts.recursive) return this.mkdirpBase(filename, modeNum);
        this.mkdirBase(filename, modeNum);
      }
      mkdir(path, a, b) {
        const opts = (0, options_1.getMkdirOptions)(a);
        const callback = (0, util_1.validateCallback)(
          typeof a === "function" ? a : b,
        );
        const modeNum = (0, util_1.modeToNumber)(opts.mode, 511);
        const filename = (0, util_1.pathToFilename)(path);
        if (opts.recursive)
          this.wrapAsync(this.mkdirpBase, [filename, modeNum], callback);
        else this.wrapAsync(this.mkdirBase, [filename, modeNum], callback);
      }
      mkdtempBase(prefix, encoding, retry = 5) {
        const filename = prefix + (0, util_1.genRndStr6)();
        try {
          this.mkdirBase(
            filename,
            511,
            /* MODE.DIR */
          );
          return (0, encoding_1.strToEncoding)(filename, encoding);
        } catch (err) {
          if (err.code === EEXIST) {
            if (retry > 1) return this.mkdtempBase(prefix, encoding, retry - 1);
            else throw Error("Could not create temp dir.");
          } else throw err;
        }
      }
      mkdtempSync(prefix, options) {
        const { encoding } = (0, options_1.getDefaultOpts)(options);
        if (!prefix || typeof prefix !== "string")
          throw new TypeError("filename prefix is required");
        (0, util_1.nullCheck)(prefix);
        return this.mkdtempBase(prefix, encoding);
      }
      mkdtemp(prefix, a, b) {
        const [{ encoding }, callback] = (0, options_1.getDefaultOptsAndCb)(
          a,
          b,
        );
        if (!prefix || typeof prefix !== "string")
          throw new TypeError("filename prefix is required");
        if (!(0, util_1.nullCheck)(prefix)) return;
        this.wrapAsync(this.mkdtempBase, [prefix, encoding], callback);
      }
      rmdirBase(filename, options) {
        const opts = (0, options_1.getRmdirOptions)(options);
        const link = this.getLinkAsDirOrThrow(filename, "rmdir");
        if (link.length && !opts.recursive)
          throw (0, util_1.createError)(ENOTEMPTY, "rmdir", filename);
        this.deleteLink(link);
      }
      rmdirSync(path, options) {
        this.rmdirBase((0, util_1.pathToFilename)(path), options);
      }
      rmdir(path, a, b) {
        const opts = (0, options_1.getRmdirOptions)(a);
        const callback = (0, util_1.validateCallback)(
          typeof a === "function" ? a : b,
        );
        this.wrapAsync(
          this.rmdirBase,
          [(0, util_1.pathToFilename)(path), opts],
          callback,
        );
      }
      rmBase(filename, options = {}) {
        const link = this.getResolvedLink(filename);
        if (!link) {
          if (!options.force)
            throw (0, util_1.createError)(ENOENT, "stat", filename);
          return;
        }
        if (link.getNode().isDirectory()) {
          if (!options.recursive) {
            throw (0, util_1.createError)(ERR_FS_EISDIR, "rm", filename);
          }
        }
        this.deleteLink(link);
      }
      rmSync(path, options) {
        this.rmBase((0, util_1.pathToFilename)(path), options);
      }
      rm(path, a, b) {
        const [opts, callback] = (0, options_1.getRmOptsAndCb)(a, b);
        this.wrapAsync(
          this.rmBase,
          [(0, util_1.pathToFilename)(path), opts],
          callback,
        );
      }
      fchmodBase(fd, modeNum) {
        const file = this.getFileByFdOrThrow(fd, "fchmod");
        file.chmod(modeNum);
      }
      fchmodSync(fd, mode) {
        this.fchmodBase(fd, (0, util_1.modeToNumber)(mode));
      }
      fchmod(fd, mode, callback) {
        this.wrapAsync(
          this.fchmodBase,
          [fd, (0, util_1.modeToNumber)(mode)],
          callback,
        );
      }
      chmodBase(filename, modeNum) {
        const fd = this.openSync(filename, "r");
        try {
          this.fchmodBase(fd, modeNum);
        } finally {
          this.closeSync(fd);
        }
      }
      chmodSync(path, mode) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.chmodBase(filename, modeNum);
      }
      chmod(path, mode, callback) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.chmodBase, [filename, modeNum], callback);
      }
      lchmodBase(filename, modeNum) {
        const fd = this.openBase(filename, O_RDWR, 0, false);
        try {
          this.fchmodBase(fd, modeNum);
        } finally {
          this.closeSync(fd);
        }
      }
      lchmodSync(path, mode) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.lchmodBase(filename, modeNum);
      }
      lchmod(path, mode, callback) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.lchmodBase, [filename, modeNum], callback);
      }
      fchownBase(fd, uid, gid) {
        this.getFileByFdOrThrow(fd, "fchown").chown(uid, gid);
      }
      fchownSync(fd, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.fchownBase(fd, uid, gid);
      }
      fchown(fd, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(this.fchownBase, [fd, uid, gid], callback);
      }
      chownBase(filename, uid, gid) {
        const link = this.getResolvedLinkOrThrow(filename, "chown");
        const node = link.getNode();
        node.chown(uid, gid);
      }
      chownSync(path, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.chownBase((0, util_1.pathToFilename)(path), uid, gid);
      }
      chown(path, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(
          this.chownBase,
          [(0, util_1.pathToFilename)(path), uid, gid],
          callback,
        );
      }
      lchownBase(filename, uid, gid) {
        this.getLinkOrThrow(filename, "lchown").getNode().chown(uid, gid);
      }
      lchownSync(path, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.lchownBase((0, util_1.pathToFilename)(path), uid, gid);
      }
      lchown(path, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(
          this.lchownBase,
          [(0, util_1.pathToFilename)(path), uid, gid],
          callback,
        );
      }
      watchFile(path, a, b) {
        const filename = (0, util_1.pathToFilename)(path);
        let options = a;
        let listener = b;
        if (typeof options === "function") {
          listener = a;
          options = null;
        }
        if (typeof listener !== "function") {
          throw Error('"watchFile()" requires a listener function');
        }
        let interval = 5007;
        let persistent = true;
        if (options && typeof options === "object") {
          if (typeof options.interval === "number") interval = options.interval;
          if (typeof options.persistent === "boolean")
            persistent = options.persistent;
        }
        let watcher = this.statWatchers[filename];
        if (!watcher) {
          watcher = new this.StatWatcher();
          watcher.start(filename, persistent, interval);
          this.statWatchers[filename] = watcher;
        }
        watcher.addListener("change", listener);
        return watcher;
      }
      unwatchFile(path, listener) {
        const filename = (0, util_1.pathToFilename)(path);
        const watcher = this.statWatchers[filename];
        if (!watcher) return;
        if (typeof listener === "function") {
          watcher.removeListener("change", listener);
        } else {
          watcher.removeAllListeners("change");
        }
        if (watcher.listenerCount("change") === 0) {
          watcher.stop();
          delete this.statWatchers[filename];
        }
      }
      createReadStream(path, options) {
        return new this.ReadStream(path, options);
      }
      createWriteStream(path, options) {
        return new this.WriteStream(path, options);
      }
      // watch(path: PathLike): FSWatcher;
      // watch(path: PathLike, options?: IWatchOptions | string): FSWatcher;
      watch(path, options, listener) {
        const filename = (0, util_1.pathToFilename)(path);
        let givenOptions = options;
        if (typeof options === "function") {
          listener = options;
          givenOptions = null;
        }
        let { persistent, recursive, encoding } = (0, options_1.getDefaultOpts)(
          givenOptions,
        );
        if (persistent === void 0) persistent = true;
        if (recursive === void 0) recursive = false;
        const watcher = new this.FSWatcher();
        watcher.start(filename, persistent, recursive, encoding);
        if (listener) {
          watcher.addListener("change", listener);
        }
        return watcher;
      }
    };
    exports.Volume = Volume;
    Volume.fd = 2147483647;
    function emitStop(self) {
      self.emit("stop");
    }
    var StatWatcher = class extends events_1.EventEmitter {
      constructor(vol) {
        super();
        this.onInterval = () => {
          try {
            const stats = this.vol.statSync(this.filename);
            if (this.hasChanged(stats)) {
              this.emit("change", stats, this.prev);
              this.prev = stats;
            }
          } finally {
            this.loop();
          }
        };
        this.vol = vol;
      }
      loop() {
        this.timeoutRef = this.setTimeout(this.onInterval, this.interval);
      }
      hasChanged(stats) {
        if (stats.mtimeMs > this.prev.mtimeMs) return true;
        if (stats.nlink !== this.prev.nlink) return true;
        return false;
      }
      start(path, persistent = true, interval = 5007) {
        this.filename = (0, util_1.pathToFilename)(path);
        this.setTimeout = persistent
          ? setTimeout.bind(
              typeof globalThis !== "undefined" ? globalThis : global,
            )
          : setTimeoutUnref_1.default;
        this.interval = interval;
        this.prev = this.vol.statSync(this.filename);
        this.loop();
      }
      stop() {
        clearTimeout(this.timeoutRef);
        (0, queueMicrotask_1.default)(() => {
          emitStop.call(this, this);
        });
      }
    };
    exports.StatWatcher = StatWatcher;
    var pool;
    function allocNewPool(poolSize) {
      pool = (0, buffer_1.bufferAllocUnsafe)(poolSize);
      pool.used = 0;
    }
    util.inherits(FsReadStream, stream_1.Readable);
    exports.ReadStream = FsReadStream;
    function FsReadStream(vol, path, options) {
      if (!(this instanceof FsReadStream))
        return new FsReadStream(vol, path, options);
      this._vol = vol;
      options = Object.assign({}, (0, options_1.getOptions)(options, {}));
      if (options.highWaterMark === void 0) options.highWaterMark = 64 * 1024;
      stream_1.Readable.call(this, options);
      this.path = (0, util_1.pathToFilename)(path);
      this.fd = options.fd === void 0 ? null : options.fd;
      this.flags = options.flags === void 0 ? "r" : options.flags;
      this.mode = options.mode === void 0 ? 438 : options.mode;
      this.start = options.start;
      this.end = options.end;
      this.autoClose = options.autoClose === void 0 ? true : options.autoClose;
      this.pos = void 0;
      this.bytesRead = 0;
      if (this.start !== void 0) {
        if (typeof this.start !== "number") {
          throw new TypeError('"start" option must be a Number');
        }
        if (this.end === void 0) {
          this.end = Infinity;
        } else if (typeof this.end !== "number") {
          throw new TypeError('"end" option must be a Number');
        }
        if (this.start > this.end) {
          throw new Error('"start" option must be <= "end" option');
        }
        this.pos = this.start;
      }
      if (typeof this.fd !== "number") this.open();
      this.on("end", function () {
        if (this.autoClose) {
          if (this.destroy) this.destroy();
        }
      });
    }
    FsReadStream.prototype.open = function () {
      var self = this;
      this._vol.open(this.path, this.flags, this.mode, (er, fd) => {
        if (er) {
          if (self.autoClose) {
            if (self.destroy) self.destroy();
          }
          self.emit("error", er);
          return;
        }
        self.fd = fd;
        self.emit("open", fd);
        self.read();
      });
    };
    FsReadStream.prototype._read = function (n) {
      if (typeof this.fd !== "number") {
        return this.once("open", function () {
          this._read(n);
        });
      }
      if (this.destroyed) return;
      if (!pool || pool.length - pool.used < kMinPoolSpace) {
        allocNewPool(this._readableState.highWaterMark);
      }
      var thisPool = pool;
      var toRead = Math.min(pool.length - pool.used, n);
      var start = pool.used;
      if (this.pos !== void 0)
        toRead = Math.min(this.end - this.pos + 1, toRead);
      if (toRead <= 0) return this.push(null);
      var self = this;
      this._vol.read(this.fd, pool, pool.used, toRead, this.pos, onread);
      if (this.pos !== void 0) this.pos += toRead;
      pool.used += toRead;
      function onread(er, bytesRead) {
        if (er) {
          if (self.autoClose && self.destroy) {
            self.destroy();
          }
          self.emit("error", er);
        } else {
          var b = null;
          if (bytesRead > 0) {
            self.bytesRead += bytesRead;
            b = thisPool.slice(start, start + bytesRead);
          }
          self.push(b);
        }
      }
    };
    FsReadStream.prototype._destroy = function (err, cb) {
      this.close((err2) => {
        cb(err || err2);
      });
    };
    FsReadStream.prototype.close = function (cb) {
      var _a;
      if (cb) this.once("close", cb);
      if (this.closed || typeof this.fd !== "number") {
        if (typeof this.fd !== "number") {
          this.once("open", closeOnOpen);
          return;
        }
        return (0, queueMicrotask_1.default)(() => this.emit("close"));
      }
      if (
        typeof ((_a = this._readableState) === null || _a === void 0
          ? void 0
          : _a.closed) === "boolean"
      ) {
        this._readableState.closed = true;
      } else {
        this.closed = true;
      }
      this._vol.close(this.fd, (er) => {
        if (er) this.emit("error", er);
        else this.emit("close");
      });
      this.fd = null;
    };
    function closeOnOpen(fd) {
      this.close();
    }
    util.inherits(FsWriteStream, stream_1.Writable);
    exports.WriteStream = FsWriteStream;
    function FsWriteStream(vol, path, options) {
      if (!(this instanceof FsWriteStream))
        return new FsWriteStream(vol, path, options);
      this._vol = vol;
      options = Object.assign({}, (0, options_1.getOptions)(options, {}));
      stream_1.Writable.call(this, options);
      this.path = (0, util_1.pathToFilename)(path);
      this.fd = options.fd === void 0 ? null : options.fd;
      this.flags = options.flags === void 0 ? "w" : options.flags;
      this.mode = options.mode === void 0 ? 438 : options.mode;
      this.start = options.start;
      this.autoClose =
        options.autoClose === void 0 ? true : !!options.autoClose;
      this.pos = void 0;
      this.bytesWritten = 0;
      this.pending = true;
      if (this.start !== void 0) {
        if (typeof this.start !== "number") {
          throw new TypeError('"start" option must be a Number');
        }
        if (this.start < 0) {
          throw new Error('"start" must be >= zero');
        }
        this.pos = this.start;
      }
      if (options.encoding) this.setDefaultEncoding(options.encoding);
      if (typeof this.fd !== "number") this.open();
      this.once("finish", function () {
        if (this.autoClose) {
          this.close();
        }
      });
    }
    FsWriteStream.prototype.open = function () {
      this._vol.open(
        this.path,
        this.flags,
        this.mode,
        function (er, fd) {
          if (er) {
            if (this.autoClose && this.destroy) {
              this.destroy();
            }
            this.emit("error", er);
            return;
          }
          this.fd = fd;
          this.pending = false;
          this.emit("open", fd);
        }.bind(this),
      );
    };
    FsWriteStream.prototype._write = function (data, encoding, cb) {
      if (!(data instanceof buffer_1.Buffer || data instanceof Uint8Array))
        return this.emit("error", new Error("Invalid data"));
      if (typeof this.fd !== "number") {
        return this.once("open", function () {
          this._write(data, encoding, cb);
        });
      }
      var self = this;
      this._vol.write(this.fd, data, 0, data.length, this.pos, (er, bytes) => {
        if (er) {
          if (self.autoClose && self.destroy) {
            self.destroy();
          }
          return cb(er);
        }
        self.bytesWritten += bytes;
        cb();
      });
      if (this.pos !== void 0) this.pos += data.length;
    };
    FsWriteStream.prototype._writev = function (data, cb) {
      if (typeof this.fd !== "number") {
        return this.once("open", function () {
          this._writev(data, cb);
        });
      }
      const self = this;
      const len = data.length;
      const chunks = new Array(len);
      var size = 0;
      for (var i = 0; i < len; i++) {
        var chunk = data[i].chunk;
        chunks[i] = chunk;
        size += chunk.length;
      }
      const buf = buffer_1.Buffer.concat(chunks);
      this._vol.write(this.fd, buf, 0, buf.length, this.pos, (er, bytes) => {
        if (er) {
          if (self.destroy) self.destroy();
          return cb(er);
        }
        self.bytesWritten += bytes;
        cb();
      });
      if (this.pos !== void 0) this.pos += size;
    };
    FsWriteStream.prototype.close = function (cb) {
      var _a;
      if (cb) this.once("close", cb);
      if (this.closed || typeof this.fd !== "number") {
        if (typeof this.fd !== "number") {
          this.once("open", closeOnOpen);
          return;
        }
        return (0, queueMicrotask_1.default)(() => this.emit("close"));
      }
      if (
        typeof ((_a = this._writableState) === null || _a === void 0
          ? void 0
          : _a.closed) === "boolean"
      ) {
        this._writableState.closed = true;
      } else {
        this.closed = true;
      }
      this._vol.close(this.fd, (er) => {
        if (er) this.emit("error", er);
        else this.emit("close");
      });
      this.fd = null;
    };
    FsWriteStream.prototype._destroy = FsReadStream.prototype._destroy;
    FsWriteStream.prototype.destroySoon = FsWriteStream.prototype.end;
    var FSWatcher = class extends events_1.EventEmitter {
      constructor(vol) {
        super();
        this._filename = "";
        this._filenameEncoded = "";
        this._recursive = false;
        this._encoding = encoding_1.ENCODING_UTF8;
        this._listenerRemovers = /* @__PURE__ */ new Map();
        this._onParentChild = (link) => {
          if (link.getName() === this._getName()) {
            this._emit("rename");
          }
        };
        this._emit = (type) => {
          this.emit("change", type, this._filenameEncoded);
        };
        this._persist = () => {
          this._timer = setTimeout(this._persist, 1e6);
        };
        this._vol = vol;
      }
      _getName() {
        return this._steps[this._steps.length - 1];
      }
      start(
        path,
        persistent = true,
        recursive = false,
        encoding = encoding_1.ENCODING_UTF8,
      ) {
        this._filename = (0, util_1.pathToFilename)(path);
        this._steps = filenameToSteps(this._filename);
        this._filenameEncoded = (0, encoding_1.strToEncoding)(this._filename);
        this._recursive = recursive;
        this._encoding = encoding;
        try {
          this._link = this._vol.getLinkOrThrow(this._filename, "FSWatcher");
        } catch (err) {
          const error = new Error(`watch ${this._filename} ${err.code}`);
          error.code = err.code;
          error.errno = err.code;
          throw error;
        }
        const watchLinkNodeChanged = (link) => {
          var _a;
          const filepath = link.getPath();
          const node = link.getNode();
          const onNodeChange = () => {
            let filename = relative(this._filename, filepath);
            if (!filename) {
              filename = this._getName();
            }
            return this.emit("change", "change", filename);
          };
          node.on("change", onNodeChange);
          const removers =
            (_a = this._listenerRemovers.get(node.ino)) !== null &&
            _a !== void 0
              ? _a
              : [];
          removers.push(() => node.removeListener("change", onNodeChange));
          this._listenerRemovers.set(node.ino, removers);
        };
        const watchLinkChildrenChanged = (link) => {
          var _a;
          const node = link.getNode();
          const onLinkChildAdd = (l) => {
            this.emit(
              "change",
              "rename",
              relative(this._filename, l.getPath()),
            );
            setTimeout(() => {
              watchLinkNodeChanged(l);
              watchLinkChildrenChanged(l);
            });
          };
          const onLinkChildDelete = (l) => {
            const removeLinkNodeListeners = (curLink) => {
              const ino = curLink.getNode().ino;
              const removers2 = this._listenerRemovers.get(ino);
              if (removers2) {
                removers2.forEach((r) => r());
                this._listenerRemovers.delete(ino);
              }
              for (const [name, childLink] of curLink.children.entries()) {
                if (childLink && name !== "." && name !== "..") {
                  removeLinkNodeListeners(childLink);
                }
              }
            };
            removeLinkNodeListeners(l);
            this.emit(
              "change",
              "rename",
              relative(this._filename, l.getPath()),
            );
          };
          for (const [name, childLink] of link.children.entries()) {
            if (childLink && name !== "." && name !== "..") {
              watchLinkNodeChanged(childLink);
            }
          }
          link.on("child:add", onLinkChildAdd);
          link.on("child:delete", onLinkChildDelete);
          const removers =
            (_a = this._listenerRemovers.get(node.ino)) !== null &&
            _a !== void 0
              ? _a
              : [];
          removers.push(() => {
            link.removeListener("child:add", onLinkChildAdd);
            link.removeListener("child:delete", onLinkChildDelete);
          });
          if (recursive) {
            for (const [name, childLink] of link.children.entries()) {
              if (childLink && name !== "." && name !== "..") {
                watchLinkChildrenChanged(childLink);
              }
            }
          }
        };
        watchLinkNodeChanged(this._link);
        watchLinkChildrenChanged(this._link);
        const parent = this._link.parent;
        if (parent) {
          parent.setMaxListeners(parent.getMaxListeners() + 1);
          parent.on("child:delete", this._onParentChild);
        }
        if (persistent) this._persist();
      }
      close() {
        clearTimeout(this._timer);
        this._listenerRemovers.forEach((removers) => {
          removers.forEach((r) => r());
        });
        this._listenerRemovers.clear();
        const parent = this._link.parent;
        if (parent) {
          parent.removeListener("child:delete", this._onParentChild);
        }
      }
    };
    exports.FSWatcher = FSWatcher;
  },
});

// node_modules/memfs/lib/node/lists/fsSynchronousApiList.js
var require_fsSynchronousApiList = __commonJS({
  "node_modules/memfs/lib/node/lists/fsSynchronousApiList.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fsSynchronousApiList = void 0;
    exports.fsSynchronousApiList = [
      "accessSync",
      "appendFileSync",
      "chmodSync",
      "chownSync",
      "closeSync",
      "copyFileSync",
      "existsSync",
      "fchmodSync",
      "fchownSync",
      "fdatasyncSync",
      "fstatSync",
      "fsyncSync",
      "ftruncateSync",
      "futimesSync",
      "lchmodSync",
      "lchownSync",
      "linkSync",
      "lstatSync",
      "mkdirSync",
      "mkdtempSync",
      "openSync",
      "readdirSync",
      "readFileSync",
      "readlinkSync",
      "readSync",
      "readvSync",
      "realpathSync",
      "renameSync",
      "rmdirSync",
      "rmSync",
      "statSync",
      "symlinkSync",
      "truncateSync",
      "unlinkSync",
      "utimesSync",
      "writeFileSync",
      "writeSync",
      "writevSync",
      // 'cpSync',
      // 'lutimesSync',
      // 'statfsSync',
    ];
  },
});

// node_modules/memfs/lib/node/lists/fsCallbackApiList.js
var require_fsCallbackApiList = __commonJS({
  "node_modules/memfs/lib/node/lists/fsCallbackApiList.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fsCallbackApiList = void 0;
    exports.fsCallbackApiList = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "createReadStream",
      "createWriteStream",
      "exists",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "read",
      "readv",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "unwatchFile",
      "utimes",
      "watch",
      "watchFile",
      "write",
      "writev",
      "writeFile",
    ];
  },
});

// node_modules/memfs/lib/index.js
var require_lib = __commonJS({
  "node_modules/memfs/lib/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.memfs =
      exports.fs =
      exports.createFsFromVolume =
      exports.vol =
      exports.Volume =
        void 0;
    var Stats_1 = require_Stats();
    var Dirent_1 = require_Dirent();
    var volume_1 = require_volume();
    var constants_1 = require_constants();
    var fsSynchronousApiList_1 = require_fsSynchronousApiList();
    var fsCallbackApiList_1 = require_fsCallbackApiList();
    var { F_OK, R_OK, W_OK, X_OK } = constants_1.constants;
    exports.Volume = volume_1.Volume;
    exports.vol = new volume_1.Volume();
    function createFsFromVolume(vol) {
      const fs = {
        F_OK,
        R_OK,
        W_OK,
        X_OK,
        constants: constants_1.constants,
        Stats: Stats_1.default,
        Dirent: Dirent_1.default,
      };
      for (const method of fsSynchronousApiList_1.fsSynchronousApiList)
        if (typeof vol[method] === "function")
          fs[method] = vol[method].bind(vol);
      for (const method of fsCallbackApiList_1.fsCallbackApiList)
        if (typeof vol[method] === "function")
          fs[method] = vol[method].bind(vol);
      fs.StatWatcher = vol.StatWatcher;
      fs.FSWatcher = vol.FSWatcher;
      fs.WriteStream = vol.WriteStream;
      fs.ReadStream = vol.ReadStream;
      fs.promises = vol.promises;
      fs._toUnixTimestamp = volume_1.toUnixTimestamp;
      fs.__vol = vol;
      return fs;
    }
    exports.createFsFromVolume = createFsFromVolume;
    exports.fs = createFsFromVolume(exports.vol);
    var memfs2 = (json = {}, cwd = "/") => {
      const vol = exports.Volume.fromNestedJSON(json, cwd);
      const fs = createFsFromVolume(vol);
      return { fs, vol };
    };
    exports.memfs = memfs2;
    module.exports = Object.assign(
      Object.assign({}, module.exports),
      exports.fs,
    );
    module.exports.semantic = true;
  },
});

// source.js
var import_memfs = __toESM(require_lib(), 1);
var source_default = import_memfs.default;
export { source_default as default };
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

assert/build/internal/util/comparisons.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)
*/
