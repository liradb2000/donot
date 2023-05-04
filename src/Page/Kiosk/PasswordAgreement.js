import React, { useEffect, useState } from "react";
import { Button, Typography, CircularProgress } from "@mui/material";
import ClientSideRenderer, { addCheckBox } from "../../plugin/templateRenderer";
import { setPageIdx, useTemplates } from "../../store";
import { shallow } from "zustand/shallow";

export function PasswordAgreementPage() {
  const component = useTemplates((state) => state.agreement, shallow);
  const [checked, setChecked] = useState({});

  function handleClickNext() {
    setPageIdx("Kiosk/ShowPassword");
  }

  useEffect(() => {
    addCheckBox.current = (idx, value) => {
      setChecked((v) => ({ ...v, [idx]: value }));
    };
  }, []);

  return (
    <React.Fragment>
      <div className="title">
        <Typography variant="h5" sx={{ color: "#FFEC00" }}>
          세대방문 시 유의사항
        </Typography>
      </div>
      {!component ? (
        <CircularProgress />
      ) : (
        <ClientSideRenderer template={component} />
      )}

      <Button
        className="minWidth"
        variant="contained"
        onClick={handleClickNext}
        disabled={!Object.values(checked).every((v) => v)}
   
      >
        확인
      </Button>
    </React.Fragment>
  );
}
