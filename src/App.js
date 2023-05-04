import React, { useMemo, useState } from "react";
// import { Main } from "./DB/rtc/test";
import { CssBaseline, ThemeProvider, createTheme, styled } from "@mui/material";

import { usePage, useUISettings } from "./store";
import { LoginPage } from "./Page/Login";
import { shallow } from "zustand/shallow";
import { ChoiceRolePage } from "./Page/ChoiceRole";
import { ConnectorPage } from "./Page/Connector";
import { DashboardPage } from "./Page/Manager/dashboard";
import { AgreementPage } from "./Page/Kiosk/Agreement";
import { BlinkDialog } from "./Page/Blink";
import { CheckPhoneNumberPage } from "./Page/Kiosk/CheckPhoneNumber";
import { SelectApartmentPage } from "./Page/Kiosk/SelectApartment";
import { DbCheckApartmentPage } from "./Page/Kiosk/DbCheckApartment";
import { PasswordAgreementPage } from "./Page/Kiosk/PasswordAgreement";
import { ShwoPasswordPage } from "./Page/Kiosk/ShowPassword";
import { KioskWrapper } from "./Page/Kiosk/Component/Wrapper";

const StyledDiv = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  height: "100vh",
});
const PagesMap = {
  Login: <LoginPage />,
  ChoiceRole: <ChoiceRolePage />,
  Connector: <ConnectorPage />,
  "Manager/Dashboard": <DashboardPage />,
  "Kiosk/Agreement": <AgreementPage />,
  "Kiosk/CheckPhoneNumber": <CheckPhoneNumberPage />,
  "Kiosk/SelectApartment": <SelectApartmentPage />,
  "Kiosk/DbCheckApartment": <DbCheckApartmentPage />,
  "Kiosk/PasswordAgreement": <PasswordAgreementPage />,
  "Kiosk/ShowPassword": <ShwoPasswordPage />,
};
function App() {
  const page = usePage(({ pageIdx }) => pageIdx, shallow);
  const [
    base,
    bgPattern,
    bgColor,
    buttonBGColor,
    buttonFontColor,
    fontColor,
    setup,
  ] = useUISettings((state) => [
    state.base,
    state.bgPattern,
    state.bgColor,
    state.buttonBGColor,
    state.buttonFontColor,
    state.fontColor,
    state.setup,
  ]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: base,
          primary: { main: buttonBGColor },
        },
        typography: { fontFamily: "'Noto Sans KR', sans-serif" },
        components: {
          MuiTypography: {
            styleOverrides: {
              root: { color: fontColor },
            },
          },
          MuiButton: {
            defaultProps: { variant: "contained" },
          },
          MuiButtonBase: {
            styleOverrides: {
              root: {
                color: buttonFontColor,
              },
            },
          },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, bgPattern, bgColor, buttonBGColor, buttonFontColor, fontColor]
  );

  const pageComponent = useMemo(
    () =>
      (page ?? "").startsWith("Kiosk/") ? (
        <KioskWrapper>{PagesMap[page]}</KioskWrapper>
      ) : (
        PagesMap[page]
      ),
    [page]
  );

  // async function handleConnect() {
  //   const ws = new Worker(new URL("./DB/index.worker.js", import.meta.url));
  //   const _socket = new WebSocket("wss://localhost:8000/ws/");
  //   // _ws.send("tetst")
  //   // const connectData = encode({
  //   //   id: Date.now(),
  //   //   action: "connect",
  //   //   params: { site: "test", topic: "101" },
  //   // });
  //   // ws.postMessage(connectData, [connectData.buffer]);
  //   const _handler = await getConnectionHandlerSimplePeer(
  //     "test",
  //     "101",
  //     (msg, opt) => ws.postMessage(msg, opt)
  //   );
  //   Object.assign(handler, _handler);
  //   ws.onmessage = ({ data }) => {
  //     _handler.sendPeer(data.result, data.peerId);
  //   };
  // }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledDiv>
        {pageComponent}
        <BlinkDialog />
        {/* {page && <AsyncPage />} */}
        {/* <Button onClick={handleConnect}>test</Button>
        <Main /> */}
      </StyledDiv>
    </ThemeProvider>
  );
}

export default App;
