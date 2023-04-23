import { Button, ButtonGroup, TextField } from "@mui/material";
import { createPeerConnection } from "./testrtc";
import { useCallback, useRef } from "react";

export function Main() {
  const ref = useRef();
  const peerConnectionRef = useRef();
  const onChannelOpen = useCallback(() => console.log("SIGNAL CONNECTED"), []);

  const onMessageReceived = useCallback((messageString) => {
    try {
      console.log(messageString);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const startAsHost = useCallback(async () => {
    if (typeof mode !== "undefined") return;

    peerConnectionRef.current = await createPeerConnection({
      iceServers: [],
      onMessageReceived,
      onChannelOpen,
    });
    ref.current.value = peerConnectionRef.current.localDescription;
  }, []);

  const setRemoteConnectionDescription = useCallback(() => {
    const connectionDescription = ref.current.value;
    if (!peerConnectionRef.current) return;

    peerConnectionRef.current.setAnswerDescription(connectionDescription);
  }, []);

  const startAsSlave = useCallback(async () => {
    const connectionDescription = ref.current.value;
    console.log(connectionDescription);
    if (typeof mode !== "undefined") return;

    peerConnectionRef.current = await createPeerConnection({
      iceServers: [],
      remoteDescription: connectionDescription,
      onMessageReceived,
      onChannelOpen,
    });
    console.log(
      "peerConnectionRef.current.localDescription",
      peerConnectionRef.current.localDescription
    );
    ref.current.value = peerConnectionRef.current.localDescription;
  }, []);

  return (
    <ButtonGroup>
      <Button onClick={startAsHost}>New</Button>
      <Button onClick={setRemoteConnectionDescription}>set</Button>
      <Button onClick={startAsSlave}>join</Button>
      <TextField multiline inputRef={ref} />
    </ButtonGroup>
  );
}
