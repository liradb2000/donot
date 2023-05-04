import React, { forwardRef, useLayoutEffect, useState } from "react";
import {
  Button,
  Checkbox,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useContractorPrivate } from "./Store";
import { shallow } from "zustand/shallow";
import { db } from "../../DB/db.index";
import { setPageIdx } from "../../store";

// const items = [
//     "301동 1101호",
//     "101동 1102호",
//     "401동 1105호",
//     "201동 1108호",
//     "101동 1109호",
// ];

export function SelectApartmentPage() {
  const [phone, name, apartment_id, setApart] = useContractorPrivate(
    (state) => [
      state.contractor_id,
      state.contractor_name,
      state.apartment_id,
      state.setApartment,
    ],
    shallow
  );
  const [apartList, setApartList] = useState([]);

  function handleOnClick(e) {
    const idx = e.currentTarget.dataset.idx;
    if (idx === undefined) return;
    setApart(apartList[idx]);
    // setAddress(e.currentTarget.dataset.item);
    // setBuilding(e.currentTarget.dataset.building);
    // setRoom(e.currentTarget.dataset.room);
  }
  function handleClickNext() {
    setPageIdx("Kiosk/DbCheckApartment")
  }

  useLayoutEffect(() => {
    db.m2m
      .where("contractor_id")
      .equals(phone)
      .toArray()
      .then((m2mRows) =>
        Promise.all(m2mRows.map((_m2m) => db.apartment.get(_m2m.apartment_id)))
      )
      .then((a) => setApartList(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      {/* {(!state?.location ?? true) && <Redirect to="/" />} */}
      <div className="title">
        <Typography variant="h5">계약자 동•호수 확인</Typography>
      </div>
      <List dense>
        {apartList.map((i, index) => (
          <ListItemButton key={index} data-idx={index} onClick={handleOnClick}>
            <ListItemIcon>
              <Checkbox
                className="checkboxcls"
                checked={i.building_room === apartment_id}
              />
            </ListItemIcon>
            <ListItemText primary={`${i.building}동 ${i.room}호`} />
          </ListItemButton>
        ))}
      </List>
      <Typography variant="caption">
        고객님의 동•호수를 선택하신 후 '확인'버튼을 누르세요.
      </Typography>
      <Button
        className="minWidth"
        variant="contained"
        disabled={!apartment_id}
        onClick={handleClickNext}
      >
        확인
      </Button>
    </React.Fragment>
  );
}
