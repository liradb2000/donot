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
  TextField,
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
  Checkmark,
  Close,
  CloudAuditing,
  Edit,
  Printer,
  Renew,
} from "@carbon/icons-react";
import { shallow } from "zustand/shallow";
import { Fragment, useMemo, useRef, useState } from "react";
import { Cut, Text, render } from "react-thermal-printer";
import { fetch } from "../../../plugin/fetch";
import { serverURL } from "../../../urls";
import { db } from "../../../DB/db.index";

function PrintSection() {
  const inputRef = useRef();
  const [editAlias, setEditAlias] = useState();
  const [devices, alias, addDevice, delDevice, setAlias] = usePrints(
    (state) => [
      state.printDevice,
      state.alias,
      state.setPrintDevice,
      state.delPrintDevice,
      state.setAlias,
    ],
    shallow
  );
  async function handleAddDevice() {
    try {
      const pDevice = await navigator.usb.requestDevice({ filters: [] });
      pDevice.onconnect = () => {
        addDevice(pDevice);
      };
      pDevice.ondisconnect = () => {
        delDevice(pDevice);
      };
      await pDevice.open();
      await pDevice.selectConfiguration(1);
      await pDevice.claimInterface(0);
      // addDevice(pDevice);
    } catch (e) {
      console.error(e);
    }
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

  const handleEditAlias = (k) => () => {
    setEditAlias(k);
  };

  const handleSetAlias = (k) => () => {
    const _alias = (inputRef.current.value ?? "").trim();
    if (_alias !== "") setAlias(k, _alias);
  };

  return (
    <Fragment>
      <ListSubheader>
        <ListItemText primary="프린트" sx={{ mt: 2 }} />
        <ListItemSecondaryAction>
          <IconButton onClick={handleAddDevice}>
            <AddAlt />
          </IconButton>
        </ListItemSecondaryAction>
      </ListSubheader>
      {devices.keySeq().map((k) => (
        <ListItem>
          {editAlias === k ? (
            <TextField
              variant="standard"
              defaultValue={alias.get(k)}
              inputRef={inputRef}
            />
          ) : (
            <ListItemText primary={alias.get(k)} />
          )}
          {editAlias === k ? (
            <ListItemSecondaryAction>
              <IconButton onClick={handleSetAlias(k)}>
                <Checkmark />
              </IconButton>
            </ListItemSecondaryAction>
          ) : (
            <ListItemSecondaryAction>
              <ButtonGroup>
                <IconButton onClick={handlePrintTest(k)}>
                  <Printer />
                </IconButton>
                <IconButton onClick={handleEditAlias(k)}>
                  <Edit />
                </IconButton>
              </ButtonGroup>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </Fragment>
  );
}

function PrintSelector({ devices, alias, value, onChange }) {
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
        <MenuItem value={k}>{alias.get(k)}</MenuItem>
      ))}
    </Select>
  );
}

function KioskSection() {
  const inputRef = useRef();
  const [editAlias, setEditAlias] = useState();
  const [rtcHandler, peersId, peerAlias, setPeer2Printer, setPeerAlias] =
    useNetworkStatus(
      (state) => [
        state.rtc,
        state.peers,
        state.alias,
        state.setPeer2Printer,
        state.setAlias,
      ],
      shallow
    );
  const [devices, alias] = usePrints(
    (state) => [state.printDevice, state.alias],
    shallow
  );

  const handleChangePrintSelector = (k) => (e) => {
    const val = e.target.value;
    setPeer2Printer(k, val);
  };
  const handleBlink = (k) => () => {
    rtcHandler.sendPeer({ action: "blink" }, k);
  };
  const handleEditAlias = (k) => () => {
    setEditAlias(k);
  };

  const handleSetAlias = (k) => () => {
    const _alias = (inputRef.current.value ?? "").trim();
    if (_alias !== "") setPeerAlias(k, _alias);
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
        <ListItemText primary="키오스크" sx={{ mt: 2 }} />
        <ListItemSecondaryAction>
          <IconButton onClick={handleSyncSettings}>
            <Renew />
          </IconButton>
        </ListItemSecondaryAction>
      </ListSubheader>
      {peersId.entrySeq().map(([k, v]) => (
        <ListItem>
          {editAlias === k ? (
            <TextField
              variant="standard"
              defaultValue={peerAlias.get(k)}
              inputRef={inputRef}
            />
          ) : (
            <ListItemText
              primary={peerAlias.get(k)}
              secondary={
                <PrintSelector
                  devices={devices}
                  alias={alias}
                  value={v}
                  onChange={handleChangePrintSelector(k)}
                />
              }
            />
          )}
          {editAlias === k ? (
            <ListItemSecondaryAction>
              <IconButton onClick={handleSetAlias(k)}>
                <Checkmark />
              </IconButton>
            </ListItemSecondaryAction>
          ) : (
            <ListItemSecondaryAction>
              <ButtonGroup>
                <IconButton onClick={handleBlink(k)}>
                  <CloudAuditing />
                </IconButton>
                <IconButton onClick={handleEditAlias(k)}>
                  <Edit />
                </IconButton>
              </ButtonGroup>
            </ListItemSecondaryAction>
          )}
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

function FailureButton() {
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState(0);
  async function handleClick() {
    setSize(await db.failureVisit.count());
  }
  async function handleUpload() {
    setLoading(true);
    const curData = await db.failureVisit.toArray();
    if (curData.length > 0)
      await fetch(serverURL.add_visits, curData)
        .then(async () => {
          await Promise.all(curData.map((i) => db.failureVisit.delete(i.id)));
          handleClick();
        })
        .finally(() => setLoading(false));
    else setLoading(false);
  }
  return (
    <Fragment>
      <ListItem>
        <Button onClick={handleClick}>{`방문자-실패 [ ${size} ]`}</Button>
      </ListItem>
      <ListItem>
        <Button onClick={handleUpload}>{`방문자-업로드`}</Button>
      </ListItem>
    </Fragment>
  );
}

function RetriveServer() {
  const [socket, rtc] = useNetworkStatus(
    (state) => [state.socket, state.rtc],
    shallow
  );
  const disabled = useMemo(() => !socket, [socket]);
  // function handleClickRetrive() {
  //   console.log("MAIN", authToken.current);
  //   rtc.sendSelf({
  //     id: Date.now(),
  //     action: "init",
  //   });
  //   // socket.send(JSON.stringify({ id: Date.now(), action: "get_contractor" }));
  // }
  // function handleClickRetriveSettings() {
  //   Promise.all([
  //     fetch(serverURL.get_settings, { key: "component_client" }).then(
  //       (resp) => {
  //         useUISettings.getState().setup(resp.data.value);
  //       }
  //     ),
  //     fetch(serverURL.get_settings, { key: "check" }).then((resp) => {
  //       useTemplates.getState().setAgreement(resp.data.value);
  //     }),
  //     fetch(serverURL.get_settings, { key: "visit" }).then((resp) => {
  //       useTemplates.getState().setVisit(resp.data.value);
  //     }),
  //     fetch(serverURL.get_settings, { key: "print" }).then((resp) => {
  //       useTemplates.getState().setPrint(resp.data.value);
  //     }),
  //     fetch(serverURL.get_settings, { key: "building-info" }).then((resp) => {
  //       useMisc.setState({ apartment: resp.data.value });
  //     }),
  //     fetch(serverURL.get_settings, { key: "day" }).then((resp) => {
  //       useMisc.setState({ day: resp.data.value });
  //     }),
  //   ]);
  // }
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
      {/* <ListItem>
        <Button disabled={disabled} onClick={handleClickRetrive}>
          계약 정보 받아오기
        </Button>
      </ListItem>
      <ListItem>
        <Button disabled={disabled} onClick={handleClickRetriveSettings}>
          설정 정보 받아오기
        </Button>
      </ListItem> */}
      <ListItem>
        <Button disabled={disabled} onClick={handleTest}>
          실시간 정보 반영
        </Button>
      </ListItem>
      <ListItem>
        <Button onClick={handleClickDestroy}>
          오프라인 데이터 지우기 (종료)
        </Button>
      </ListItem>
      <FailureButton />
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
