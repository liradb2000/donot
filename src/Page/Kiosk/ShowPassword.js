import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import ClientSideRenderer from "../../plugin/templateRenderer";
import {
  setPageIdx,
  useMisc,
  useNetworkStatus,
  useTemplates,
} from "../../store";
import { shallow } from "zustand/shallow";
import { useContractorPrivate } from "./Store";
import { useMemo } from "react";
import PrintRenderer from "../../plugin/printerTemplate";
import { useErrorState } from "./Diag";

export function ShwoPasswordPage() {
  const [open, setOpen] = useState(false);
  const rtcHandler = useNetworkStatus((status) => status.rtc, shallow);
  const template = useTemplates((state) => state.visit, shallow);
  const [building, room, password, phone, name, visit] = useContractorPrivate(
    (state) => [
      state.apartment_building,
      state.apartment_room,
      state.apartment_password,
      state.contractor_id,
      state.contractor_name,
      state.visit,
    ],
    shallow
  );
  const [day, apartMisc] = useMisc(
    (state) => [state.day, state.apartment],
    shallow
  );
  const data = useMemo(
    () => ({
      building,
      room,
      room_password: password[day],
      building_password: apartMisc[building].building_password,
      contact: apartMisc[building].contact,
      phone,
      name,
      visit_type: visit,
    }),
    [building, room, password, day, apartMisc, phone, name, visit]
  );
  function handleOnSendSMS() {
    rtcHandler.send({ id: Date.now(), action: "sms", data: data });
    // fetchWithAuth(
    //   `/client/send/sms/`,
    //   { method: "POST" },
    //   { building: building, room: room, visitlog: true }
    // )
    //   .then(() => {
    //     useErrorState.setState({
    //       title: "발송 성공",
    //       msg: "성공적으로 안내 문자를 발송하였습니다.",
    //       timer: [() => skipPage(1), 10],
    //     });
    //   })
    //   .catch(() => {
    //     useErrorState.setState({
    //       title: "발송 오류",
    //       msg: "안내 문자를 발송하지 못했습니다.\n 60초 후 다시 시도하여십시오.",
    //     });
    //   });
  }

  async function handleOnPrint() {
    rtcHandler.send({
      id: Date.now(),
      action: "print",
      data: await PrintRenderer(data),
    });
    useErrorState.setState({
      title: "인쇄 성공",
      msg: "성공적으로 인쇄하였습니다.",
      timer: [() => setPageIdx("Kiosk/Agreement"), 10],
    });
    // const printer = useSystemSettings.getState().printDevice;
    // if (!component?.data || !printer) return;
    // PrintRenderer(component?.data)
    //   .then((bin) => printer.transferOut(2, bin))
    //   .then(() => {
    //     useErrorState.setState({
    //       title: "인쇄 성공",
    //       msg: "성공적으로 인쇄하였습니다.",
    //       timer: [() => skipPage(1), 10],
    //     });
    //   })
    //   .catch(() => {
    //     useErrorState.setState({
    //       title: "인쇄 오류",
    //       msg: "인쇄하지 못했습니다.\n 60초 후 다시 시도하여십시오.",
    //     });
    //   });
  }
  function handleBeforeFetchVisitData(e) {
    const { item } = e.currentTarget.dataset;
    setOpen(item);
  }

  useEffect(() => {
    if (visit && open) {
      if (visit === "sms") handleOnSendSMS();
      else handleOnPrint();
      setOpen(false);
    }
  }, [visit]);

  useEffect(() => {
    rtcHandler.send({
      id: Date.now(),
      action: "visitLog",
      data: { building, room, name, phone },
    });
    // fetchWithAuth(
    //   `/client/room/pwd/`,
    //   { method: "POST" },
    //   { building: building, room: room }
    // )
    //   .then((resp) => {
    //     // handle success
    //     const { template, ...data } = resp.data;
    //     setComponent({ template, data });
    //   })
    //   .catch(function (e) {
    //     // handle error
    //     if (e.response.status === 401) {
    //       handleHome();
    //     }
    //   });
  }, []);

  return (
    <React.Fragment>
      <ClientSideRenderer template={template} data={data} />
      <Stack alignItems="center" spacing={1}>
        <ButtonGroup>
          {rtcHandler && (
            <Button
              data-item="sms"
              className="minWidth"
              variant="contained"
              onClick={!visit ? handleBeforeFetchVisitData : handleOnSendSMS}
            >
              문자 발송
            </Button>
          )}
          <Button
            data-item="print"
            className="minWidth"
            variant="contained"
            onClick={!visit ? handleBeforeFetchVisitData : handleOnPrint}
          >
            인쇄
          </Button>
        </ButtonGroup>
      </Stack>
      <Backdrop open={open} />
    </React.Fragment>
  );
}
