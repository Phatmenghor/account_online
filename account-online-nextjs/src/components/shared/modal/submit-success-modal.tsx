"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
  status?: string;
}

export default function SubmitSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  description,
  status = "PENDING",
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 max-h-[90vh] overflow-auto">
        {/* HEADER */}
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <Clock className="text-white" style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{title || "ស្នើសុំបានដឹងគ្នា"}</h2>
                <p className="text-xs text-gray-500 mt-0.5">ស្ថានភាពសម្ពាធរង់ចាំ</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
              {status === "PENDING" ? "ស្ថានភាពរង់ចាំ" : status}
            </Badge>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-6">
          {/* MESSAGE SECTION */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              សូមរង់ចាំ
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-khmer">
              {message}
            </p>
          </div>

          {/* INFO SECTION */}
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">ព័ត៌មានលម្អិត</h3>
            <div className="space-y-3">
              <div className="py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  ស្ថានភាពសម្ពាធ
                </p>
                <p className="text-sm text-gray-900">
                  {status === "PENDING" ? "ស្ថានភាពរង់ចាំឆ្លើយប្រតិកម្ម" : status}
                </p>
              </div>
              <div className="py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  ពេលវេលាដែលរង់ចាំ
                </p>
                <p className="text-sm text-gray-900">១-៣ ថ្ងៃធ្វើការ</p>
              </div>
              <div className="py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  ម៉ោងបើកលើ
                </p>
                <p className="text-sm text-gray-900">០៨:០០ - ១៨:០០ (ច័ន្ទ - សុក្រ)</p>
              </div>
              <div className="py-3">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  ទំនាក់ទំនង
                </p>
                <p className="text-sm text-gray-900">
                  📞 ០៧ ២០០ ០០២ / ១៨០០ ២០០ ៨៨៨<br/>
                  💬 support@cpbank.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t bg-white px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-gray-50"
          >
            ពិនិត្យរង់ចាំ
          </Button>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            ស្វាគមន៍ចូល
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
