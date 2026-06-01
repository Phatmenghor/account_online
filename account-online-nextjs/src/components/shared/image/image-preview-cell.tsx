"use client";

import { useState } from "react";
import { Download, Eye, ImageOff } from "lucide-react";
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
  /**
   * Tailwind classes for the thumbnail container.
   * Defaults to landscape NID-card ratio: w-24 h-14
   */
  className?: string;
}

export function ImagePreviewCell({
  imageId,
  label = "Image",
  className = "w-24 h-14",
}: ImagePreviewCellProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const placeholder = (
    <div
      className={`${className} rounded-md bg-muted flex items-center justify-center border border-border`}
    >
      <ImageOff className="w-4 h-4 text-muted-foreground" />
    </div>
  );

  if (!imageId || imgError) return placeholder;

  const src = getImageService(imageId);

  const handleDownload = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    try {
      const res = await fetch(src);
      const blob = await res.blob();
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

  return (
    <>
      {/* Thumbnail */}
      <div
        className={`relative ${className} rounded-md overflow-hidden border border-border group cursor-pointer flex-shrink-0`}
        onClick={() => setOpen(true)}
      >
        {/* Skeleton while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none" />

        {/* Top-left: View */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white shadow"
          title="Preview"
        >
          <Eye className="w-3 h-3" />
        </button>

        {/* Top-right: Download */}
        <button
          onClick={handleDownload}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white shadow"
          title="Download"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>

      {/* Full preview dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {label}
            </DialogTitle>
            <div className="flex items-center gap-2 pr-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-center bg-muted/30 min-h-[360px] max-h-[80vh] p-6">
            <img
              src={src}
              alt={label}
              decoding="async"
              className="max-h-[74vh] max-w-full object-contain rounded-md shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
