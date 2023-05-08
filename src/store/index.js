import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Map as immuMap, Set as immuSet } from "immutable";
import { nanoid } from "nanoid";

// export const userState = create(set => ({
//     bypass: false,
//     setBypass: v => set({ bypass: v }),
//     authToken: "",
//     setAuthToken: v => set({ authToken: v })
// }));
// export const API = {
//     history: "/",
//     setLatestPage: function (v) {
//         this.history = v;
//     },
// };

export const authToken = { current: undefined };

export const useUISettings = create(
  persist(
    (set) => ({
      base: "dark",
      logo: undefined,
      bgPattern: undefined,
      bgColor: "#001F41",
      buttonBGColor: "#67AADE",
      buttonFontColor: undefined,
      fontColor: undefined,
      // print_msg: "",
      setup: (v) => {
        set({
          base: (v.base ?? "on") === "on" ? "dark" : "light",
          logo: v.logo_img,
          bgPattern: v.background_img,
          bgColor: v.bg_color,
          buttonBGColor: v.button_bg_color ?? "#67AADE",
          buttonFontColor: v.button_text_color,
          fontColor: v.text_color,
          // print_msg: v.visit_print ?? "",
        });
      },
    }),
    {
      name: "ui-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export const useTemplates = create(
  persist(
    (set) => ({
      agreement: "",
      visit: "",
      print: "",
      setAgreement: (v) => {
        set({ agreement: v });
      },
      setVisit: (v) => {
        set({ visit: v });
      },
      setPrint: (v) => {
        set({ print: v });
      },
    }),
    {
      name: "template-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export const useMisc = create(
  persist(
    (set) => ({
      day: 0,
      apartment: {},
    }),
    {
      name: "misc-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export const usePrints = create((set) => ({
  printDevice: immuMap(),
  setPrintDevice: (v) => {
    const _id = nanoid();
    set(({ printDevice }) => ({ printDevice: printDevice.set(_id, v) }));
    return _id;
  },
  delPrintDevice: (v) => {
    set(({ printDevice }) => set({ printDevice: printDevice.remove(v) }));
  },
}));

export const ROLE_TYPE = { MANAGER: 0, KIOSK: 1 };
export const useNetworkStatus = create((set) => ({
  role: undefined,
  socket: undefined,
  rtc: undefined,
  peers: immuMap(),
  site: {},
  dbWorker: undefined,
  online: false,
  setRole: (v) => {
    set({ role: v });
  },
  setSocket: (v) => {
    set({ socket: v });
  },
  setRtc: (v) => {
    set({ rtc: v });
  },
  setPeers: (v) => {
    set(({ role, peers }) => ({ peers: v(peers, role) }));
  },
  setPeer2Printer: (k, v) => {
    set(({ peers }) => ({ peers: peers.set(k, v) }));
  },
  setSite: (v) => {
    set({ site: v });
  },
  setDBWorker: (v) => {
    set({ dbWorker: v });
  },
  setOnline: (v) => {
    set({ online: v });
  },
}));

export const usePage = create((set) => ({
  pageIdx: "Login",
  blink: false,
  setPageIdx: (idx) => {
    set({ pageIdx: idx });
  },
  setBlink: (v) => {
    set({ blink: v });
  },
}));

export function setPageIdx(v) {
  return usePage.getState().setPageIdx(v);
}
