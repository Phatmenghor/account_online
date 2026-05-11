"use client";

import React, { useState, useEffect } from "react";
import AmlStatisticsChart from "@/components/app/aml/aml-chart";
import { AllAmlStatisticsModel } from "@/models/aml/chart/aml-chart.response";
import { getAccountOnlineReportService } from "@/services/dashboard/aml/aml.service";
import { Button } from "@/components/ui/button";
import { Search, XCircle } from "lucide-react";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import Loading from "@/components/shared/common/loading";

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const Dashboard = () => {
  const [data, setData] = useState<AllAmlStatisticsModel>([]);
  const [loading, setLoading] = useState(false);

  // Previous month → Same day last month until today
  const today = new Date();

  // Get same day last month
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const defaultFromDate = formatDate(lastMonth);
  const defaultToDate = formatDate(today);

  const [fromDate, setFromDate] = useState<string>(defaultFromDate);
  const [toDate, setToDate] = useState<string>(defaultToDate);

  const fetchData = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const response = await getAccountOnlineReportService({
        fromDate: from || defaultFromDate,
        toDate: to || defaultToDate,
      });
      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, []);

  const handleSearch = () => {
    if (!fromDate || !toDate) return;
    fetchData(fromDate, toDate);
  };

  const handleClear = () => {
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    fetchData(defaultFromDate, defaultToDate);
  };

  const totalAml = data.reduce((acc, curr) => acc + curr.amlCount, 0);
  const totalSuccess = data.reduce((acc, curr) => acc + curr.successCount, 0);
  const totalFailure = data.reduce((acc, curr) => acc + curr.failureCount, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chart Container */}
      <div className="flex-1 min-h-0 border rounded-lg p-4">
        <div className="w-full h-full">
          {loading && data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loading />
            </div>
          ) : (
            <AmlStatisticsChart
              data={data}
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onSearch={handleSearch}
              onClear={handleClear}
              defaultFromDate={defaultFromDate}
              defaultToDate={defaultToDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
