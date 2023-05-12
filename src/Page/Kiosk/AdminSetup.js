import { Fragment, useState } from "react";

import {
  Button,
  Dialog,
  ListItem,
  ListSubheader,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ButtonBase,
} from "@mui/material";
import { setPageIdx, useNetworkStatus, usePrints } from "../../store";
import { Close } from "@carbon/icons-react";
import { shallow } from "zustand/shallow";
import { db } from "../../DB/db.index";

function FailureButton() {
  const [size, setSize] = useState(0);
  async function handleClick() {
    setSize(await db.failureVisit.count());
  }
  return (
    <ListItem>
      <Button onClick={handleClick}>{`방문자-실패 [ ${size} ]`}</Button>
    </ListItem>
  );
}

export function AdminSetupPage() {
  const [open, setOpen] = useState(false);
  const rtc = useNetworkStatus((state) => state.rtc, shallow);
  const [printDevice, setPrintDevice, delPrintDevice] = usePrints((state) => [
    state.printDevice,
    state.setPrintDevice,
    state.delPrintDevice,
  ]);

  function handleConnect() {
    let pDevice, id;
    navigator.usb
      .requestDevice({ filters: [] })
      .then((selectedDevice) => {
        pDevice = selectedDevice;
        return pDevice.open();
      })
      .then(() => pDevice.selectConfiguration(1))
      .then(() => pDevice.claimInterface(0))
      .then(() => (id = setPrintDevice(pDevice)))
      .then(() => {
        navigator.usb.addEventListener(
          "disconnect",
          () => {
            delPrintDevice(id);
          },
          { once: true }
        );
      })
      .catch(() => {});
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

  function handleClickOpenDialog() {
    setOpen((v) => !v);
  }
  return (
    <Fragment>
      <ButtonBase className="version-button" onClick={handleClickOpenDialog}>
        <Typography variant="caption">{"VER. 1.0.0"}</Typography>
      </ButtonBase>
      <Dialog open={open} fullScreen>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClickOpenDialog}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Admin Setup
            </Typography>
          </Toolbar>
        </AppBar>
        <ListSubheader>Printer</ListSubheader>
        <ListItem>
          <Button disabled={printDevice.size > 0} onClick={handleConnect}>
            connect
          </Button>
        </ListItem>
        <ListItem>
          <Button onClick={handleConnect}>ReConnect</Button>
        </ListItem>
        <ListItem>
          <Button>Print test page</Button>
        </ListItem>
        <ListItem>
          <Button onClick={handleClickDestroy}>
            오프라인 데이터 지우기 (종료)
          </Button>
        </ListItem>
        <FailureButton />
      </Dialog>
    </Fragment>
  );
}
