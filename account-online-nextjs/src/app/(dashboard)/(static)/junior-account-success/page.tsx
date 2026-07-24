'use client';

import React, { useEffect, useState } from 'react';
import { axiosClientWithAuth } from '@/utils/axios';
import { Card } from '@/components/ui/card';
import { Baby, RefreshCw, CheckCircle, Search, User } from 'lucide-react';

export default function JuniorAccountSuccessPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosClientWithAuth.get('/api/v1/junior-account/all-final?pageNo=1&pageSize=50');
      const list = res.data?.data?.content || res.data?.content || [];
      setData(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.cif?.toLowerCase().includes(term) ||
      item.legalId?.toLowerCase().includes(term) ||
      item.guardianName?.toLowerCase().includes(term) ||
      item.guardianLegalId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Baby className="w-6 h-6 text-teal-500" /> Junior Account Openings
          </h1>
          <p className="text-sm text-muted-foreground">List of all created CPBank Junior Savings accounts</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 max-w-sm bg-card border rounded-lg px-3 py-2 text-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by CIF, Child NID, or Guardian NID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent focus:outline-none w-full text-xs"
        />
      </div>

      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-3">Child Info</th>
                <th className="p-3">Guardian Info</th>
                <th className="p-3">Mode</th>
                <th className="p-3">CIF Number</th>
                <th className="p-3">KHR Account</th>
                <th className="p-3">USD Account</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    No Junior Accounts found
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-foreground">
                        {item.legalLastNameEn} {item.legalFirstNameEn}
                      </div>
                      <div className="text-[11px] text-muted-foreground">NID: {item.legalId || 'NO NID'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{item.guardianName}</div>
                      <div className="text-[11px] text-muted-foreground">NID: {item.guardianLegalId} ({item.guardianRelationship})</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.hasNid ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                        {item.hasNid ? 'WITH NID' : 'NO NID'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-teal-600">{item.cif}</td>
                    <td className="p-3 font-mono">{item.khrAccount}</td>
                    <td className="p-3 font-mono">{item.usdAccount}</td>
                    <td className="p-3">{item.branchCode}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
