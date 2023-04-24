import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  styled,
} from "@mui/material";
import { createPeerConnection } from "./testrtc";
import { Fragment, useCallback, useRef, useState } from "react";
import { db } from "../db.index";
import { handler } from "../../App";
const StyledDiv = styled("div")({
  // display: "flex",
  // flexDirection: "row",
  flex: 1,
  overflow: "hidden auto",
});
export function Main() {
  const [aparts, setAparts] = useState([]);
  const phoneRef = useRef();
  const nameRef = useRef();
  const buildingRef = useRef();
  const roomRef = useRef();
  const passwordRef = useRef();
  async function handleSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    const _phone = new FormData(e.target).get("phone");
    const rows = await Promise.all([
      db.contractor.get(_phone),
      db.m2m
        .where("contractor_id")
        .equals(_phone)
        .toArray()
        .then(
          async (_ids) =>
            await Promise.all(
              _ids.map((_id) => db.apartment.get(_id.apartment_id))
            )
        ),
    ]);
    const _contractor = rows[0];
    phoneRef.current.value = _contractor.phone;
    nameRef.current.value = _contractor.name;
    setAparts(rows[1]);
  }
  async function handleUpdateContractor(e) {
    e.preventDefault();
    e.stopPropagation();
    db.contractor
      .update(phoneRef.current.value, { name: nameRef.current.value })
      .then((update) => {
        if (update) {
          handler.send({
            type: "put",
            data: {
              table: "contractor",
              row: {
                phone: phoneRef.current.value,
                name: nameRef.current.value,
              },
            },
          });
        }
      });
  }
  return (
    <StyledDiv>
      <List className="form">
        <form onSubmit={handleSearch}>
          <ListItem>
            <TextField label="phone" name="phone" />
          </ListItem>
          <ListItem type="submit">
            <Button variant="contained" type="submit">
              search
            </Button>
          </ListItem>
        </form>
        <form onSubmit={handleUpdateContractor}>
          <ListItem>
            <TextField label="phone" inputRef={phoneRef} />
          </ListItem>
          <ListItem>
            <TextField label="name" inputRef={nameRef} />
          </ListItem>
          <ListItem type="submit">
            <Button variant="contained" type="submit">
              update
            </Button>
          </ListItem>
        </form>
        {aparts.map((row) => (
          <ListItemButton>
            <ListItemText primary={row.building_room} />
          </ListItemButton>
        ))}
        <form onSubmit={() => {}}>
          <TextField label="building" inputRef={buildingRef} />
          <TextField label="room" inputRef={roomRef} />
          <TextField label="password" inputRef={passwordRef} />
        </form>
      </List>

      {/* <ButtonGroup>
        <Button onClick={setRemoteConnectionDescription}>set</Button>
        <Button onClick={startAsSlave}>join</Button>
        <TextField multiline inputRef={ref} />
      </ButtonGroup> */}
    </StyledDiv>
  );
}
