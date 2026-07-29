import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { score: number; incorrectFields: string[] } | null;
}

const SuccessModal = ({ isOpen, onClose, data }: SuccessModalProps) => {
  
  // change language
  const translate = useTranslations("NIDPage");

  if (!isOpen) return null;

  const getFieldLabel = (field: string) => {
    const fieldLabels: { [key: string]: string } = {
      lastNameEn: translate("lnameEn"),
      firstNameEn: translate("fnameEn"),
      dob: translate("dob"),
      firstNameKh: translate("fnameKH"),
      lastNameKh: translate("lnameKH"),
      gender: translate("gender"),
      expiredDate: translate("exp"),
      issuedDate: translate("issued"),
    };
    return fieldLabels[field] || field;
  };

    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:max-w-[520px] w-full z-10 border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Native Mobile Drag Handle Pill */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-green-600">
              {translate("valid_success")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{translate("completed")}</p>
          <div className="bg-green-50 text-gray-600 p-3 rounded-lg">
            <p className="text-sm">
              <strong>{translate("score")}:</strong> {(data?.score || 0) * 100}%
            </p>
            <p className="text-sm mb-2">
              <strong>{translate("warning")}</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-500">
              {data?.incorrectFields.map((field, index) => (
                <li key={index}>{getFieldLabel(field)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {translate("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
