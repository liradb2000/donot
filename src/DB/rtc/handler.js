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
import { useDBStatus } from "../statusStore";
// import { RxError, RxTypeError } from 'rxdb/types';
// import { newRxError } from 'rxdb/rx-error';

/**
 * Returns a connection handler that uses simple-peer and the signaling server.
 */
export async function getConnectionHandlerSimplePeer(site, topic, workerPipe) {
  const peerId = nanoid();

  const _room = collection(fireStore, "ecole", `${site}`, topic);
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
        action: resp.type,
        peerId: resp.peerId,
        data: resp.data ? encode(resp.data) : undefined,
      };
      workerPipe(msg, msg.data ? [msg.data.buffer] : undefined);
    });
    newPeer.on("signal", (signal) => {
      setDoc(doc(_room, remotePeerId, "peers", peerId), signal);
    });

    newPeer.on("error", (error) => {
      useDBStatus.getState().setConnectState((isMaster, isConnect) => {
        if (isMaster) {
          isConnect.delete(remotePeerId);
          return new Set(isConnect);
        }
        return false;
      });
    });
    newPeer.on("close", () => {
      deleteDoc(doc(_room, peerId));
    });

    newPeer.on("connect", () => {
      useDBStatus.getState().setConnectState((isMaster, isConnect) => {
        if (!isMaster) {
          newPeer.send(encode({ peerId, type: "reqSync" }));
          unsubscribeFirestore();
          deleteDoc(doc(_room, peerId, "peers", remotePeerId));
          deleteDoc(doc(_room, peerId));
          deleteDoc(doc(_room, remotePeerId, "peers", peerId));
        }
        return isMaster ? new Set([...isConnect, remotePeerId]) : true;
      });
    });
    if (offer) newPeer.signal(offer);
  };

  //init alreadt connection
  await getDocs(_room).then(({ docs: _docs }) => {
    console.log("DOCS", _docs);
    const isMaster = (_docs?.length ?? 0) === 0;
    useDBStatus.getState().setMaster(isMaster);
    if (!isMaster) {
      _docs.forEach((__doc) => {
        if (__doc.data()?.isMaster) setPeer(__doc.id);
      });
    } else {
      setDoc(doc(_room, peerId), { isMaster: true });
      workerPipe({ id: Date.now(), action: "init" });
    }
  });

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
      const msg = !message.buffer ? encode(message) : message;
      for (let peer of peers.values()) {
        peer.send(msg);
      }
    },
    sendPeer(message, peerId) {
      peers.get(peerId)?.send(!message.buffer ? encode(message) : message);
    },
    destroy() {
      unsubscribeFirestore();
    },
  };
  return handler;
}
