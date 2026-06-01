"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { AmlStatisticsModel } from "@/models/aml/chart/aml-chart.response";
import { TopUserOpenAccount, TopAmlActionUser } from "@/models/dashboard/dashboard.model";
import { getAccountOnlineReportService } from "@/services/dashboard/aml/aml.service";
import { getTopUsersOpenAccountService, getTopAmlActionUsersService } from "@/services/dashboard/report/report.service";
import { DashboardHeader } from "./_components/dashboard-header";
import { AccountOpeningChartCard } from "./_components/account-opening-chart-card";
import { AmlHitsChartCard } from "./_components/aml-hits-chart-card";
import { TopUsersOpenAccountCard } from "./_components/top-users-open-account-card";
import { TopAmlActionsCard } from "./_components/top-aml-actions-card";

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Dashboard() {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const fromDate = formatDate(lastMonth);
  const toDate = formatDate(today);

  const [chartData, setChartData] = useState<AmlStatisticsModel[]>([]);
  const [topUsers, setTopUsers] = useState<TopUserOpenAccount[]>([]);
  const [topAmlUsers, setTopAmlUsers] = useState<TopAmlActionUser[]>([]);

  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [loadingAmlUsers, setLoadingAmlUsers] = useState(false);

  const fetchChartData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const data = await getAccountOnlineReportService({ fromDate, toDate });
      setChartData(data ?? []);
    } catch {
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [fromDate, toDate]);

  const fetchTopUsers = useCallback(async () => {
    setLoadingTopUsers(true);
    try {
      const data = await getTopUsersOpenAccountService();
      setTopUsers(data ?? []);
    } catch {
      setTopUsers([]);
    } finally {
      setLoadingTopUsers(false);
    }
  }, []);

  const fetchTopAmlUsers = useCallback(async () => {
    setLoadingAmlUsers(true);
    try {
      const data = await getTopAmlActionUsersService();
      setTopAmlUsers(data ?? []);
    } catch {
      setTopAmlUsers([]);
    } finally {
      setLoadingAmlUsers(false);
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchChartData();
    fetchTopUsers();
    fetchTopAmlUsers();
  }, [fetchChartData, fetchTopUsers, fetchTopAmlUsers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const todayLabel = format(new Date(), "EEEE, MMM d yyyy");

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader today={todayLabel} onRefresh={fetchAll} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountOpeningChartCard data={chartData} loading={loadingChart} />
        <AmlHitsChartCard data={chartData} loading={loadingChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopUsersOpenAccountCard users={topUsers} loading={loadingTopUsers} />
        <TopAmlActionsCard users={topAmlUsers} loading={loadingAmlUsers} />
      </div>
    </div>
  );
}
