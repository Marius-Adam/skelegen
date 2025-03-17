import React from "react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { Shape, ShapeType } from "@/lib/types";
import {
  Trash,
  Square,
  Circle,
  RotateCcw,
  UploadCloud,
  BoneIcon,
  EyeIcon,
  Code2Icon,
  EyeClosedIcon
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

interface ToolbarProps {
  setBackgroundImage: (img: HTMLImageElement | null) => void;
  setTool: (tool: "rect" | "circle") => void;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  setIsPreviewing: React.Dispatch<React.SetStateAction<boolean>>;
  handleUndo: () => void;
  handleGenerate: () => void;
  shapes: Shape[];
  tool: ShapeType | "select";
  currentStep: number;
  backgroundImage: HTMLImageElement | null;
  isPreviewing: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  setBackgroundImage,
  setTool,
  setShapes,
  handleUndo,
  handleGenerate,
  setIsPreviewing,
  shapes,
  tool,
  currentStep,
  backgroundImage,
  isPreviewing
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
          img.src = reader.result as string;
          img.onload = () => {
            setBackgroundImage(img);
          };
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const handleClear = () => {
    setBackgroundImage(null);
    setShapes([]);
  };

  return (
    <div
      className={`grid grid-cols-3 items-center w-full z-10 
      bg-gray-100 transition-all duration-300 ease-out ${
        backgroundImage ? "h-12 px-3 py-1" : "h-16 p-4"
      }`}
    >
      <div className="flex items-center justify-start">
        <BoneIcon
          className={`transition-all duration-300 ${
            backgroundImage ? "w-5 h-5" : "w-6 h-6"
          }`}
        />
        <span
          className={`ml-2 text-lg font-bold transition-all duration-300 delay-150 ${
            backgroundImage ? "opacity-0 max-w-0" : "opacity-100 max-w-full"
          } overflow-hidden whitespace-nowrap`}
        >
          SkeletonDraw
        </span>
      </div>

      {backgroundImage && (
        <div className="flex gap-2 justify-center items-center">
          {!isPreviewing && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setTool("rect")}
                    className={`p-2 transition-all duration-300 relative ${
                      tool === "rect" ? "bg-blue-500 text-white" : ""
                    } ${backgroundImage ? "w-9 h-9" : "px-4 py-2"}`}
                  >
                    <Square className="w-5 h-5 mx-auto" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rectangle</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setTool("circle")}
                    className={`p-2 transition-all duration-300 relative ${
                      tool === "circle" ? "bg-blue-500 text-white" : ""
                    } ${backgroundImage ? "w-9 h-9" : "px-4 py-2"}`}
                  >
                    <Circle className="w-5 h-5 mx-auto" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Circle</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleUndo}
                    disabled={currentStep === 0}
                    className={`p-2 transition-all duration-300 ${
                      backgroundImage ? "w-9 h-9" : "px-4 py-2"
                    }`}
                  >
                    <RotateCcw className="w-5 h-5 mx-auto" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      )}

      {backgroundImage && (
        <div className="flex gap-2 justify-end items-center">
          {shapes.length ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsPreviewing(!isPreviewing)}
                  className={`p-2 transition-all duration-300 ${
                    backgroundImage ? "w-9 h-9" : "px-4 py-2"
                  } bg-purple-500 hover:bg-green-600 text-white`}
                >
                  {isPreviewing ? (
                    <EyeClosedIcon className="w-5 h-5 mx-auto" />
                  ) : (
                    <EyeIcon className="w-5 h-5 mx-auto" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
          ) : null}
          {shapes.length ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleGenerate}
                  className={`p-2 transition-all duration-300 ${
                    backgroundImage ? "w-9 h-9" : "px-4 py-2"
                  } bg-green-500 hover:bg-green-600 text-white`}
                >
                  <Code2Icon className="w-5 h-5 mx-auto" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code</TooltipContent>
            </Tooltip>
          ) : null}
          {!isPreviewing && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    {...getRootProps()}
                    className={`p-2 transition-all duration-300 ${
                      backgroundImage ? "w-9 h-9" : "px-4 py-2"
                    } bg-blue-500 hover:bg-blue-600 text-white`}
                  >
                    <input {...getInputProps()} className="hidden" />
                    <UploadCloud className="w-5 h-5 mx-auto" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleClear}
                    className={`p-2 transition-all duration-300 ${
                      backgroundImage ? "w-9 h-9" : "px-4 py-2"
                    } bg-red-500 hover:bg-red-600 text-white`}
                  >
                    <Trash className="w-5 h-5 mx-auto" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      )}
    </div>
  );
};
