import { Button, ButtonGroup, TextField, styled } from "@mui/material";
import { setPageIdx, useNetworkStatus, usePage } from "../store";
const StyledDiv = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
}));
export function ChoiceRolePage() {
  function handleClickRole(e) {
    const isKiosk = e.currentTarget.dataset?.role === "kiosk";
    useNetworkStatus.getState().setRole(isKiosk);
    setPageIdx("Connector");
  }
  return (
    <StyledDiv>
      <ButtonGroup orientation="vertical" size="large">
        <Button data-role="manager" onClick={handleClickRole}>
          매니저
        </Button>
        <Button data-role="kiosk" onClick={handleClickRole}>
          키오스크
        </Button>
      </ButtonGroup>
    </StyledDiv>
  );
}
