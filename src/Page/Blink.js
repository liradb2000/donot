import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { usePage } from "../store";
import { shallow } from "zustand/shallow";

export function BlinkDialog() {
  const [open, setBlink] = usePage(
    (state) => [state.blink, state.setBlink],
    shallow
  );
  function handleClose() {
    setBlink(false);
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="bllink-dialog-title"
      aria-describedby="bllink-dialog-description"
    >
      <DialogTitle id="bllink-dialog-title">알림</DialogTitle>
      <DialogContent>
        <DialogContentText id="bllink-dialog-description">
          키오스크 확인 메세지
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
