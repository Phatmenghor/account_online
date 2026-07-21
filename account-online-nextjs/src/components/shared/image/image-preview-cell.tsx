"use client";

import { useState, useEffect } from "react";
import { Download, Eye, ImageOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getImageService } from "@/features/account-opening/services/image.service";

interface ImagePreviewCellProps {
  imageId: string;
  label?: string;
  className?: string;
}

const ease = "cubic-bezier(0.4,0,0.2,1)";

export function ImagePreviewCell({
  imageId,
  label = "Image",
  className = "w-24 h-14",
}: ImagePreviewCellProps) {
  const [open, setOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Defer src until after first paint so table text renders immediately
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const btnStyle = {
    opacity: hovered ? 1 : 0,
    transform: hovered ? "translateY(0)" : "translateY(-5px)",
    transition: `opacity 0.18s ${ease}, transform 0.18s ${ease}`,
    willChange: "opacity, transform",
  };

  return (
    <>
      <div
        className={`relative ${className} rounded-md overflow-hidden border border-border cursor-pointer flex-shrink-0`}
        style={{ contain: "layout paint" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(true)}
      >
        {/* Skeleton shown until image is loaded */}
        {!imgLoaded && <div className="absolute inset-0 bg-muted/60" />}

        <img
          src={mounted ? src : undefined}
          alt={label}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="w-full h-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: `opacity 0.25s ${ease}`,
            willChange: "opacity",
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Hover dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hovered ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0)",
            transition: `background 0.15s ${ease}`,
          }}
        />

        {/* Top-left: View */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1 left-1 p-1 rounded-md bg-black/65 hover:bg-black/85 text-white shadow-sm"
          style={btnStyle}
          title="Preview"
        >
          <Eye className="w-3 h-3" />
        </button>

        {/* Top-right: Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute top-1 right-1 p-1 rounded-md bg-black/65 hover:bg-black/85 text-white shadow-sm disabled:cursor-not-allowed"
          style={btnStyle}
          title="Download"
        >
          {downloading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Download className="w-3 h-3" />}
        </button>
      </div>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between">
              <DialogTitle className="text-base font-semibold">{label}</DialogTitle>
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
                    : <Download className="w-4 h-4" />}
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

