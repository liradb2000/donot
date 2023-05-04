const url_prefix =
  process.env.NODE_ENV === "production"
    ? "/api/staff"
    : "https://localhost:8000/api/staff";

export const pure_prefix = `${
  process.env.NODE_ENV === "production" ? "" : "https://localhost:8000"
}`;

export const serverURL = {
  login: {
    url: `${url_prefix}/auth/in/`,
    method: "post",
    auth: false,
    withCredentials: false,
  },
  get_apart: {
    url: `${url_prefix}/get/apart/`,
    method: "post",
    auth: true,
    // withCredentials: false,
  },
  get_settings: {
    url: `${url_prefix}/settings/get/`,
    method: "post",
    auth: true,
  },
  visit: {
    url: `${url_prefix}/log/visit/`,
    method: "post",
    auth: true,
  },
  sendSMS: { url: `${url_prefix}/send/pwd/`, method: "post", auth: true },
};
