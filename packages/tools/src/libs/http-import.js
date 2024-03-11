export default class HTTPImport {
  constructor() {
    this._exports = null;

    this.wasmImports = {
      http: {
        httpGet: (url, headersString, callbackPointer) => {
          const stringHeaders = this._exports
            .__getString(headersString)
            .split(",,,,");

          stringHeaders.pop();

          const headers = {};

          for (let i = 0; i < stringHeaders.length; i++) {
            headers[stringHeaders[i]] = stringHeaders[i + 1];
            i++;
          }

          const callback = this.getFn(callbackPointer);

          crossFetch(this._exports.__getString(url), {
            headers: {
              ...headers,
            },
            mode: "no-cors",
            method: "GET",
          })
            .then((fetched) => {
              fetched.text().then((txt) => {
                callback("", this._exports.__newString(txt));
              });
            })
            .catch((err) => {
              callback(this._exports.__newString(err.message), "");
            });
        },
        httpPost: (url, headersString, data, callbackPointer) => {
          const stringHeaders = this._exports
            .__getString(headersString)
            .split(",,,,");

          stringHeaders.pop();

          const headers = {};

          for (let i = 0; i < stringHeaders.length; i++) {
            headers[stringHeaders[i]] = stringHeaders[i + 1];
            i++;
          }

          const callback = this.getFn(callbackPointer);

          crossFetch(this._exports.__getString(url), {
            headers: {
              ...headers,
            },
            mode: "no-cors",
            method: "POST",
            body: this._exports.__getString(data),
          })
            .then((fetched) => {
              fetched.text().then((txt) => {
                callback("", this._exports.__newString(txt));
              });
            })
            .catch((err) => {
              callback(this._exports.__newString(err.message), "");
            });
        },
      },
    };
  }

  get wasmExports() {
    return this._exports;
  }
  set wasmExports(e) {
    this._exports = e;
    this._exports.__getString = e.__getString;
    this._exports.__newString = e.__newString;
    this._exports.__newArray = e.__newArray;
    this._exports.__getArray = e.__getArray;
  }

  getFn(fnIndex) {
    if (!this.wasmExports)
      throw new Error(
        "Set .wasmExports after instantiating the Wasm module but before running the Wasm module.",
      );
    return this._exports.table.get(fnIndex);
  }
}
