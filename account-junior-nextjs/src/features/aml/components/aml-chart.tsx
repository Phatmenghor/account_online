"use client";

import { AllAmlStatisticsModel } from "@/features/aml/types/chart/aml-chart.response";
import React, { useEffect, useRef } from "react";
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
  Chart,
} from "chart.js";

ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Button } from "@/components/ui/button";
import { Search, XCircle } from "lucide-react";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";

interface AmlStatisticsChartProps {
  data: AllAmlStatisticsModel;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  defaultFromDate: string;
  defaultToDate: string;
}

const AmlStatisticsChart = ({
  data,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onClear,
  defaultFromDate,
  defaultToDate,
}: AmlStatisticsChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      if (ctx) {
        const labels = data.map((item) =>
          new Date(item.date).toLocaleDateString()
        );

        const successData = data.map((x) => x.successCount);
        const failedData = data.map((x) => x.failureCount);
        const amlData = data.map((x) => x.amlCount);

        chartInstanceRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Success Count",
                data: successData,
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
              {
                label: "Failure Count",
                data: failedData,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
              {
                label: "AML Count",
                data: amlData,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: "top" },
              title: {
                display: true,
                text: "Account Online Monitor Statistics",
                font: { size: 18 },
              },
            },
            scales: {
              x: { grid: { color: "rgba(0,0,0,0.1)" } },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.1)" },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filter Bar BELOW the 3 count boxes */}
      <div className="flex gap-2 mb-2 items-center">
        <CustomDatePicker
          value={fromDate}
          onChange={onFromDateChange}
          placeholder="From Date"
        />

        <CustomDatePicker
          value={toDate}
          onChange={onToDateChange}
          placeholder="To Date"
        />

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onSearch}
          disabled={!fromDate || !toDate}
        >
          <Search className="w-4 h-4" /> Apply
        </Button>

        {(fromDate !== defaultFromDate || toDate !== defaultToDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={onClear}
          >
            <XCircle className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-0">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default AmlStatisticsChart;


