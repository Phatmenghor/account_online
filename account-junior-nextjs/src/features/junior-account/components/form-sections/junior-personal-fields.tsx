"use client";

import React from "react";
import { JuniorCustomerPayload } from "../../services/junior-account-service";

interface JuniorPersonalFieldsProps {
  formData: JuniorCustomerPayload;
  hasNid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <div className="w-1 h-4 rounded-full bg-orange-500 flex-shrink-0" />
    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">{label}</p>
  </div>
);

export const JuniorPersonalFields = ({
  formData,
  hasNid,
  onChange,
}: JuniorPersonalFieldsProps) => {
  return (
    <div className="space-y-4">
      <SectionLabel label="1. Child Personal Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hasNid && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Child National ID Number (NID) *
            </label>
            <input
              type="text"
              name="legal_id"
              value={formData.legal_id || ""}
              onChange={onChange}
              placeholder="e.g. 0102030405"
              required={hasNid}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Family Name (EN) *</label>
          <input
            type="text"
            name="family_name"
            value={formData.family_name || ""}
            onChange={onChange}
            placeholder="Family Name"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Given Name (EN) *</label>
          <input
            type="text"
            name="given_name"
            value={formData.given_name || ""}
            onChange={onChange}
            placeholder="Given Name"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth || ""}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
          <select
            name="gender"
            value={formData.gender || "MALE"}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>
    </div>
  );
};
