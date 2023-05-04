import {
  CheckmarkOutline,
  CloudOffline,
  ErrorOutline,
  IbmWatsonDiscovery,
  NetworkOverlay,
} from "@carbon/icons-react";
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  Paper,
  styled,
} from "@mui/material";
import { useNetworkStatus } from "../../store";
import { shallow } from "zustand/shallow";
import { RootPage } from "./DashboardContents/Root";

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
  const [socket, rtc, peers, setSocket] = useNetworkStatus(
    (state) => [state.socket, state.rtc, state.peers, state.setSocket],
    shallow
  );

  function handleReConnect() {
    const _socket = new WebSocket("wss://localhost:8000/ws/");
    _socket.onclose = () => {
      setSocket(undefined);
    };
    _socket.onopen = () => {
      setSocket(_socket);
    };
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
          icon={rtc ? <CheckmarkOutline /> : <ErrorOutline />}
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
