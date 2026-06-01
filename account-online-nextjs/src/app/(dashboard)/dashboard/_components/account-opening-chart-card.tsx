"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
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
import { AmlStatisticsModel } from "@/models/aml/chart/aml-chart.response";

ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AccountOpeningChartCardProps {
  data: AmlStatisticsModel[];
  loading: boolean;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AccountOpeningChartCard({ data, loading }: AccountOpeningChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const total = data.reduce((acc, d) => acc + d.successCount, 0);
  const todayCount = data.find((d) => d.date === todayKey())?.successCount ?? 0;

  useEffect(() => {
    if (!chartRef.current || loading) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.map((d) => {
      try {
        return format(new Date(d.date), "MMM d");
      } catch {
        return d.date;
      }
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Account Openings",
            data: data.map((d) => d.successCount),
            borderColor: "hsl(221 83% 53%)",
            backgroundColor: "hsla(221, 83%, 53%, 0.08)",
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.4,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "hsl(var(--popover))",
            titleColor: "hsl(var(--foreground))",
            bodyColor: "hsl(var(--muted-foreground))",
            borderColor: "hsl(var(--border))",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => items[0]?.label ?? "",
              label: (item) => `Openings: ${item.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "hsl(var(--muted-foreground))",
              font: { size: 11 },
              maxTicksLimit: 10,
            },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: { color: "hsl(var(--border))", lineWidth: 0.8 },
            ticks: {
              color: "hsl(var(--muted-foreground))",
              font: { size: 11 },
              precision: 0,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
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
