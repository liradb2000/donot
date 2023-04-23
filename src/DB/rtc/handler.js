import { Subject } from "rxjs";
import {
  getFromMapOrThrow,
  PROMISE_RESOLVE_VOID,
  randomCouchString,
} from "rxdb/plugins/utils";
// import type {
//     P2PConnectionHandler,
//     P2PConnectionHandlerCreator,
//     P2PMessage,
//     P2PPeer,
//     PeerWithMessage,
//     PeerWithResponse
// } from './p2p-types';

import { default as Peer } from "simple-peer";
import { newRxError } from "rxdb";
import { fireStore } from "./signal";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";
// import { RxError, RxTypeError } from 'rxdb/types';
// import { newRxError } from 'rxdb/rx-error';

/**
 * Returns a connection handler that uses simple-peer and the signaling server.
 */
export function getConnectionHandlerSimplePeer(site) {
  const creator = (options) => {
    // const socket = undefined;

    const peerId = nanoid();
    // socket.emit("join", {
    //   room: options.topic,
    //   peerId,
    // });
    const _room = collection(fireStore, "ecole", `${site}`, options.topic);
    const _peers = collection(_room, peerId, "peers");
    // setDoc(_doc, null);

    const connect$ = new Subject();
    const disconnect$ = new Subject();
    const message$ = new Subject();
    const response$ = new Subject();
    const error$ = new Subject();

    const peers = new Map();
    
    const setPeer = (remotePeerId, offer) => {
      if (remotePeerId === peerId || peers.has(remotePeerId)) return;
      const newPeer = new Peer({
        initiator: !offer,
        trickle: false,
      });
      peers.set(remotePeerId, newPeer);

      newPeer.on("data", (messageOrResponse) => {
        messageOrResponse = JSON.parse(messageOrResponse.toString());
        // console.log('got a message from peer3: ' + messageOrResponse)
        if (messageOrResponse.result) {
          response$.next({
            peer: newPeer,
            response: messageOrResponse,
          });
        } else {
          message$.next({
            peer: newPeer,
            message: messageOrResponse,
          });
        }
      });
      newPeer.on("signal", (signal) => {
        setDoc(doc(_room, remotePeerId, "peers", peerId), signal);
      });

      newPeer.on("error", (error) => {
        error$.next(
          newRxError("RC_P2P_PEER", {
            error,
          })
        );
      });

      newPeer.on("connect", () => {
        connect$.next(newPeer);
      });
    };

    //init alreadt connection
    getDocs(_room).then((_docs) =>
      _docs.forEach((__doc) => {
        setPeer(__doc.id);
      })
    );

    const unsubscribeFirestore = onSnapshot(_peers, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // const _func = evtTypeFunc[change.type];
        if (change.type === "added") {
          const remotePeerId = change.doc.id;
          const _peer = peers.has(remotePeerId);
          if (!!_peer) _peer.signal(change.doc.data());
          else setPeer(change.doc.id, change.doc.data());
        } else if (change.type === "modified") {
        }
      });
    });

    const handler = {
      error$,
      connect$,
      disconnect$,
      message$,
      response$,
      async send(peer, message) {
        await peer.send(JSON.stringify(message));
      },
      destroy() {
        unsubscribeFirestore();
        error$.complete();
        connect$.complete();
        disconnect$.complete();
        message$.complete();
        response$.complete();
        return PROMISE_RESOLVE_VOID;
      },
    };
    return handler;
  };
  return creator;
}
