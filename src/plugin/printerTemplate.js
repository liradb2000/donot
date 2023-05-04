import React from "react";
import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from "react-thermal-printer";
import Handlebars from "handlebars";
import { Parser, ProcessNodeDefinitions } from "html-to-react";
import { useTemplates } from "../store";

const htmlParser = new Parser();
const ProcessNodeDef = new ProcessNodeDefinitions(React);

const processingInstructions = [
  {
    // replaceChildren: true,
    shouldProcessNode: function (node) {
      return node.name && node.name === "br";
    },
    processNode: function (node, children, index) {
      return <Br {...node.attribs} />;
      //   return children;
    },
  },
  {
    // replaceChildren: true,
    shouldProcessNode: function (node) {
      return node.name && node.name === "line";
    },
    processNode: function (node, children, index) {
      return <Line {...node.attribs} />;
      //   return children;
    },
  },
  {
    // replaceChildren: true,
    shouldProcessNode: function (node) {
      return node.name && node.name === "row";
    },
    processNode: function (node, children, index) {
      return <Row {...node.attribs} />;
      //   return children;
    },
  },
  {
    // replaceChildren: true,
    shouldProcessNode: function (node) {
      return node.name && node.name === "text";
    },
    processNode: function (node, children, index) {
      return <Text {...node.attribs}>{children}</Text>;
      //   return children;
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

async function PrintRenderer(data) {
  const template = useTemplates.getState().print;
  const readyTemplate = Handlebars.compile(template);
  const printBin = htmlParser.parseWithInstructions(
    readyTemplate(data ?? {}),
    function () {
      return true;
    },
    processingInstructions
  );
  return await render(
    <Printer type="epson" width={42} characterSet="korea">
      {printBin}
      <Cut lineFeeds={6} />
    </Printer>
  );
}

export default PrintRenderer;
