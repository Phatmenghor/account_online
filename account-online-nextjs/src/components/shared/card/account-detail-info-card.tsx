"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface DetailCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function DetailCard({
  title,
  icon: Icon,
  children,
  className = "",
}: DetailCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function InfoRow({ label, value, className = "" }: InfoRowProps) {
  return (
    <div className={`flex justify-between items-start gap-4 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground min-w-fit">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium text-right break-words flex-1">
        {value || "---"}
      </span>
    </div>
  );
}

export function InfoRowWithBadge({
  label,
  value,
  badgeVariant = "default",
}: InfoRowProps & { badgeVariant?: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <Badge variant={badgeVariant as any}>
        {value || "---"}
      </Badge>
    </div>
  );
}

export function Divider() {
  return <div className="border-t" />;
}
