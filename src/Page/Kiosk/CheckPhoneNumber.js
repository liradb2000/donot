import React, { useEffect, useState } from "react";
import { Button, Typography, Paper } from "@mui/material";

import NumberPad from "./Component/NumberPad";
import { db } from "../../DB/db.index";
import { useContractorPrivate } from "./Store";
import { setPageIdx } from "../../store";
import { useErrorState } from "./Diag";
// const store = new Map([["isTablet", true]]);
export function CheckPhoneNumberPage() {
  // const { state } = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("010");

  function handleOnConfirm() {
    db.contractor
      .get(phoneNumber)
      .then((v) => useContractorPrivate.getState().setContractor(v))
      .then(() => {
        setPageIdx("Kiosk/SelectApartment");
      })
      .catch(() => {
        useErrorState.setState({
          title: "오류",
          msg: "등록된 전화번호가 없습니다.",
        });
      });
    // fetchWithoutAuth(
    //   "/client/tablet/",
    //   { method: "patch" },
    //   { phone: phoneNumber }
    // )
    //   .then((resp) => {
    //     localStorage.setItem("authToken", resp.data.auth_token);
    //     _privStore.name = resp.data.name;
    //     nextPage();
    //   })
    //   .catch((err) => {
    //     useErrorState.setState({
    //       title: "오류",
    //       msg: "등록된 전화번호가 없습니다.",
    //     });
    //   });
  }

  useEffect(() => {
    // localStorage.clear();
    // localStorage.setItem("isTablet", true);
    // _privStore.name = "";
  }, []);

  return (
    <React.Fragment>
      <div className="title">
        <Typography variant="h5">계약자(고객) 전화번호 확인</Typography>
      </div>
      <Typography variant="caption" sx={{ margin: "0 32px" }}>
        *공동 명의의 경우 한분만 입력해주세요
      </Typography>
      {/* <TextField value={phoneNumber}  disabled={true} id="filled-basic" label="전화번호" variant="filled" /> */}
      <Paper
        sx={{
          backgroundColor: "white",
          color: "black",
          width: "280px",
          height: "48px",
          fontSize: "40px",
          textAlign: "center",
          // verticalAlign:"middle"
          lineHeight: "48px",
        }}
      >
        {phoneNumber}
      </Paper>
      <NumberPad setPhoneNumber={setPhoneNumber} />
      <Button
        className="rounded minWidth"
        variant="contained"
        onClick={handleOnConfirm}
      >
        확인
      </Button>
      <Typography variant="caption" sx={{ margin: "0 32px" }}>
        *전화번호 입력후 '확인 버튼'을 눌러 주세요
      </Typography>
      {/* <Stack direction="row" spacing={2} className="naviBtnStack">
                <Chip
                    label="처음으로"
                    size="small"
                    variant="outlined"
                    onClick={handleHome}
                />

                <Chip
                    size="small"
                    label="이전으로"
                    variant="outlined"
                    onClick={handleBack}
                />
            </Stack> */}
    </React.Fragment>
  );
}
