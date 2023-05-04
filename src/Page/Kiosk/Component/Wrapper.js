import {
  buttonBaseClasses,
  listItemButtonClasses,
  listItemClasses,
  listItemTextClasses,
  styled,
  typographyClasses,
} from "@mui/material";
import { useUISettings } from "../../../store";
import { shallow } from "zustand/shallow";
import { pure_prefix } from "../../../urls";
import { ErrorDialogComponent } from "../Diag";

const BackgroundDiv = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  // backgroundColor: "#001F41",
  // backgroundImage: `url(${backgroundImg})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  overflow: "hidden auto",
  display: "flex",
  [`& > .wrapper`]: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "auto",
    [`& > *`]: { margin: `${theme.spacing(2)} 0` },
    [`& > img.logo`]: {
      height: theme.typography.h4.fontSize,
      maxWidth: "100%",
      objectFit: "contain",
    },
    [`& > div.title`]: {
      display: "flex",
      alignItems: "flex-end",
      [`& > .${typographyClasses.root}`]: {
        fontWeight: 600,
      },
      [`& > img.logoImage`]: {
        height: theme.typography.h3.fontSize,
        objectFit: "contain",
        margin: `0 ${theme.spacing(1)}`,
        marginBottom: 4,
      },
    },

    [`& > div.description`]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    [`& > img.qrImg`]: {
      borderRadius: "10%",
      objectFit: "contain",
      maxWidth: "80%",
      maxHeight: "90vh",
      padding: theme.spacing(2),
    },
    [`& > div.qrImg`]: {
      borderRadius: "10%",
      maxWidth: `min(80vw, 90vh)`,
      maxHeight: `min(80vw, 90vh)`,
      backgroundColor: "white",
      width: 256,
      height: 256,
      padding: theme.spacing(2),
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    [`& .${buttonBaseClasses.root}`]: {
      // color: theme.palette.text.primary,
      [`&.${buttonBaseClasses.disabled}`]: {
        color: theme.palette.text.disabled,
      },
      [`&.rounded`]: {
        borderRadius: 360,
      },
      [`&.minWidth`]: {
        minWidth: 128,
      },
    },
    [theme.breakpoints.up("sm")]: {
      [`& > img.logo`]: {
        height: theme.typography.h3.fontSize,
        maxWidth: "100%",
        objectFit: "contain",
      },
      [`& > div.title`]: {
        margin: "30px 0",
        [`& > .${typographyClasses.root}`]: {
          ...theme.typography.h3,
          fontWeight: 400,
          // fontSize: "1.9rem",
        },
      },
      [`& .${listItemButtonClasses.root} .${typographyClasses.body1}`]: {
        fontSize: "1.9rem",
        fontWeight: "100",
      },
      [`& .${listItemClasses.root} .${typographyClasses.body1}`]: {
        fontSize: "1.9rem",
        fontWeight: "100",
      },
      [`& .${buttonBaseClasses.root}.rounded`]: {
        fontSize: "2rem",
      },
      [`& .${buttonBaseClasses.root}.minWidth`]: {
        fontSize: "2rem",
      },
      [`& .${typographyClasses.h5}`]: {
        ...theme.typography.h5,
        fontSize: "2rem",
      },
      [`& .${typographyClasses.h6}`]: {
        ...theme.typography.h5,
        fontSize: "1.9rem",
      },
      [`& .${typographyClasses.caption}`]: {
        fontSize: "1.15rem",
      },
      [`& .${listItemTextClasses.primary}`]: {
        fontSize: "2rem",
      },
      [`& .checkboxcls > .MuiSvgIcon-root`]: { fontSize: "2rem" },
    },
    [`& div.naviBtnStack`]: {
      // marginTop: "100px",
      // flex end?
      [`& span`]: {
        padding: "20px",
      },
    },
  },
}));
export function KioskWrapper({ children }) {
  const [bgPattern, bgColor, logo] = useUISettings(
    (state) => [state.bgPattern, state.bgColor, state.logo],
    shallow
  );
  return (
    <BackgroundDiv
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgPattern
          ? `url(${pure_prefix}${bgPattern})`
          : undefined,
      }}
    >
      <div className="wrapper">
        <img src={`${pure_prefix}${logo}`} alt="logo" className="logo" />
        {children}
      </div>
      <ErrorDialogComponent />
    </BackgroundDiv>
  );
}
