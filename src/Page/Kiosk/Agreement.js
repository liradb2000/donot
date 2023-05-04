import React, { forwardRef, useEffect } from "react";
import { Button, Typography } from "@mui/material";

import agreement from "./assets/agreement.svg";
import { setPageIdx } from "../../store";
import { useContractorPrivate } from "./Store";

export function AgreementPage() {
  function handleOnClick() {
    setPageIdx("Kiosk/CheckPhoneNumber");
  }
  useEffect(() => {
    useContractorPrivate.getState().clear();
  }, []);
  return (
    <React.Fragment>
      <div className="title">
        <Typography variant="h5">모바일 계약자 확인</Typography>
      </div>
      <Button
        className="rounded minWidth"
        variant="contained"
        size="large"
        onClick={handleOnClick}
      >
        시작하기
      </Button>
      <img
        src={agreement}
        alt="agreement"
        style={{ width: "80%", padding: `0 8px` }}
      />
    </React.Fragment>
  );
}
