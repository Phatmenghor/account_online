"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  LineController,
  Filler,
  Chart,
} from "chart.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartSkeleton } from "./chart-skeleton";
import { DailyCountItem } from "@/types/dashboard/dashboard.model";

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface AccountOpeningChartCardProps {
  data: DailyCountItem[];
  loading: boolean;
}

export function AccountOpeningChartCard({ data, loading }: AccountOpeningChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0);
  const todayCount = data.find((d) => d.date === todayKey())?.count ?? 0;

  useEffect(() => {
    if (!chartRef.current || loading) return;
    chartInstanceRef.current?.destroy();

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.map((d) => {
      try { return format(new Date(d.date), "MMM d"); } catch { return d.date; }
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Account Openings",
          data: data.map((d) => d.count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.08)",
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#f9fafb",
            bodyColor: "#d1d5db",
            borderColor: "#374151",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => ` Openings: ${item.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#6b7280", font: { size: 11 }, maxTicksLimit: 10 },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb", lineWidth: 0.8 },
            ticks: { color: "#6b7280", font: { size: 11 }, precision: 0 },
            border: { display: false },
          },
        },
      },
    });

    return () => { chartInstanceRef.current?.destroy(); };
  }, [data, loading]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Account Openings</CardTitle>
            <CardDescription>Daily account openings — last 30 days</CardDescription>
          </div>
          {!loading && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{todayCount}</p>
                <p className="text-xs text-muted-foreground">today</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartSkeleton />
        ) : !data.length ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            No data for this period
          </div>
        ) : (
          <div style={{ height: 280 }}>
            <canvas ref={chartRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

