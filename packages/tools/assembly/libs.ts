import { httpGet, httpPost } from "./imports";

export namespace http {
  export function get(
    url: string,
    headers: Map<string, string>,
    callback: (error: string, body: string) => void,
  ): void {
    let stringHeaders = "";

    let headerKeys = headers.keys();

    for (let i = 0; i < headerKeys.length; i++) {
      const headerKey = headerKeys[i];

      const headerValue = headers.get(headerKey);

      stringHeaders += "" + headerKey + ",,,," + headerValue + ",,,,";
    }

    httpGet(url, stringHeaders, load<i32>(changetype<usize>(callback)));
  }
  export function post(
    url: string,
    headers: Map<string, string>,
    data: string,
    callback: (error: string, body: string) => void,
  ): void {
    let stringHeaders = "";

    let headerKeys = headers.keys();

    for (let i = 0; i < headerKeys.length; i++) {
      const headerKey = headerKeys[i];

      const headerValue = headers.get(headerKey);

      stringHeaders += "" + headerKey + ",,,," + headerValue + ",,,,";
    }

    httpPost(url, stringHeaders, data, load<i32>(changetype<usize>(callback)));
  }
}
