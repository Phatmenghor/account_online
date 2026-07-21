"use client";

import { useCallback, useEffect, useState } from "react";
import { DailyCountItem, TopUserOpenAccount, TopAmlActionUser } from "@/types/dashboard/dashboard.model";
import {
  getAccountOpeningChartService,
  getAmlHitsChartService,
  getTopUsersOpenAccountService,
  getTopAmlActionUsersService,
} from "@/features/account-opening/services/report.service";
import { AccountOpeningChartCard } from "./_components/account-opening-chart-card";
import { AmlHitsChartCard } from "./_components/aml-hits-chart-card";
import { TopUsersOpenAccountCard } from "./_components/top-users-open-account-card";
import { TopAmlActionsCard } from "./_components/top-aml-actions-card";

function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const toDate = dateStr(new Date());
  const fromDateObj = new Date();
  fromDateObj.setMonth(fromDateObj.getMonth() - 1);
  const fromDate = dateStr(fromDateObj);

  const [accountChart, setAccountChart] = useState<DailyCountItem[]>([]);
  const [amlChart, setAmlChart] = useState<DailyCountItem[]>([]);
  const [topUsers, setTopUsers] = useState<TopUserOpenAccount[]>([]);
  const [topAmlUsers, setTopAmlUsers] = useState<TopAmlActionUser[]>([]);

  const [loadingAccountChart, setLoadingAccountChart] = useState(false);
  const [loadingAmlChart, setLoadingAmlChart] = useState(false);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [loadingAmlUsers, setLoadingAmlUsers] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoadingAccountChart(true);
    setLoadingAmlChart(true);
    setLoadingTopUsers(true);
    setLoadingAmlUsers(true);

    const [accChart, amlHits, users, amlUsers] = await Promise.allSettled([
      getAccountOpeningChartService(fromDate, toDate),
      getAmlHitsChartService(fromDate, toDate),
      getTopUsersOpenAccountService(),
      getTopAmlActionUsersService(),
    ]);

    setAccountChart(accChart.status === "fulfilled" ? accChart.value : []);
    setAmlChart(amlHits.status === "fulfilled" ? amlHits.value : []);
    setTopUsers(users.status === "fulfilled" ? users.value : []);
    setTopAmlUsers(amlUsers.status === "fulfilled" ? amlUsers.value : []);

    setLoadingAccountChart(false);
    setLoadingAmlChart(false);
    setLoadingTopUsers(false);
    setLoadingAmlUsers(false);
  }, [fromDate, toDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountOpeningChartCard data={accountChart} loading={loadingAccountChart} />
        <AmlHitsChartCard data={amlChart} loading={loadingAmlChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopUsersOpenAccountCard users={topUsers} loading={loadingTopUsers} />
        <TopAmlActionsCard users={topAmlUsers} loading={loadingAmlUsers} />
      </div>
    </div>
  );
}


