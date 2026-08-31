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
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!imageId || imageId === "null" || imageId === "undefined") {
    return (
      <div className={`${className} rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0`}>
        <ImageOff className="w-4 h-4 text-slate-400" />
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
          className={`group relative ${className} rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/60 cursor-pointer flex-shrink-0 flex flex-col items-center justify-center p-2 text-emerald-800 hover:border-emerald-400 transition-all duration-200 shadow-sm hover:shadow`}
          style={{ contain: "layout paint" }}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px]">PDF</span>
            <span className="truncate max-w-[110px] text-[11px]">{label || "Document"}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            className="absolute top-1.5 left-1.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
            title="Preview PDF"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white shadow disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
            title="Download PDF"
          >
            {downloading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
          </button>
        </div>

        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[1000px] w-[95vw] h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white flex flex-col">
              <DialogHeader className="px-5 py-3.5 border-b border-slate-100 bg-white flex flex-row items-center justify-between shrink-0">
                <DialogTitle className="text-sm sm:text-base font-semibold text-slate-800">{label} (PDF Document)</DialogTitle>
                <div className="flex items-center gap-2 pr-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="h-8 gap-1.5 text-xs rounded-xl border-slate-200"
                  >
                    {downloading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                    {downloading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 flex items-center justify-center bg-slate-900/5 p-2 relative overflow-hidden">
                {loadingPdf ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs font-medium">Loading PDF Document...</span>
                  </div>
                ) : (
                  <object
                    data={pdfBlobUrl || src}
                    type="application/pdf"
                    className="w-full h-full rounded-xl border-0"
                  >
                    <iframe
                      src={pdfBlobUrl || src}
                      title={label}
                      className="w-full h-full rounded-xl border-0"
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
      <div className={`${className} rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0`}>
        <ImageOff className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <div
        className={`group relative ${className} rounded-xl overflow-hidden border border-slate-200 cursor-pointer flex-shrink-0 hover:border-primary/60 transition-all duration-200 shadow-sm hover:shadow bg-slate-50`}
        style={{ contain: "layout paint" }}
        onClick={() => setOpen(true)}
      >
        {!imgLoaded && <div className="absolute inset-0 bg-slate-200/60 animate-pulse" />}

        <img
          src={mounted ? src : undefined}
          alt={label}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="w-full h-full object-contain"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: `opacity 0.25s ${ease}`,
            willChange: "opacity",
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1.5 left-1.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
          title="Preview Image"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black text-white shadow disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
          title="Download Image"
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />}
        </button>
      </div>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-auto max-w-[92vw] sm:max-w-[85vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white flex flex-col transition-all duration-300">
            <DialogHeader className="px-5 py-3.5 border-b border-slate-100 bg-white flex flex-row items-center justify-between shrink-0">
              <DialogTitle className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                {label}
              </DialogTitle>
              <div className="flex items-center gap-2 pr-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="h-8 gap-1.5 text-xs rounded-xl border-slate-200"
                >
                  {downloading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Download className="w-3.5 h-3.5" />}
                  {downloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </DialogHeader>
            <div className="flex items-center justify-center bg-slate-900/5 p-4 sm:p-6 overflow-hidden min-w-[280px] min-h-[220px]">
              <img
                src={src}
                alt={label}
                decoding="async"
                className="max-h-[78vh] max-w-[85vw] w-auto h-auto object-contain rounded-xl shadow-md transition-all duration-300"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
