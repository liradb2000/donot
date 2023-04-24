import React, { useEffect, useMemo, useRef } from "react";
import "./App.css";
import { Main } from "./DB/rtc/test";
import { encode } from "cbor-x";
import { Button, styled } from "@mui/material";
import { getConnectionHandlerSimplePeer } from "./DB/rtc/handler";
export const handler = {};
const StyledDiv = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  height: "100vh",
});
function App() {
  // const ws = useRef();
  async function handleConnect() {
    const ws = new Worker(new URL("./DB/index.worker.js", import.meta.url));
    // const connectData = encode({
    //   id: Date.now(),
    //   action: "connect",
    //   params: { site: "test", topic: "101" },
    // });
    // ws.postMessage(connectData, [connectData.buffer]);
    const _handler = await getConnectionHandlerSimplePeer(
      "test",
      "101",
      (msg, opt) => ws.postMessage(msg, opt)
    );
    Object.assign(handler, _handler);
    ws.onmessage = ({ data }) => {
      _handler.sendPeer(data.result, data.peerId);
    };
  }
  return (
    <StyledDiv>
      <Button onClick={handleConnect}>test</Button>
      <Main />
    </StyledDiv>
  );
}

export default App;
