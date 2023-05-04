import {
    Button,
    Dialog,
    DialogActions,
    DialogContentText,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {create} from "zustand";
export const useErrorState = create(set => ({
    title: null,
    msg: null,
    actions: [],
    timer: [],
    setup: ({ title, msg, actions = [], timer = [] }) =>
        set({ title, msg, actions, timer }),
}));

export function ErrorDialogComponent() {
    const [title, msg, actions, timer, setup] = useErrorState(state => [
        state.title,
        state.msg,
        state.actions,
        state.timer,
        state.setup,
    ]);
    const [countdown, setCountdown] = useState(0);

    function handleOnClose() {
        setCountdown(0);
        setup({ title: null, msg: null, actions: [], timer: [] });
        timer[0]?.();
    }

    useEffect(() => {
        let id =
            timer.length === 2 &&
            timer[1] > 0 &&
            setTimeout(() => {
                handleOnClose();
                timer[0]?.();
            }, timer[1] * 1000);

        if (timer.length === 2 && timer[1] > 0) {
            setCountdown(timer[1]);
        }

        let count_id =
            timer.length === 2 &&
            timer[1] > 0 &&
            setInterval(() => {
                setCountdown(v => v - 1);
            }, 1000);

        return () => {
            setCountdown(0);
            if (id !== false) clearTimeout(id);
            if (count_id !== false) clearInterval(count_id);
        };
    }, [timer]);

    return (
        <Dialog open={!!msg} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontSize: { sm: "1.95rem" } }}>
                {title}
            </DialogTitle>
            <DialogContentText sx={{ p: 2 }}>
                <Typography
                    sx={{ fontSize: { sm: "1.75rem" }, whiteSpace: "pre" }}>
                    {msg}
                </Typography>
            </DialogContentText>
            <DialogActions>
                {actions?.map(([k, v]) => (
                    <Button variant="contained" onClick={v}>
                        {k}
                    </Button>
                ))}
                <Button
                    variant="contained"
                    sx={{ fontSize: { sm: "1.75rem" }, color: "white" }}
                    onClick={handleOnClose}>
                    확인 {countdown > 0 && ` ( ${countdown} )`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
