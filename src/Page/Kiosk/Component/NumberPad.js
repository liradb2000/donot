import { ArrowLeft } from "@carbon/icons-react";
import { Button, Stack, styled, Typography } from "@mui/material";

const StyledButton = styled(Button)(({ theme }) => ({
  width: 64,
  height: 64,
  [theme.breakpoints.up("sm")]: {
    width: 100,
    height: 100,
  },
}));
// const sx = {
//     border: "solid",
//     width: 80,
//     height: 80,
//     // backgroundColor: 'primary.dark',
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     // textAlign:"center",
//     // verticalAlign:"middle",
//     // '&:hover': {
//     //     backgroundColor: 'primary.main',
//     //     opacity: [0.9, 0.8, 0.7],
//     // },
// }

// [`& > div.title`]: {
//     display: "flex",
//     alignItems: "flex-end",
//     [`& > .${typographyClasses.root}`]: {
//         fontWeight: 400,
//     },
//     [`& > img.logoImage`]: {
//         height: theme.typography.h3.fontSize,
//         objectFit: "contain",
//         margin: `0 ${theme.spacing(1)}`,
//         marginBottom: 4,
//     },
// },

export default function NumberPad({ setPhoneNumber }) {
  function handleOnNumber(num) {
    // console.log(ev.target.dataset.num);
    // setPhoneNumber((prev)=>`${prev}${ev.target.dataset.num}`)

    return () =>
      setPhoneNumber((prev) => {
        if (prev.length < 11) return `${prev}${num}`;
        else return prev;
      });
  }

  function handleOnDelete() {
    // 마지막 단어 날리는 함수
    setPhoneNumber((prev) => prev.slice(0, -1));
  }

  function handleOnClear() {
    setPhoneNumber("");
  }

  return (
    <div>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <StyledButton
            variant="outlined"
            data-num={1}
            onClick={handleOnNumber(1)}
          >
            <Typography variant="h3" lineHeight={1}>
              1
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={2}
            onClick={handleOnNumber(2)}
          >
            <Typography variant="h3" lineHeight={1}>
              2
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={3}
            onClick={handleOnNumber(3)}
          >
            <Typography variant="h3" lineHeight={1}>
              3
            </Typography>
          </StyledButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <StyledButton
            variant="outlined"
            data-num={4}
            onClick={handleOnNumber(4)}
          >
            <Typography variant="h3" lineHeight={1}>
              4
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={5}
            onClick={handleOnNumber(5)}
          >
            <Typography variant="h3" lineHeight={1}>
              5
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={6}
            onClick={handleOnNumber(6)}
          >
            <Typography variant="h3" lineHeight={1}>
              6
            </Typography>
          </StyledButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <StyledButton
            variant="outlined"
            data-num={7}
            onClick={handleOnNumber(7)}
          >
            <Typography variant="h3" lineHeight={1}>
              7
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={8}
            onClick={handleOnNumber(8)}
          >
            <Typography variant="h3" lineHeight={1}>
              8
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={9}
            onClick={handleOnNumber(9)}
          >
            <Typography variant="h3" lineHeight={1}>
              9
            </Typography>
          </StyledButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <StyledButton
            sx={{ p: 0 }}
            variant="outlined"
            data-num={2}
            onClick={handleOnClear}
          >
            <Typography variant="h6" lineHeight={1.1}>
              전체
              <br /> 지움
            </Typography>
          </StyledButton>
          <StyledButton
            variant="outlined"
            data-num={0}
            onClick={handleOnNumber(0)}
          >
            <Typography variant="h3" lineHeight={1}>
              0
            </Typography>
          </StyledButton>
          <StyledButton
            sx={{ p: 0 }}
            variant="outlined"
            data-num={2}
            onClick={handleOnDelete}
          >
            <Typography variant="h3" lineHeight={1}>
              <ArrowLeft fontSize="1rem" />
            </Typography>
          </StyledButton>
        </Stack>
      </Stack>
    </div>
  );
}
