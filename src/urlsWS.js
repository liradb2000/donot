export const ws_url =
  process.env.NODE_ENV === "production"
    ? `wss://${window.location.hostname}/ws/`
    : "wss://localhost:8000/ws/";
