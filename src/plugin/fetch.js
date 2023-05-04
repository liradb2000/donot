import Axios from "axios";
import { authToken } from "../store";

export function fetch(
  {
    url,
    method = "get",
    auth = false,
    contentType = "application/json",
    lang = "en-us",
    ...etcOptions
  },
  payload
) {
  const headers = auth
    ? {
        Authorization: `Token ${authToken.current ?? ""}`,
        "Content-Type": contentType,
        "Accept-Language": lang,
      }
    : {
        "Content-Type": contentType,
        "Accept-Language": lang,
      };
  return new Promise((resolve, reject) =>
    Axios(url, {
      method: method,
      headers: headers,
      data: payload,
      ...etcOptions,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          reject(err);
          authToken.current = undefined;
          localStorage.removeItem("token");
          return;
        }
        reject(err);
      })
  );
}
