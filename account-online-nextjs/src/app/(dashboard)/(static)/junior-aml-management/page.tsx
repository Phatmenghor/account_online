'use client';

import React, { useEffect, useState } from 'react';
import { axiosClientWithAuth } from '@/utils/axios';
import { Card } from '@/components/ui/card';
import { ShieldCheck, RefreshCw, CheckCircle, Search, AlertTriangle, XCircle } from 'lucide-react';

export default function JuniorAmlManagementPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosClientWithAuth.get('/api/v1/junior-account/all-aml?pageNo=1&pageSize=50');
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
      item.legalId?.toLowerCase().includes(term) ||
      item.familyName?.toLowerCase().includes(term) ||
      item.givenName?.toLowerCase().includes(term) ||
      item.guardianName?.toLowerCase().includes(term) ||
      item.guardianLegalId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-500" /> Junior AML Compliance Management
          </h1>
          <p className="text-sm text-muted-foreground">Compliance review & AML screening records for Junior Accounts</p>
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
          placeholder="Search by Legal ID, Name, or Guardian..."
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
                <th className="p-3">Child Name</th>
                <th className="p-3">Legal ID</th>
                <th className="p-3">Guardian</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Branch</th>
                <th className="p-3">AML Status</th>
                <th className="p-3">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading records...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No Junior AML records found
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {item.familyName} {item.givenName}
                    </td>
                    <td className="p-3 font-mono">{item.legalId}</td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{item.guardianName}</div>
                      <div className="text-[11px] text-muted-foreground">{item.guardianLegalId} ({item.guardianRelationship})</div>
                    </td>
                    <td className="p-3 font-mono">{item.phoneNumber || item.guardianPhone}</td>
                    <td className="p-3">{item.branch}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {item.status === 'APPROVE' && <CheckCircle className="w-3 h-3" />}
                        {item.status === 'PENDING' && <AlertTriangle className="w-3 h-3" />}
                        {item.status === 'REJECT' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
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
