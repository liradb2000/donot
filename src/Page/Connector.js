import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  styled,
} from "@mui/material";

import { getConnectionHandlerSimplePeer } from "../DB/rtc/handler";
import { useState } from "react";
import {
  authToken,
  setPageIdx,
  useMisc,
  useNetworkStatus,
  usePage,
  usePrints,
  useTemplates,
  useUISettings,
} from "../store";
import { CheckmarkOutline } from "@carbon/icons-react";
import { decode } from "cbor-x";
import { useContractorPrivate } from "./Kiosk/Store";
import { serverURL } from "../urls";
import { fetch } from "../plugin/fetch";
import { shallow } from "zustand/shallow";
import { ws_url } from "../urlsWS";

const StyledDiv = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  [`& > .container`]: {
    display: "flex",
    flexDirection: "column",
    [`& > *`]: {
      margin: theme.spacing(1, 0),
    },
  },
}));
export const setupFunc = {
  "settings-component_client": (data) => {
    useUISettings.getState().setup(JSON.parse(data));
  },
  "settings-check": (data) => {
    useTemplates.getState().setAgreement(data);
  },
  "settings-visit": (data) => {
    useTemplates.getState().setVisit(data);
  },
  "settings-print": (data) => {
    useTemplates.getState().setPrint(data);
  },
  "settings-day": (data) => {
    useMisc.setState({ day: Number(data) });
  },
  "settings-building-info": (data) => {
    useMisc.setState({ apartment: JSON.parse(data) });
  },
};
function kioskFuncs(worker) {
  const funcs = {
    blink: () => {
      usePage.getState().setBlink(true);
    },
    "sync-agreement": (data) => {
      useTemplates.setState(decode(data));
    },
    "sync-ui": (data) => {
      useUISettings.setState(decode(data));
    },
    "sync-misc": (data) => {
      useMisc.setState(decode(data));
    },
    "recieve-visit": (data) => {
      console.log(decode(data));
      useContractorPrivate.setState({ visit: decode(data).visit });
    },
    netOnline: (data) => {
      useNetworkStatus.getState().setOnline(decode(data).online);
    },
    sms: (data) => {
      useContractorPrivate.getState().setSMS(decode(data).status);
    },
  };
  return (msg, opt) => {
    const func = funcs[msg.action];
    if (func) {
      func(msg.data);
      return;
    }
    worker.postMessage(msg, opt);
  };
}
function managerFuncs(worker) {
  const funcs = {
    print: (data, uid, pid) => {
      const printid = useNetworkStatus.getState().peers.get(pid);
      if (!printid) return;
      const printer = usePrints.getState().printDevice.get(printid);
      printer.transferOut(2, data);
    },
    sms: (data, uid, pid) => {
      const _data = decode(data);
      console.log(data, pid);
      fetch(serverURL.sendSMS, _data)
        .then(() =>
          useNetworkStatus.getState().rtc.sendPeer(
            {
              id: uid,
              action: "sms",
              data: { status: "ok" },
            },
            pid
          )
        )
        .catch(() =>
          useNetworkStatus.getState().rtc.sendPeer(
            {
              id: uid,
              action: "sms",

              data: { status: "err" },
            },
            pid
          )
        );
    },
  };
  return (msg, opt) => {
    const func = funcs[msg.action];
    if (func) {
      func(msg.data, msg.id, msg.peerId);
      return;
    }
    worker.postMessage(msg, opt);
  };
}
export function worker2socket(socket, rtcHandler) {
  const funcs = {
    init: (data) => {
      const _data = decode(data);
      Promise.all([
        fetch(serverURL.get_settings, { key: "component_client" }).then(
          (resp) => {
            useUISettings.getState().setup(resp.data.value);
          }
        ),
        fetch(serverURL.get_settings, { key: "check" }).then((resp) => {
          useTemplates.getState().setAgreement(resp.data.value);
        }),
        fetch(serverURL.get_settings, { key: "visit" }).then((resp) => {
          useTemplates.getState().setVisit(resp.data.value);
        }),
        fetch(serverURL.get_settings, { key: "print" }).then((resp) => {
          useTemplates.getState().setPrint(resp.data.value);
        }),
        fetch(serverURL.get_settings, { key: "building-info" }).then((resp) => {
          useMisc.setState({ apartment: resp.data.value });
        }),
        fetch(serverURL.get_settings, { key: "day" }).then((resp) => {
          useMisc.setState({ day: resp.data.value });
        }),
      ]).then(() => {
        socket.send(_data.logID);
      });
    },
    setup: (data) => {
      setupFunc[data.bnd]?.(data.v);
    },
  };
  return ({ data }) => {
    const func = funcs[data.action];
    if (func) {
      func(data.result);
      return;
    }
    // console.log(data)
    rtcHandler.sendPeer(data.result, data.peerId);
  };
}
export function ConnectorPage() {
  const [role, socket, rtc, setSocket, setRtc, setSite, setDBWorker] =
    useNetworkStatus(
      (state) => [
        state.role,
        state.socket,
        state.rtc,
        state.setSocket,
        state.setRtc,
        state.setSite,
        state.setDBWorker,
      ],
      shallow
    );
  const [err, setErr] = useState();
  const [loading, setLoading] = useState(false);

  async function netBootstrap(e) {
    e.preventDefault();
    e.stopPropagation();
    setErr(null);
    const _data = new FormData(e.target);
    const _site = (_data.get("site") ?? "").trim();
    const _topic = (_data.get("topic") ?? "").trim();

    if (_site === "" || _topic === "") {
      setErr("위치 또는 구역 설정이 필요합니다");
      return;
    }
    setLoading(true);

    const ws = new Worker(new URL("../DB/index.worker.js", import.meta.url));
    setDBWorker(ws);

    // _ws.send("tetst")
    // const connectData = encode({
    //   id: Date.now(),
    //   action: "connect",
    //   params: { site: "test", topic: "101" },
    // });
    // ws.postMessage(connectData, [connectData.buffer]);
    const _handler = await getConnectionHandlerSimplePeer(
      _site,
      _topic,
      role,
      role ? kioskFuncs(ws) : managerFuncs(ws)
    );
    _handler.sendSelf({
      id: Date.now(),
      action: "token",
      data: { token: authToken.current },
    });
    setRtc(_handler);

    if (!role) {
      const _socket = new WebSocket(ws_url);
      _socket.onclose = () => {
        _handler.send({
          action: "netOnline",
          data: { online: false },
        });
        setSocket(undefined);
      };
      _socket.onopen = () => {
        _handler.send({
          action: "netOnline",
          data: { online: true },
        });
        setSocket(_socket);
      };
      _socket.onmessage = ({ data }) => {
        ws.postMessage(data);
        _handler.send({ action: "log", data });
      };
      // socketFuncs = worker2socket(_socket);
      ws.onmessage = worker2socket(_socket, _handler);
    } else {
      ws.onmessage = ({ data }) => {
        // console.log(data)
        if (data.action === "setup") {
          setupFunc[data.result.bnd]?.(data.result.v);
          return;
        }
        if (data.peerId && data.result)
          _handler.sendPeer(data.result, data.peerId);
      };
    }
    setSite(Object.fromEntries(_data));
    setLoading(false);
    setPageIdx(role ? "Kiosk/Agreement" : "Manager/Dashboard");
  }
  return (
    <StyledDiv>
      {loading ? (
        <List className="container">
          <ListItem>
            <ListItemIcon>
              {socket ? <CheckmarkOutline /> : <CircularProgress />}
            </ListItemIcon>
            <ListItemText
              primary={socket ? "서버와 연결되었습니다" : "서버와 연결중입니다"}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {rtc ? <CheckmarkOutline /> : <CircularProgress />}
            </ListItemIcon>
            <ListItemText
              primary={
                rtc ? "P2P서버가 구성되었습니다" : "P2P서버가 구성 중입니다"
              }
            />
          </ListItem>
        </List>
      ) : (
        <form className="container" onSubmit={netBootstrap}>
          <TextField variant="filled" label="위치 (Site)" name="site" />
          <TextField variant="filled" label="구역" name="topic" />
          <Button type="submit">연결</Button>
          {err && (
            <Typography variant="caption" color="red">
              {err}
            </Typography>
          )}
        </form>
      )}
    </StyledDiv>
  );
}
