/* eslint-disable no-restricted-globals */
import { decode, encode } from "cbor-x";
import { db } from "./db.index";
import { fetch } from "../plugin/fetch";
import { serverURL } from "../urls";
import { authToken } from "../store";

const dbFuncs = {
  mod: {
    "db-ctrct": (data) => {
      db.contractor.put(JSON.parse(data));
    },
    "db-apt": (data) => {
      db.apartment.put(JSON.parse(data));
    },
    "db-apartctrct": (data) => {
      db.m2m.put(JSON.parse(data));
    },
  },
  del: {
    "db-ctrct": (data) => {
      db.contractor.delete(data);
    },
    "db-apt": (data) => {
      db.apartment.delete(data);
    },
    "db-apartctrct": (data) => {
      db.m2m.delete(data);
    },
  },
};

const mapFuncs = {
  synckiosk: async (data) => {
    const _data = decode(data);
    // console.log("synckiosk",_data)

    db.failureVisit.clear();
    if (_data.logs) {
      // db.logs.bulkPut(_data.logs);
      for (let row of _data.logs) {
        db.logs.put(row);
        dbFuncs[row.act]?.[row.bnd]?.(row.v);
      }
    }
    if (_data.contractor) {
      db.contractor.bulkPut(_data.contractor);
    }
    if (_data.apartment) {
      db.apartment.bulkPut(_data.apartment);
    }
    if (_data.m2m) {
      db.m2m.bulkPut(_data.m2m);
    }
  },
  sync: async (data) => {
    const _data = decode(data);
    // console.log("synckiosk",_data)

    if ((_data.failureVisit?.length ?? 0) > 0) {
      db.failureVisit.bulkPut(
        _data.failureVisit.map((i) => ({ ...i, id: undefined }))
      );
    }
    if (_data.logLatestID === "init") {
      return {
        action: "synckiosk",
        data: {
          logs: await db.logs.toArray(),
          contractor: await db.contractor.toArray(),
          apartment: await db.apartment.toArray(),
          m2m: await db.m2m.toArray(),
        },
      };
      // db.contractor.bulkPut(_data.contractor);
      // db.apartment.bulkPut(_data.apartment);
      // db.m2m.bulkPut(_data.m2m);
    } else {
      // console.log(
      //   _data.logLatestID,
      //   await db.logs.where("id").above(_data.logLatestID).toArray()
      // );
      return {
        action: "synckiosk",
        data: {
          logs: await db.logs.where("id").above(_data.logLatestID).toArray(),
        },
      };
    }
  },
  reqSync: async () => {
    const logLatestID =
      (await db.logs.orderBy("ts").reverse().limit(1).first())?.id ?? "init";
    return {
      action: "sync",
      data: {
        logLatestID,
        failureVisit: await db.failureVisit.toArray(),
      },
    };
  },
  // put: (data) => {
  //   const _data = decode(data);

  //   db.table(_data.table).put(_data.row);
  // },
  // get: (data) => {
  //   const _data = decode(data);

  //   db.table(_data.table).get(_data.row);
  // },
  visitLog: async (data) => {
    const _data = decode(data);
    const resp = await fetch(serverURL.visit, _data)
      .then((resp) => resp.data)
      .catch(() => {
        db.failureVisit.put({
          ..._data,
          created_date: Date.now() / 1000,
        });
        return { visit: " " };
      });
    return {
      action: "recieve-visit",
      data: resp,
    };
  },
  init: async () => {
    // authToken.current = decode(data).token;
    const logLatestID =
      (await db.logs.orderBy("ts").reverse().limit(1).first())?.id ?? "init";
    if (logLatestID === "init") {
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
    }
    return { logID: logLatestID };
  },
  token: (data) => {
    authToken.current = decode(data).token;
  },
  destroy: async () => {
    await db.delete();
  },
  log: (data) => {
    const _data = JSON.parse(decode(data));
    if (_data.ts) _data.ts = Number(_data.ts);
    db.logs.put(_data);
    if (_data.act === "setup") {
      self.postMessage({ action: "setup", result: _data });
    } else dbFuncs[_data.act]?.[_data.bnd]?.(_data.v);
  },
  kioskVisit: (data) => {
    const _data = decode(data);
    db.failureVisit.put({
      ..._data,
      created_date: Date.now() / 1000,
    });
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
  if (typeof data === "string") {
    const _data = JSON.parse(data);
    if (_data.ts) _data.ts = Number(_data.ts);
    db.logs.put(_data);
    if (_data.act === "setup") {
      self.postMessage({ action: "setup", result: _data });
    } else dbFuncs[_data.act]?.[_data.bnd]?.(_data.v);
  } else {
    const { id, action, peerId, data: _data } = data;
    const result = await mapFuncs[action](_data);
    const msg = {
      id,
      peerId,
      action,
      result: result ? encode(result) : undefined,
    };
    self.postMessage(msg, msg.result ? [msg.result.buffer] : undefined);
  }
};
