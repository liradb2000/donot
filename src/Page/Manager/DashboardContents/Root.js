import {
  Button,
  ButtonGroup,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import {
  authToken,
  setPageIdx,
  useMisc,
  useNetworkStatus,
  usePrints,
  useTemplates,
  useUISettings,
} from "../../../store";
import {
  Add,
  AddAlt,
  Close,
  CloudAuditing,
  Printer,
  Renew,
} from "@carbon/icons-react";
import { shallow } from "zustand/shallow";
import { Fragment, useMemo } from "react";
import { Cut, Text, render } from "react-thermal-printer";
import { nanoid } from "nanoid";
import { fetch } from "../../../plugin/fetch";
import { serverURL } from "../../../urls";

function PrintSection() {
  const [devices, addDevice, delDevice] = usePrints(
    (state) => [state.printDevice, state.setPrintDevice, state.delPrintDevice],
    shallow
  );
  function handleAddDevice() {
    let pDevice;
    navigator.usb
      .requestDevice({ filters: [] })
      .then((selectedDevice) => {
        pDevice = selectedDevice;
        return pDevice.open();
      })
      .then(() => pDevice.selectConfiguration(1))
      .then(() => pDevice.claimInterface(0))
      .then(() => addDevice(pDevice))
      .catch((e) => {
        console.error(e);
      });
  }
  const handlePrintTest = (k) => async () => {
    const _data = await render(
      <Printer type="epson" width={42} characterSet="korea">
        <Text>{`${k} 프린터 테스트 입니다.`}</Text>
        <Cut lineFeeds={6} />
      </Printer>
    );
    const printer = devices.get(k);
    if (!_data || !printer) return;
    printer.transferOut(2, _data);
  };
  return (
    <Fragment>
      <ListSubheader>
        <ListItemText primary="프린트" />
        <ListItemSecondaryAction>
          <IconButton onClick={handleAddDevice}>
            <AddAlt />
          </IconButton>
        </ListItemSecondaryAction>
      </ListSubheader>
      {devices.keySeq().map((k) => (
        <ListItem>
          <ListItemText primary={k} />
          <ListItemSecondaryAction>
            <ButtonGroup>
              <IconButton onClick={handlePrintTest(k)}>
                <Printer />
              </IconButton>
              <IconButton>
                <Close />
              </IconButton>
            </ButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </Fragment>
  );
}

function PrintSelector({ devices, value, onChange }) {
  return (
    <Select
      size="small"
      variant="standard"
      labelId="print-select-label"
      id="print-select"
      value={value}
      onChange={onChange}
    >
      <MenuItem value={""}>None</MenuItem>
      {devices.keySeq().map((k) => (
        <MenuItem value={k}>{k}</MenuItem>
      ))}
    </Select>
  );
}

function KioskSection() {
  const [rtcHandler, peersId, setPeer2Printer] = useNetworkStatus(
    (state) => [state.rtc, state.peers, state.setPeer2Printer],
    shallow
  );
  const devices = usePrints((state) => state.printDevice, shallow);

  const handleChangePrintSelector = (k) => (e) => {
    const val = e.target.value;
    setPeer2Printer(k, val);
  };
  const handleBlink = (k) => () => {
    rtcHandler.sendPeer({ action: "blink" }, k);
  };
  const handleSync = (k) => () => {
    // rtcHandler.sendSelf({ id: Date.now(), action: "reqSync", peerId: k });
  };
  function handleSyncSettings() {
    const templateStore = useTemplates.getState();
    const uiStore = useUISettings.getState();
    const miscStore = useMisc.getState();
    rtcHandler.send({
      id: Date.now(),
      action: "sync-agreement",
      data: {
        agreement: templateStore.agreement,
        visit: templateStore.visit,
        print: templateStore.print,
      },
    });
    rtcHandler.send({
      id: Date.now(),
      action: "sync-ui",
      data: {
        base: uiStore.base,
        logo: uiStore.logo,
        bgPattern: uiStore.bgPattern,
        bgColor: uiStore.bgColor,
        buttonBGColor: uiStore.buttonBGColor,
        buttonFontColor: uiStore.buttonFontColor,
        fontColor: uiStore.fontColor,
      },
    });
    rtcHandler.send({
      id: Date.now(),
      action: "sync-misc",
      data: {
        day: miscStore.day,
        apartment: miscStore.apartment,
      },
    });
  }
  return (
    <Fragment>
      <ListSubheader>
        <ListItemText primary="키오스크" />
        <ListItemSecondaryAction>
          <IconButton onClick={handleSyncSettings}>
            <Renew />
          </IconButton>
        </ListItemSecondaryAction>
      </ListSubheader>
      {peersId.entrySeq().map(([k, v]) => (
        <ListItem>
          <ListItemText
            primary={k}
            secondary={
              <PrintSelector
                devices={devices}
                value={v}
                onChange={handleChangePrintSelector(k)}
              />
            }
          />
          <ListItemSecondaryAction>
            <ButtonGroup>
              <IconButton onClick={handleSync(k)}>
                <Renew />
              </IconButton>
              <IconButton onClick={handleBlink(k)}>
                <CloudAuditing />
              </IconButton>
            </ButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {/* {peersId.keySeq().map((k) => (
        <ListItem>
          <ListItemText primary={k} />
          <ListItemSecondaryAction>
            <ButtonGroup>
              <IconButton>
                <Printer />
              </IconButton>
              <IconButton>
                <Close />
              </IconButton>
            </ButtonGroup>
          </ListItemSecondaryAction>
        </ListItem>
      ))} */}
    </Fragment>
  );
}

function RetriveServer() {
  const [socket, rtc] = useNetworkStatus(
    (state) => [state.socket, state.rtc],
    shallow
  );
  const disabled = useMemo(() => !socket, [socket]);
  function handleClickRetrive() {
    console.log("MAIN", authToken.current);
    rtc.sendSelf({
      id: Date.now(),
      action: "init",
    });
    // socket.send(JSON.stringify({ id: Date.now(), action: "get_contractor" }));
  }
  function handleClickRetriveSettings() {
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
    ]);
  }
  function handleClickDestroy() {
    rtc.sendSelf({ id: Date.now(), action: "destroy" });
    rtc.destroy();
    localStorage.removeItem("misc-storage");
    localStorage.removeItem("template-storage");
    localStorage.removeItem("ui-storage");
    localStorage.removeItem("token");
    setPageIdx("Login");
  }
  function handleTest() {
    rtc.sendSelf({
      id: Date.now(),
      action: "init",
    });
    // socket.send("init");
  }
  return (
    <Fragment>
      <ListSubheader>서버</ListSubheader>
      <ListItem>
        <Button disabled={disabled} onClick={handleClickRetrive}>
          계약 정보 받아오기
        </Button>
      </ListItem>
      <ListItem>
        <Button disabled={disabled} onClick={handleClickRetriveSettings}>
          설정 정보 받아오기
        </Button>
      </ListItem>
      <ListItem>
        <Button onClick={handleClickDestroy}>
          오프라인 데이터 지우기 (종료)
        </Button>
      </ListItem>
      <ListItem>
        <Button onClick={handleTest}>테스트</Button>
      </ListItem>
    </Fragment>
  );
}

export function RootPage() {
  // const setSocket

  return (
    <List dense>
      <RetriveServer />
      <PrintSection />
      <KioskSection />
    </List>
  );
}
