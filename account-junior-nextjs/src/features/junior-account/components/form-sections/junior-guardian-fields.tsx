"use client";

import React from "react";
import { JuniorCustomerPayload } from "../../services/junior-account-service";
import { SectionLabel } from "./junior-personal-fields";

interface JuniorGuardianFieldsProps {
  formData: JuniorCustomerPayload;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const JuniorGuardianFields = ({
  formData,
  onChange,
}: JuniorGuardianFieldsProps) => {
  return (
    <div className="space-y-4 pt-2">
      <SectionLabel label="2. Parent / Legal Guardian Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Guardian National ID Number *
          </label>
          <input
            type="text"
            name="guardian_legal_id"
            value={formData.guardian_legal_id || ""}
            onChange={onChange}
            placeholder="Guardian NID e.g. 0101928374"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Full Name *</label>
          <input
            type="text"
            name="guardian_name"
            value={formData.guardian_name || ""}
            onChange={onChange}
            placeholder="Guardian Full Name"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Phone Number *</label>
          <input
            type="tel"
            name="guardian_phone"
            value={formData.guardian_phone || ""}
            onChange={onChange}
            placeholder="012345678"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Relationship to Child *</label>
          <select
            name="guardian_relationship"
            value={formData.guardian_relationship || "FATHER"}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="LEGAL_GUARDIAN">Legal Guardian</option>
          </select>
        </div>
      </div>
    </div>
  );
};
