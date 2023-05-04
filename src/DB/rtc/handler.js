/* eslint-disable no-restricted-globals */
import Peer from "simple-peer";
import { fireStore } from "./signal";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { encode, decode } from "cbor-x";
import { useNetworkStatus } from "../../store";
// import { useDBStatus } from "../statusStore";
// import { RxError, RxTypeError } from 'rxdb/types';
// import { newRxError } from 'rxdb/rx-error';

/**
 * Returns a connection handler that uses simple-peer and the signaling server.
 */
export async function getConnectionHandlerSimplePeer(
  site,
  topic,
  asKiosk = false,
  workerPipe
) {
  const peerId = nanoid();

  const _site = doc(fireStore, "ecole", `${site}`);
  const _room = collection(_site, topic);
  const _peers = collection(_room, peerId, "peers");

  const peers = new Map();

  const setPeer = (remotePeerId, offer) => {
    console.log(remotePeerId, offer, peerId);
    if (remotePeerId === peerId || peers.has(remotePeerId)) return;
    const newPeer = new Peer({
      initiator: !offer,
      trickle: false,
    });
    peers.set(remotePeerId, newPeer);

    newPeer.on("data", (resp) => {
      resp = decode(resp);
      console.log(resp);
      // console.log('got a message from peer3: ' + messageOrResponse)
      const msg = {
        id: Date.now(),
        action: resp.action,
        peerId: resp.peerId,
        data: resp.data
          ? resp.data.buffer
            ? resp.data
            : encode(resp.data)
          : undefined,
      };
      workerPipe(msg, msg.data ? [msg.data.buffer] : undefined);
    });
    newPeer.on("signal", (signal) => {
      setDoc(doc(_room, remotePeerId, "peers", peerId), signal);
    });

    newPeer.on("error", (error) => {
      useNetworkStatus.getState().setPeers((CurrentPeers) => {
        return CurrentPeers.delete(remotePeerId);
      });
    });
    newPeer.on("close", () => {
      useNetworkStatus.getState().setPeers((CurrentPeers, isKiosk) => {
        if (isKiosk || CurrentPeers.size === 0) deleteDoc(doc(_room, peerId));
        return CurrentPeers.delete(remotePeerId);
      });
    });

    newPeer.on("connect", () => {
      useNetworkStatus.getState().setPeers((CurrentPeers, isKIOSK) => {
        if (isKIOSK) {
          newPeer.send(encode({ peerId, action: "reqSync" }));
          unsubscribeFirestore();
          deleteDoc(doc(_room, peerId, "peers", remotePeerId));
          deleteDoc(doc(_room, peerId));
          deleteDoc(doc(_room, remotePeerId, "peers", peerId));
        }
        return CurrentPeers.set(remotePeerId, "");
      });
    });
    if (offer) newPeer.signal(offer);
  };

  // //init alreadt connection
  // await getDocs(_room).then(({ docs: _docs }) => {
  //   console.log("DOCS", _docs);
  //   const isManager = (_docs?.length ?? 0) === 0;
  //   useNetworkStatus.getState().setPeers(isManager);
  //   if (!isManager) {
  //     _docs.forEach((__doc) => {
  //       if (__doc.data()?.isMaster) setPeer(__doc.id);
  //     });
  //   } else {
  //     setDoc(doc(_room, peerId), { isMaster: true });
  //     workerPipe({ id: Date.now(), action: "init" });
  //   }
  // });
  if (asKiosk) {
    await getDocs(_room).then(({ docs: _docs }) => {
      _docs.forEach((__doc) => {
        if (__doc.data()?.isMaster) setPeer(__doc.id);
      });
    });
  } else {
    await getDocs(_room).then(({ docs: _docs }) => {
      _docs.forEach((__doc) => deleteDoc(__doc.ref));
    });
    setDoc(doc(_room, peerId), { isMaster: true });
    // workerPipe({ id: Date.now(), action: "init" });
  }

  const unsubscribeFirestore = onSnapshot(_peers, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change.doc.id, change.doc.data());
      // const _func = evtTypeFunc[change.type];
      if (change.type === "added") {
        const remotePeerId = change.doc.id;
        const _peer = peers.get(remotePeerId);
        if (!!_peer) _peer.signal(change.doc.data());
        else setPeer(change.doc.id, change.doc.data());
      } else if (change.type === "modified") {
      }
    });
  });

  const handler = {
    send(message) {
      const msg = !message.buffer ? encode({ ...message, peerId }) : message;
      for (let peer of peers.values()) {
        peer.send(msg);
      }
    },
    sendPeer(message, peerId) {
      peers
        .get(peerId)
        ?.send(!message.buffer ? encode({ ...message, peerId }) : message);
    },
    sendSelf({ id, action, peerId, data }) {
      const msg = {
        id,
        action,
        peerId: peerId ?? "$$self",
        data: data ? (!data.buffer ? encode(data) : data) : undefined,
      };
      workerPipe(msg, msg.data ? [msg.data.buffer] : undefined);
    },
    destroy() {
      unsubscribeFirestore();
    },
  };
  return handler;
}
