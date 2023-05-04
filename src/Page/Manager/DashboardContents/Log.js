import { Button, ButtonGroup, List, ListItem } from "@mui/material";
import { useNetworkStatus } from "../../../store";

export function ServerPage({ socket }) {
  return (
    <List dense>
      <ListItem>계약자 DB 복사 요청...</ListItem>
      <ListItem>계약자 DB 복사 중...</ListItem>
      <ListItem>계약 정보 DB 복사 요청...</ListItem>
      <ListItem>계약 정보 DB 복사 중...</ListItem>
      <ButtonGroup>
        <Button>계약자 재복사</Button>
        <Button>계약 정보 재복사</Button>
      </ButtonGroup>
    </List>
  );
}
