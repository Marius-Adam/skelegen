import React from "react";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps
} from "react-syntax-highlighter";
import {
  dracula,
  okaidia,
  vscDarkPlus,
  nightOwl
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Shape } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem
} from "@/components/ui/select";

interface CodeBlockDialogProps {
  shapes: Shape[];
  showDialog?: boolean;
  setShowDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CodeBlockDialog: React.FC<CodeBlockDialogProps> = ({
  shapes,
  showDialog,
  setShowDialog
}) => {
  const muiCode = `
import Skeleton from "@mui/material/Skeleton";
${shapes
  .map(
    (shape) => `  
<Skeleton variant="${shape.type === "circle" ? "circular" : "rectangular"}" width={${
      shape.type === "circle" ? (shape.radius * 2).toFixed() : shape.width.toFixed()
    }px} height={${
      shape.type === "circle" ? (shape.radius * 2).toFixed() : shape.height.toFixed()
    }px}/>`
  )
  .join("")}`.trim();

  const shadCNCode = `
import { Skeleton } from "@/components/ui/skeleton";
${shapes
  .map(
    (shape) => `
<Skeleton className="bg-gray-300 animate-pulse w-[${
      shape.type === "circle" ? (shape.radius * 2).toFixed() : shape.width.toFixed()
    }px] h-[${
      shape.type === "circle" ? (shape.radius * 2).toFixed() : shape.height.toFixed()
    }px] rounded-${shape.type === "circle" ? "full" : shape.radius}"/>`
  )
  .join("")}`.trim();

  const chakraCode = `
import { Skeleton } from "@chakra-ui/react";
${shapes
  .map(
    (shape) => `
<Skeleton ${
      shape.type !== "circle"
        ? `width="${shape.width.toFixed()}px" height="${shape.height.toFixed()}px"`
        : `width="${(shape.radius * 2).toFixed()}px" height="${(
            shape.radius * 2
          ).toFixed()}px" borderRadius="full"`
    }/>`
  )
  .join("")}`.trim();

  const mantineCode = `
import { Skeleton } from "@mantine/core";

${shapes
  .map(
    (shape) =>
      `<Skeleton height={${
        shape.type === "circle" ? (shape.radius * 2).toFixed() : shape.height.toFixed()
      }} ${shape.type === "circle" ? "circle" : 'radius="xl"'} ${
        shape.type !== "circle" ? `width="${shape.width.toFixed()}px"` : ""
      }/>`
  )
  .join("\n")}`.trim();

  const [selectedLibrary, setSelectedLibrary] = React.useState("mui");
  const [selectedStyle, setSelectedStyle] = React.useState("dracula");

  const codeSnippets: Record<string, string> = {
    mui: muiCode,
    shadcn: shadCNCode,
    chakra: chakraCode,
    mantine: mantineCode
  };

  const styleOptions: Record<string, SyntaxHighlighterProps["style"]> = {
    dracula,
    okaidia,
    vscDarkPlus,
    nightOwl
  };

  const selectedCode = codeSnippets[selectedLibrary];

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="min-w-3xl mt-4 overflow-y-auto max-h-[90%] hidden-scrollbar space-y-4">
        <DialogTitle>Generated Skeletons</DialogTitle>

        <div className="flex gap-4 justify-between">
          <Select onValueChange={setSelectedLibrary} defaultValue="mui">
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Select Library" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mui">MUI</SelectItem>
              <SelectItem value="shadcn">ShadCN</SelectItem>
              <SelectItem value="chakra">Chakra</SelectItem>
              <SelectItem value="mantine">Mantine</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedStyle} defaultValue="dracula">
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dracula">Dracula</SelectItem>
              <SelectItem value="okaidia">Okaidia</SelectItem>
              <SelectItem value="vscDarkPlus">VSC Dark+</SelectItem>
              <SelectItem value="nightOwl">Night Owl</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CodeBlock code={selectedCode} style={styleOptions[selectedStyle]} />
        <DialogClose className="mt-4 inline-block border px-3 py-1 rounded">
          Close
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

interface CodeBlockProps {
  code: string;
  style: SyntaxHighlighterProps["style"];
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, style }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
      <SyntaxHighlighter
        language="jsx"
        style={style}
        customStyle={{ background: "transparent", fontSize: "14px" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
