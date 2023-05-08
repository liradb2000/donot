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
import {
  useMisc,
  useNetworkStatus,
  useTemplates,
  useUISettings,
} from "../../store";
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
  let unsubscribeFirestore = undefined;
  const setPeer = (remotePeerId, offer) => {
    // console.log(remotePeerId, offer, peerId);
    if (remotePeerId === peerId || peers.has(remotePeerId)) return;
    const newPeer = new Peer({
      initiator: !offer,
      trickle: false,
    });
    peers.set(remotePeerId, newPeer);

    newPeer.on("data", (resp) => {
      resp = decode(resp);
      // console.log(resp);
      // console.log('got a message from peer3: ' + messageOrResponse)
      const msg = {
        id: Date.now(),
        action: resp.action,
        peerId: remotePeerId,
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
        peers.delete(remotePeerId);
        return CurrentPeers.delete(remotePeerId);
      });
      newPeer.destroy();
    });
    newPeer.on("close", () => {
      useNetworkStatus.getState().setPeers((CurrentPeers, isKiosk) => {
        if (isKiosk) deleteDoc(doc(_room, peerId));
        peers.delete(remotePeerId);
        return CurrentPeers.delete(remotePeerId);
      });
      newPeer.destroy();
    });

    newPeer.on("connect", () => {
      useNetworkStatus.getState().setPeers((CurrentPeers, isKIOSK) => {
        if (isKIOSK) {
          const msg = {
            id: Date.now(),
            action: "reqSync",
            peerId: remotePeerId,
            data: undefined,
          };
          workerPipe(msg, msg.data ? [msg.data.buffer] : undefined);
          // newPeer.send(encode({ peerId, action: "reqSync" }));
          unsubscribeFirestore();
          unsubscribeFirestore = undefined;
          deleteDoc(doc(_room, peerId, "peers", remotePeerId));
          deleteDoc(doc(_room, peerId));
          deleteDoc(doc(_room, remotePeerId, "peers", peerId));
        } else {
          const templateStore = useTemplates.getState();
          const uiStore = useUISettings.getState();
          const miscStore = useMisc.getState();
          newPeer.send(
            encode({
              id: Date.now(),
              action: "sync-agreement",
              data: {
                agreement: templateStore.agreement,
                visit: templateStore.visit,
                print: templateStore.print,
              },
            })
          );
          newPeer.send(
            encode({
              id: Date.now(),
              action: "sync-ui",
              data: {
                base: uiStore.base,
                logo: uiStore.logo,
                bgPattern: uiStore.bgPattern,
                bgColor: uiStore.bgColor,
                buttonBGColor: uiStore.buttonBGColor,
                buttonFontColor: uiStore.buttonFontColor,
                fontColor: uiStore.fontColor,
              },
            })
          );
          newPeer.send(
            encode({
              id: Date.now(),
              action: "sync-misc",
              data: {
                day: miscStore.day,
                apartment: miscStore.apartment,
              },
            })
          );
          newPeer.send(
            encode({
              action: "netOnline",
              data: { online: !!useNetworkStatus.getState().socket },
            })
          );
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

  unsubscribeFirestore = onSnapshot(_peers, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      // console.log(change.doc.id, change.doc.data());
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
    reconnect() {
      unsubscribeFirestore?.();
      unsubscribeFirestore = onSnapshot(_peers, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // console.log(change.doc.id, change.doc.data());
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

      return getDocs(_room).then(({ docs: _docs }) => {
        _docs.forEach((__doc) => {
          if (__doc.data()?.isMaster) setPeer(__doc.id);
        });
      });
    },
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
      unsubscribeFirestore?.();
      unsubscribeFirestore = undefined;
      deleteDoc(doc(_room, peerId));
      for (let _peer of peers.values()) {
        _peer.destroy();
      }
    },
  };
  return handler;
}
