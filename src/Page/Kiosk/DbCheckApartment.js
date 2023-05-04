import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import { useContractorPrivate } from "./Store";
import { shallow } from "zustand/shallow";
import { setPageIdx } from "../../store";

export function DbCheckApartmentPage() {
  const [name, building, room] = useContractorPrivate(
    (state) => [
      state.contractor_name,
      state.apartment_building,
      state.apartment_room,
    ],
    shallow
  );
  function hadnleClickNext() {
    setPageIdx("Kiosk/PasswordAgreement");
  }
  function hadnleClickHome() {
    setPageIdx("Kiosk/Agreement");
  }
  return (
    <React.Fragment>
      <div className="title">
        <Typography variant="h5">계약자(고객) 정보 확인</Typography>
      </div>
      <Typography variant="h5">
        <b>{`${building}동 ${room}호`}</b>
      </Typography>
      <Typography variant="h5">
        <b>{name}</b>
      </Typography>
      <Typography variant="h6">고객님의 동•호수가 맞으십니까?</Typography>
      <Stack direction="row" spacing={2}>
        <Button
          className="minWidth"
          variant="contained"
          onClick={hadnleClickNext}
        >
          예
        </Button>
        <Button
          className="minWidth"
          variant="contained"
          onClick={hadnleClickHome}
        >
          아니오
        </Button>
      </Stack>
    </React.Fragment>
  );
}
