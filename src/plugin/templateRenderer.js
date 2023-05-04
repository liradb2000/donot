import React, { useEffect, useMemo, useState } from "react";
import {
    Checkbox,
    Divider,
    ListItem,
    ListItemButton as MuiListItemButton,
    ListItemIcon,
    styled,
    Typography,
} from "@mui/material";
import Handlebars from "handlebars";
import { Parser, ProcessNodeDefinitions } from "html-to-react";
export const addCheckBox = React.createRef();

function ListItemButton({ children, idx }) {
    const [isChecked, setChecked] = useState(false);

    function handleOnClick() {
        setChecked(v => {
            addCheckBox.current?.(idx, !v);
            return !v;
        });
    }

    useEffect(() => {
        addCheckBox.current?.(idx, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <MuiListItemButton onClick={handleOnClick}>
            <ListItemIcon>
                <Checkbox checked={isChecked} />
            </ListItemIcon>
            <Typography variant="body1" whiteSpace="normal">
                {children}
            </Typography>
        </MuiListItemButton>
    );
}
const htmlParser = new Parser();
const ProcessNodeDef = new ProcessNodeDefinitions(React);
const typeTag = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "caption",
    "overline",
    "body1",
    "body2",
];
const processingInstructions = [
    {
        // replaceChildren: true,
        shouldProcessNode: function (node) {
            return node.name && typeTag.includes(node.name);
        },
        processNode: function (node, children, index) {
            return (
                <Typography variant={node.name}>
                    {node.data ?? children}
                </Typography>
            );
            //   return children;
        },
    },
    {
        // replaceChildren: true,
        shouldProcessNode: function (node) {
            return node.name && node.name === "divider";
        },
        processNode: function (node, children, index) {
            return <Divider flexItem />;
            //   return children;
        },
    },
    {
        // replaceChildren: true,
        shouldProcessNode: function (node) {
            return node.name && node.name === "checkbox";
        },
        processNode: function (node, children, index) {
            return (
                <ListItemButton key={`listitem-${index}`} idx={index}>
                    {children}
                </ListItemButton>
            );
        },
    },
    {
        // replaceChildren: true,
        shouldProcessNode: function (node) {
            return node.name && node.name === "nocheckbox";
        },
        processNode: function (node, children, index) {
            return (
                <ListItem key={`listitem-${index}`} idx={index}>
                    <Typography variant="body1" whiteSpace="normal">
                        {children}
                    </Typography>
                </ListItem>
            );
        },
    },
    {
        // Anything else
        shouldProcessNode: function (node) {
            return true;
        },
        processNode: ProcessNodeDef.processDefaultNode,
    },
];

// Handlebars.registerHelper("group", function (context, options) {
//   console.log(context)
//   console.log(options)
//   return `<div classname="center">` + options.fn(this) + "</div>";
// });

const PreviewArea = styled("div")(({ theme }) => ({
    whiteSpace: "pre",
    padding: "0 10%",
    [`& > div.center`]: {
        textAlign: "center",
        [theme.breakpoints.up("sm")]: { fontSize: "1.7rem" },
    },
}));

function ClientSideRenderer({ template, data }) {
    const [rendered, setRendered] = useState();
    const readyTemplate = useMemo(
        () => Handlebars.compile(template),
        [template]
    );

    useEffect(() => {
        let component = "";
        try {
            component = htmlParser.parseWithInstructions(
                readyTemplate(data ?? {}),
                function () {
                    return true;
                },
                processingInstructions
            );
        } catch (e) {
            console.error(e);
            component = "error";
        }
        setRendered(component);
    }, [readyTemplate, data]);

    return <PreviewArea>{rendered}</PreviewArea>;
}

export default ClientSideRenderer;
