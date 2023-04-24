/* eslint-disable no-restricted-globals */
import { decode, encode } from "cbor-x";
import { db } from "./db.index";

const mapFuncs = {
  sync: (data) => {
    const _data = decode(data);
    db.contractor.bulkPut(_data.contractor);
    db.apartment.bulkPut(_data.apartment);
    db.m2m.bulkPut(_data.m2m);
  },
  reqSync: async () => {
    return {
      type: "sync",
      data: {
        contractor: await db.contractor.toArray(),
        apartment: await db.apartment.toArray(),
        m2m: await db.m2m.toArray(),
      },
    };
  },
  put: (data) => {
    const _data = decode(data);

    db.table(_data.table).put(_data.row);
  },
  init: async () => {
    await db.contractor.bulkPut([
      { phone: "01025765914", name: "김다범" },
      { phone: "01027725914", name: "김다범2" },
    ]);
    await db.apartment.bulkPut([
      {
        building_room: "101-101",
        building: "101",
        room: "101",
        password: [1111, 2222],
      },
      {
        building_room: "101-102",
        building: "101",
        room: "102",
        password: [3333, 4444],
      },
    ]);
    await db.m2m.bulkPut([
      { id: 1, contractor_id: "01025765914", apartment_id: "101-101" },
      { id: 2, contractor_id: "01025765914", apartment_id: "101-102" },
      { id: 3, contractor_id: "01027725914", apartment_id: "101-102" },
    ]);

    return "done";

    //   const ws = new WebSocket("wss://localhost:8001/ws");
  },
  // get connect() {
  //   return async ({ site, topic }) => {
  //     console.log(site, topic);
  //     this.handler = getConnectionHandlerSimplePeer(site, topic, this.mapper);
  //   };
  // },
  // get destroy() {
  //   this.handler.destroy?.();
  //   return undefined;
  // },
  // get send() {
  //   this.handler.send?.();
  //   return undefined;
  // },
};

self.onmessage = async ({ data }) => {
  const { id, action, peerId, data: _data } = data;
  const result = await mapFuncs[action](_data);
  const msg = { id, peerId, result: encode(result) };
  self.postMessage(msg, [msg.result.buffer]);
};
