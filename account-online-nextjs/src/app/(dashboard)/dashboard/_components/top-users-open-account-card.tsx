"use client";

import { UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TopUserOpenAccount } from "@/models/dashboard/dashboard.model";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserRow({ user, rank }: { user: TopUserOpenAccount; rank: number }) {
  const initial = (user.fullName ?? "?").charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(user.fullName ?? "");

  return (
    <tr className="border-b last:border-0 hover:bg-muted/40 transition-colors">
      <td className="py-3 pr-3 w-8">
        <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          {user.profileUrl ? (
            <img
              src={user.profileUrl}
              alt={user.fullName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0",
                avatarBg
              )}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.position || "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <p className="text-sm text-muted-foreground truncate max-w-[120px]">
          {user.branch || "—"}
        </p>
      </td>
      <td className="py-3 text-right">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          {user.count}
        </span>
      </td>
    </tr>
  );
}

function UserRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-3">
        <Skeleton className="h-4 w-6" />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="py-3 text-right">
        <Skeleton className="h-5 w-10 rounded-full ml-auto" />
      </td>
    </tr>
  );
}

interface TopUsersOpenAccountCardProps {
  users: TopUserOpenAccount[];
  loading: boolean;
}

export function TopUsersOpenAccountCard({ users, loading }: TopUsersOpenAccountCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Top Users — Account Openings
            </CardTitle>
            <CardDescription>Top 10 staff by accounts submitted (all time)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground">#</th>
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Staff</th>
              <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Branch</th>
              <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)
            ) : users.length ? (
              users.map((user, i) => (
                <UserRow key={user.userId} user={user} rank={i + 1} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
