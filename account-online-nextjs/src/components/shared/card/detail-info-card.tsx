import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DetailInfoCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DetailInfoCard: React.FC<DetailInfoCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-foreground" />}
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

interface InfoRowProps {
  label: string;
  value?: string | number | React.ReactNode;
  className?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-start py-2 border-b last:border-b-0 ${className}`}>
      <span className="font-medium text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900 text-right">
        {value || "---"}
      </span>
    </div>
  );
};

interface AddressDisplayProps {
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  label?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  province,
  district,
  commune,
  village,
  label = "Address",
}) => {
  const address = [village, commune, district, province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="py-2 border-b last:border-b-0">
      <span className="font-medium text-sm text-gray-600">{label}</span>
      <p className="text-sm text-gray-900 mt-1">{address || "---"}</p>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "error" | "warning";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "default",
}) => {
  let className = "bg-gray-100 text-gray-800";

  if (variant === "success") {
    className = "bg-green-100 text-green-800";
  } else if (variant === "error") {
    className = "bg-red-100 text-red-800";
  } else if (variant === "warning") {
    className = "bg-yellow-100 text-yellow-800";
  }

  return (
    <Badge className={`${className} font-medium px-2 py-1`}>
      {status}
    </Badge>
  );
};

interface ImagePreviewProps {
  src?: string;
  alt?: string;
  label?: string;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "Image",
  label,
  className = "h-48 w-48",
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-sm font-medium text-gray-600">{label}</span>}
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`rounded-lg border border-gray-200 object-cover ${className}`}
        />
      ) : (
        <div
          className={`rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 ${className}`}
        >
          No Image
        </div>
      )}
    </div>
  );
};
