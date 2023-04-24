import { create } from "zustand";
export const useDBStatus = create((set) => ({
  isMaster: false,
  isConnect: false,
  senders: new Map(),
  setMaster: (v) => {
    set({ isMaster: v, isConnect: v ? new Set() : false });
  },
  setConnectState: (v) => {
    set(({ isMaster, isConnect }) => ({ isConnect: v(isMaster, isConnect) }));
  },
}));
