"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";

interface ReferenceDocUploadSectionProps {
  refDocType: string;
  onRefDocTypeChange: (val: string) => void;
  refDocFileName: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReferenceDocUploadSection({
  refDocType,
  onRefDocTypeChange,
  refDocFileName,
  onFileUpload,
}: ReferenceDocUploadSectionProps) {
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="w-1 h-4 rounded-full bg-slate-300 flex-shrink-0" />
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
          {locale === "kh" ? "3. ឯកសារយោងអត្តសញ្ញាណ" : "3. Reference Document Upload"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">
            {locale === "kh" ? "ជ្រើសរើសប្រភេទឯកសារយោង" : "Select Document Type"} <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Select value={refDocType} onValueChange={onRefDocTypeChange}>
            <SelectTrigger className="w-full h-9 text-sm rounded-xl">
              <SelectValue placeholder={locale === "kh" ? "ជ្រើសរើសប្រភេទឯកសារយោង" : "Select Document Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BIRTH_CERTIFICATE">
                {locale === "kh" ? "សំបុត្រកំណើតកុមារ (Child Birth Certificate)" : "Child Birth Certificate"}
              </SelectItem>
              <SelectItem value="PARENT_NID">
                {locale === "kh" ? "អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ ឪពុក/ម្តាយ/អាណាព្យាបាល (Parent NID)" : "Parent / Guardian NID"}
              </SelectItem>
              <SelectItem value="FAMILY_BOOK">
                {locale === "kh" ? "សៀវភៅគ្រួសារ / សៀវភៅស្នាក់នៅ (Family / Residency Book)" : "Family Book / Residency Book"}
              </SelectItem>
              <SelectItem value="PASSPORT">
                {locale === "kh" ? "លិខិតឆ្លងដែន (Passport)" : "Passport"}
              </SelectItem>
              <SelectItem value="OTHER_DOC">
                {locale === "kh" ? "ឯកសារយោងផ្សេងៗ (Other Official Document)" : "Other Official Document"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {locale === "kh" ? "ផ្ទុកឡើងរូបភាពឯកសារ" : "Upload Document Image"} <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary bg-slate-50/50 cursor-pointer transition-colors">
            <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
            <span className="text-xs font-bold text-slate-700">
              {refDocFileName
                ? refDocFileName
                : locale === "kh"
                ? "ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពឯកសារ"
                : "Click to Select Document Image"}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, PDF (Max 10MB)</span>
            <input type="file" onChange={onFileUpload} accept="image/*,.pdf" className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
