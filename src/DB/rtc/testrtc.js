/* eslint-disable @typescript-eslint/no-use-before-define */
const CHANNEL_LABEL = "P2P_CHAT_CHANNEL_LABEL";

export function createPeerConnection({
  remoteDescription,
  iceServers = [],
  onChannelOpen,
  onMessageReceived,
}) {
  const peerConnection = new RTCPeerConnection({
    iceServers,
  });
  let channelInstance;

  // peerConnection.oniceconnectionstatechange = () => {
  //   if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
  //     createOffer();
  //   }
  // };

  function setupChannelAsAHost() {
    try {
      channelInstance = peerConnection.createDataChannel(CHANNEL_LABEL);

      channelInstance.onopen = function () {
        onChannelOpen();
      };

      channelInstance.onmessage = function (event) {
        onMessageReceived(event.data);
      };
    } catch (e) {
      console.error("No data channel (peerConnection)", e);
    }
  }

  async function createOffer() {
    const description = await peerConnection.createOffer();
    peerConnection.setLocalDescription(description);
  }

  function setupChannelAsASlave() {
    peerConnection.ondatachannel = function ({ channel }) {
      channelInstance = channel;
      channelInstance.onopen = function () {
        onChannelOpen();
      };

      channelInstance.onmessage = function (event) {
        onMessageReceived(event.data);
      };
    };
  }

  async function createAnswer(remoteDescription) {
    await peerConnection.setRemoteDescription(JSON.parse(remoteDescription));
    const description = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(description);
  }

  function setAnswerDescription(answerDescription) {
    peerConnection.setRemoteDescription(JSON.parse(answerDescription));
  }

  function sendMessage(message) {
    if (channelInstance) {
      channelInstance.send(message);
    }
  }

  return new Promise((res) => {
    peerConnection.onicecandidate = function (e) {
      if (e.candidate === null && peerConnection.localDescription) {
        peerConnection.localDescription.sdp.replace("b=AS:30", "b=AS:1638400");
        res({
          localDescription: JSON.stringify(peerConnection.localDescription),
          setAnswerDescription,
          sendMessage,
        });
      }
    };

    if (!remoteDescription) {
      setupChannelAsAHost();
      createOffer();
    } else {
      setupChannelAsASlave();
      createAnswer(remoteDescription);
    }
  });
}
