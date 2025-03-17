"use client";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  setBackgroundImage: (img: HTMLImageElement) => void;
}

export function FileDropzone({ setBackgroundImage }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        console.log(reader);
        reader.onload = () => {
          const img = new window.Image();
          img.src = reader.result as string;
          img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            setBackgroundImage(img);
          };
        };
        reader.readAsDataURL(file);
      }
    }
  });

  return (
    <div className="w-full max-w-md space-y-6 z-10 inset-0 flex flex-col items-center justify-center m-auto h-[calc(100%-64px)]">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Image Upload</h1>
        <p className="text-muted-foreground">Upload an image to use as background</p>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer  max-w-md w-full  rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors",
          isDragActive && "border-primary bg-muted/30",
          "hover:bg-muted/30"
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-transform duration-200",
            isDragActive ? "scale-110" : "scale-100"
          )}
        >
          <div
            className={cn(
              "mb-2 rounded-full bg-muted p-2 transition-transform duration-200",
              isDragActive ? "scale-110" : "scale-100"
            )}
          >
            <Upload
              className={cn(
                "h-6 w-6 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <p className="text-sm font-medium">Drag & drop image here</p>
          <p className="text-xs text-muted-foreground">or click to browse files</p>
          <p className="mt-2 text-xs text-muted-foreground">Supports PNG, JPG, JPEG</p>
        </div>
      </div>
    </div>
  );
}
