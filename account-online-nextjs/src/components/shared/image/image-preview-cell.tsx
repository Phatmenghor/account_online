"use client";

import { useState } from "react";
import { Download, Eye, ImageOff, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getImageService } from "@/services/dashboard/image/image.service";

interface ImagePreviewCellProps {
  imageId: string;
  label?: string;
  /** Thumbnail size class — defaults to "w-10 h-10" */
  size?: string;
}

export function ImagePreviewCell({
  imageId,
  label = "Image",
  size = "w-10 h-10",
}: ImagePreviewCellProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!imageId) {
    return (
      <div
        className={`${size} rounded-md bg-muted flex items-center justify-center`}
      >
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  const src = getImageService(imageId);

  const handleDownload = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = imageId;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  if (imgError) {
    return (
      <div
        className={`${size} rounded-md bg-muted flex items-center justify-center`}
      >
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail with hover actions */}
      <div
        className={`relative ${size} rounded-md overflow-hidden border border-border group cursor-pointer`}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {/* Hover overlay with icons */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/20 hover:bg-white/40 text-white"
            title="Preview"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={handleDownload}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/20 hover:bg-white/40 text-white"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Fullscreen preview dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {label}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-center bg-black/5 min-h-[400px] max-h-[80vh] p-4">
            <img
              src={src}
              alt={label}
              className="max-h-[75vh] max-w-full object-contain rounded-md shadow"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
