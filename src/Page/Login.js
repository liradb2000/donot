import { Button, TextField, styled } from "@mui/material";
import { authToken, setPageIdx } from "../store";
import { fetch } from "../plugin/fetch";
import { serverURL } from "../urls";
import { useEffect } from "react";
const StyledDiv = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  display: "flex",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  [`& > form`]: {
    display: "flex",
    flexDirection: "column",
    [`& > *`]: {
      margin: theme.spacing(1, 0),
    },
  },
}));
export function LoginPage() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    fetch(serverURL.login,data).then((resp) => {
      authToken.current = resp.data.Token;
      localStorage.setItem("token", resp.data.Token);
      setPageIdx("ChoiceRole");
    });
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!!token) {
      authToken.current = token;
      setPageIdx("ChoiceRole");
    }
  }, []);

  return (
    <StyledDiv>
      <form onSubmit={handleSubmit}>
        <TextField variant="filled" label="아이디" name="id" />
        <TextField
          variant="filled"
          label="비밀번호"
          name="password"
          type="password"
        />
        <Button type="submit">로그인</Button>
      </form>
    </StyledDiv>
  );
}
