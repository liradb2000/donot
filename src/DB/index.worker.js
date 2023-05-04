/* eslint-disable no-restricted-globals */
import { decode, encode } from "cbor-x";
import { db } from "./db.index";
import { fetch } from "../plugin/fetch";
import { serverURL } from "../urls";
import { authToken } from "../store";

const mapFuncs = {
  sync: (data) => {
    const _data = decode(data);
    db.contractor.bulkPut(_data.contractor);
    db.apartment.bulkPut(_data.apartment);
    db.m2m.bulkPut(_data.m2m);
  },
  reqSync: async () => {
    return {
      action: "sync",
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
  get: (data) => {
    const _data = decode(data);

    db.table(_data.table).get(_data.row);
  },
  visitLog: async (data) => {
    const _data = decode(data);
    const resp = await fetch(serverURL.visit, _data)
      .then((resp) => resp.data)
      .catch(() => {
        db.failureVisit.put({ ...data, created_date: Date.now() });
      });
    return {
      action: "recieve-visit",
      data: resp,
    };
  },
  init: async () => {
    // authToken.current = decode(data).token;
    const resp = await fetch(serverURL.get_apart);

    const _data = resp.data;
    const _dataSize = _data.length;
    if (_dataSize < 1) return;

    const apart = new Array(_dataSize);
    const contractor = new Array(_dataSize);
    const apart_contractor = new Array(_dataSize);

    for (let i = 0, row; i < _dataSize; i++) {
      row = _data[i];
      apart[i] = {
        building_room: row.apartment_id,
        building: row.apartment__building,
        room: row.apartment__room,
        password: row.apartment__password,
      };
      contractor[i] = {
        phone: row.contractor_id,
        name: row.contractor__name,
      };
      apart_contractor[i] = {
        id: row.id,
        contractor_id: row.contractor_id,
        apartment_id: row.apartment_id,
      };
    }
    await db.apartment.bulkPut(apart);
    await db.contractor.bulkPut(contractor);
    await db.m2m.bulkPut(apart_contractor);

    return "done";
  },
  token: (data) => {
    authToken.current = decode(data).token;
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
  const msg = { id, peerId, result: result ? encode(result) : undefined };
  self.postMessage(msg, msg.result ? [msg.result.buffer] : undefined);
};
