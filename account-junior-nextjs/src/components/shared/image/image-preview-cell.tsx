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

  if (!imageId || imageId === "null" || imageId === "undefined") {
    return (
      <div className={`${className} rounded-md bg-muted flex items-center justify-center border border-border flex-shrink-0`}>
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const src = getImageService(imageId);
  const lowerId = imageId.toLowerCase();
  const isPdf = lowerId.endsWith(".pdf") || lowerId.includes(".pdf");

  useEffect(() => {
    if (open && isPdf && src) {
      let isSubscribed = true;
      setLoadingPdf(true);

      fetch(src)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
          }
          return res.blob();
        })
        .then((blob) => {
          if (isSubscribed) {
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
          }
        })
        .catch((err) => {
          console.error(`[PDF PREVIEW] Error loading PDF blob for '${imageId}':`, err);
        })
        .finally(() => {
          if (isSubscribed) setLoadingPdf(false);
        });

      return () => {
        isSubscribed = false;
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      };
    }
  }, [open, isPdf, src]);

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

  if (isPdf) {
    return (
      <>
        <div
          className={`group relative ${className} rounded-md overflow-hidden border border-emerald-200 bg-emerald-50/60 cursor-pointer flex-shrink-0 flex flex-col items-center justify-center p-2 text-emerald-800 hover:border-emerald-400 transition-colors`}
          style={{ contain: "layout paint" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px]">PDF</span>
            <span className="truncate max-w-[110px] text-[11px]">{label || "Document"}</span>
          </div>

          {/* Action Buttons: Eye on Left, Download on Right (Show on Hover Only) */}
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            className="absolute top-1 left-1 z-10 p-1 rounded bg-black/60 hover:bg-black text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
            title="Preview PDF"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="absolute top-1 right-1 z-10 p-1 rounded bg-black/60 hover:bg-black text-white shadow disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
            title="Download PDF"
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
                <DialogTitle className="text-base font-semibold">{label} (PDF Document)</DialogTitle>
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
              <div className="flex items-center justify-center bg-muted/30 min-h-[450px] h-[78vh] p-2 relative">
                {loadingPdf ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading PDF Document...</span>
                  </div>
                ) : (
                  <object
                    data={pdfBlobUrl || src}
                    type="application/pdf"
                    className="w-full h-full rounded-md border-0"
                  >
                    <iframe
                      src={pdfBlobUrl || src}
                      title={label}
                      className="w-full h-full rounded-md border-0"
                    />
                  </object>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  if (imgError) {
    return (
      <div className={`${className} rounded-md bg-muted flex items-center justify-center border border-border flex-shrink-0`}>
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`group relative ${className} rounded-md overflow-hidden border border-border cursor-pointer flex-shrink-0 hover:border-primary/50 transition-colors`}
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

        {/* Action Buttons: Eye on Left, Download on Right (Show on Hover Only) */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1 left-1 z-10 p-1 rounded bg-black/60 hover:bg-black text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
          title="Preview"
        >
          <Eye className="w-3 h-3" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute top-1 right-1 z-10 p-1 rounded bg-black/60 hover:bg-black text-white shadow disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
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

