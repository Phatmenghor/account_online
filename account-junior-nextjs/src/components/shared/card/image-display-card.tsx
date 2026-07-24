"use client";

import { useState, useEffect } from "react";

interface ImageDisplayCardProps {
  title: string;
  imageName?: string;
  imageType: "nid" | "selfie";
  legalId?: string;
}

export default function ImageDisplayCard({
  title,
  imageName,
  imageType,
  legalId,
}: ImageDisplayCardProps) {
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE ?? "";

  const getImageUrl = (filename: string | undefined | null): string | null => {
    if (!filename) return null;
    return `${IMAGE_BASE_URL}/api/customer-images/${filename}`;
  };

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageName) {
      setLoadedSrc(null);
      return;
    }

    const fetchImage = async () => {
      try {
        const url = getImageUrl(imageName);
        if (url) {
          setLoadedSrc(url);
        } else {
          setLoadedSrc(null);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setLoadedSrc(null);
      }
    };

    fetchImage();
  }, [imageName]);

  const handleDownload = async () => {
    if (!imageName || !legalId) return alert("No image to download");
    try {
      const url = `${IMAGE_BASE_URL}/api/customer-images/${imageName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const extension = blob.type.replace("image/", "") || "jpg";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${legalId}_${imageType}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="w-full group relative rounded-lg border bg-background shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        <p className="text-white font-medium text-sm drop-shadow-sm">{title}</p>
      </div>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleDownload();
        }}
        className="block aspect-video relative"
      >
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {loadedSrc ? (
            <img
              src={loadedSrc}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs">
                {imageName ? "Loading..." : "No image available"}
              </span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
          <div className="bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Download Image
          </div>
        </div>
      </a>
    </div>
  );
}
