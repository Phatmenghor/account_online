"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle, Eye, EyeOff, FileText, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReferenceDocUploadSectionProps {
  refDocType: string;
  onRefDocTypeChange: (val: string) => void;
  refDocFileName: string;
  refDocImagePreview?: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function ReferenceDocUploadSection({
  refDocType,
  onRefDocTypeChange,
  refDocFileName,
  refDocImagePreview,
  onFileUpload,
  error,
}: ReferenceDocUploadSectionProps) {
  const locale = useLocale();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showInlinePreview, setShowInlinePreview] = useState(false);

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "PARENT_NID":
        return locale === "kh" ? "អត្តសញ្ញាណប័ណ្ណ Parent NID" : "Parent NID";
      case "BIRTH_CERTIFICATE":
        return locale === "kh" ? "សំបុត្រកំណើត Birth Cert." : "Child Birth Cert.";
      case "FAMILY_BOOK":
        return locale === "kh" ? "សៀវភៅគ្រួសារ/ស្នាក់នៅ" : "Family Book";
      case "PASSPORT":
        return locale === "kh" ? "លិខិតឆ្លងដែន Passport" : "Passport";
      default:
        return locale === "kh" ? "ឯកសារយោង" : "Doc";
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100">
        <div className="w-1 h-3.5 rounded-full bg-slate-300 flex-shrink-0" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {locale === "kh" ? "3. ឯកសារយោងអត្តសញ្ញាណ" : "3. Reference Document Upload"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Document Type Selector (Compact Mobile Text) */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            {locale === "kh" ? "ប្រភេទឯកសារយោង" : "Doc Type"} <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Select value={refDocType} onValueChange={onRefDocTypeChange}>
            <SelectTrigger className="w-full h-9 text-sm rounded-xl bg-white border-slate-200 focus:ring-1">
              <SelectValue placeholder={locale === "kh" ? "ជ្រើសរើសប្រភេទឯកសារ" : "Select Document Type"} />
            </SelectTrigger>
            <SelectContent className="max-w-[90vw]">
              <SelectItem value="PARENT_NID" className="text-xs py-1.5">
                {locale === "kh" ? "អត្តសញ្ញាណប័ណ្ណអាណាព្យាបាល (Parent NID)" : "Parent NID"}
              </SelectItem>
              <SelectItem value="BIRTH_CERTIFICATE" className="text-xs py-1.5">
                {locale === "kh" ? "សំបុត្រកំណើតកុមារ (Birth Certificate)" : "Birth Certificate"}
              </SelectItem>
              <SelectItem value="FAMILY_BOOK" className="text-xs py-1.5">
                {locale === "kh" ? "សៀវភៅគ្រួសារ / ស្នាក់នៅ (Family Book)" : "Family Book"}
              </SelectItem>
              <SelectItem value="PASSPORT" className="text-xs py-1.5">
                {locale === "kh" ? "លិខិតឆ្លងដែន (Passport)" : "Passport"}
              </SelectItem>
              <SelectItem value="OTHER_DOC" className="text-xs py-1.5">
                {locale === "kh" ? "ឯកសារយោងផ្សេងៗ (Other Doc)" : "Other Document"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Field / Uploaded Success Card (Compact Height) */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-700">
            {locale === "kh" ? "រូបភាពឯកសារ" : "Document Image"} <span className="text-red-500 ml-0.5">*</span>
          </Label>

          {refDocFileName ? (
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2 h-8 sm:h-9">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px] sm:max-w-[140px]">
                  {refDocFileName}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {refDocImagePreview && (
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100/50 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    {locale === "kh" ? "មើល" : "View"}
                  </button>
                )}

                <label className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer">
                  <RefreshCw className="w-3 h-3" />
                  {locale === "kh" ? "ប្តូរ" : "Edit"}
                  <input type="file" onChange={onFileUpload} accept="image/*,.pdf" className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 h-8 sm:h-9 px-3 rounded-xl border border-dashed border-slate-300 hover:border-primary bg-slate-50/80 cursor-pointer transition-colors text-xs text-slate-600 font-medium">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">
                {locale === "kh" ? "ជ្រើសរើសរូបភាព (JPG, PNG)" : "Select Image (JPG, PNG)"}
              </span>
              <input type="file" onChange={onFileUpload} accept="image/*,.pdf" className="hidden" />
            </label>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}

      {/* Full-Screen Document View Modal */}
      {refDocImagePreview && (
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-2xl w-[95vw] p-3 max-h-[85vh] flex flex-col rounded-2xl">
            <DialogHeader className="pb-1.5 border-b flex flex-row items-center justify-between">
              <DialogTitle className="text-xs font-bold flex items-center gap-1.5 truncate">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{refDocFileName}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-2 bg-slate-900/90 rounded-xl mt-2">
              {refDocImagePreview.startsWith("data:application/pdf") ? (
                <iframe src={refDocImagePreview} className="w-full h-[55vh] rounded-lg" title="PDF Document" />
              ) : (
                <img src={refDocImagePreview} alt="Document Preview" className="max-h-[60vh] w-auto object-contain rounded-lg shadow-xl" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
