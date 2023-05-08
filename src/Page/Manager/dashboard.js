import {
  Api as ApiIcon,
  CloudOffline,
  ErrorOutline,
  IbmWatsonDiscovery,
  NetworkOverlay,
} from "@carbon/icons-react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  styled,
} from "@mui/material";
import { useNetworkStatus } from "../../store";
import { shallow } from "zustand/shallow";
import { RootPage } from "./DashboardContents/Root";
import { worker2socket } from "../Connector";

const StyledDiv = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  [`& > .status`]: {
    backgroundColor: theme.palette.grey[900],
    maxWidth: "100%",
    borderRadius: theme.shape.borderRadius,
  },
}));

export function DashboardPage() {
  const [socket, rtc, peers, dbWorker, setSocket] = useNetworkStatus(
    (state) => [
      state.socket,
      state.rtc,
      state.peers,
      state.dbWorker,
      state.setSocket,
    ],
    shallow
  );

  function handleReConnect() {
    const _socket = new WebSocket("wss://localhost:8000/ws/");
    _socket.onclose = () => {
      rtc.send({
        action: "netOnline",
        data: { online: false },
      });
      setSocket(undefined);
    };
    _socket.onopen = () => {
      rtc.send({
        action: "netOnline",
        data: { online: true },
      });
      setSocket(_socket);
    };
    _socket.onmessage = ({ data }) => {
      dbWorker.postMessage(data);
      rtc.send({ action: "log", data });
    };
    // socketFuncs = worker2socket(_socket);
    dbWorker.onmessage = worker2socket(_socket, rtc);
  }
  return (
    <StyledDiv>
      <BottomNavigation
        className="status"
        showLabels
        value={-1}
        onChange={(event, newValue) => {
          //   setValue(newValue);
        }}
      >
        <BottomNavigationAction
          label={socket ? "서버" : "서버 재연결"}
          icon={socket ? <NetworkOverlay /> : <CloudOffline />}
          disabled={!!socket}
          onClick={handleReConnect}
        />
        <BottomNavigationAction
          label={`P2P [ ${peers.size} ]`}
          icon={rtc ? <ApiIcon /> : <ErrorOutline />}
          disabled
        />
        <Divider variant="middle" orientation="vertical" flexItem />
        <BottomNavigationAction label="로그" icon={<IbmWatsonDiscovery />} />
        {/* <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
      </BottomNavigation>
      <RootPage socket={!!socket} />
    </StyledDiv>
  );
}
