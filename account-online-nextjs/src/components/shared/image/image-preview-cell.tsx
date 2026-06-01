"use client";

import { useState } from "react";
import { Download, Eye, ImageOff, Loader2 } from "lucide-react";
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
  const [downloading, setDownloading] = useState(false);

  if (!imageId || imgError) {
    return (
      <div className={`${className} rounded-md bg-muted flex items-center justify-center border border-border flex-shrink-0`}>
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  const src = getImageService(imageId);

  const handleDownload = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
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
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Thumbnail */}
      <div
        className={`relative ${className} rounded-md overflow-hidden border border-border group cursor-pointer flex-shrink-0`}
        onClick={() => setOpen(true)}
      >
        {/* Static placeholder — no animate-pulse to keep table smooth */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted/60" />
        )}

        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 pointer-events-none" />

        {/* Top-left: View */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 p-1 rounded-md bg-black/65 hover:bg-black/85 text-white shadow-sm"
          title="Preview"
        >
          <Eye className="w-3 h-3" />
        </button>

        {/* Top-right: Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 p-1 rounded-md bg-black/65 hover:bg-black/85 text-white shadow-sm disabled:opacity-60"
          title="Download"
        >
          {downloading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Download className="w-3 h-3" />
          }
        </button>
      </div>

      {/* Only mount Dialog when open — avoids 30 portals in the DOM */}
      {open && (
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
                  disabled={downloading}
                  className="gap-1.5"
                >
                  {downloading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />
                  }
                  {downloading ? "Downloading..." : "Download"}
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
      )}
    </>
  );
}
