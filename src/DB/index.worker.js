/* eslint-disable no-restricted-globals */
import { createRxDatabase } from "rxdb";

/**
 * For browsers, we use the dexie.js based storage
 * which stores data in IndexedDB in the browser.
 * In other JavaScript runtimes, we can use different storages:
 * @link https://rxdb.info/rx-storage.html
 */
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  replicateP2P,
  getConnectionHandlerSimplePeer,
} from "rxdb/plugins/replication-p2p";
import { apartSchema, contractSchema, visitSchema } from "./schema";

const mapFuncs = {
  db: undefined,
  get init() {
    return async () => {
      // create a database
      const db = await createRxDatabase({
        name: "eventsdb", // the name of the database
        storage: getRxStorageDexie(),
      });

      // add collections
      await db.addCollections({
        contractor: {
          schema: contractSchema,
        },
        apartment: {
          schema: apartSchema,
        },
        visitlog: {
          schema: visitSchema,
        },
      });
      this.db = db;
    };
  },
  get connect() {
    return async () => {
      const replicationPool = await replicateP2P({
        collection: "contractor",
        // The topic is like a 'room-name'. All clients with the same topic
        // will replicate with each other. In most cases you want to use
        // a different topic string per user.
        topic: "my-users-pool",
        /**
         * You need a collection handler to be able to create WebRTC connections.
         * Here we use the simple peer handler which uses the 'simple-peer' npm library.
         * To learn how to create a custom connection handler, read the source code,
         * it is pretty simple.
         */
        connectionHandlerCreator: getConnectionHandlerSimplePeer(
          "wss://example.com:8080",
          // only in Node.js, we need the wrtc library
          // because Node.js does not contain the WebRTC API.
          require("wrtc")
        ),
        pull: {},
        push: {},
      });
      replicationPool.error$.subscribe((err) => {
        /* ... */
        console.error(err);
      });
      replicationPool.cancel();
    };
  },
};

self.onmessage = async ({ id, action, params }) => {
  const result = await mapFuncs[action](params);
  self.postMessage({ id, result });
};
