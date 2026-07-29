"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera } from "lucide-react";
import { z } from "zod";
import {
  checkPhone,
  sendOtp,
  verifyOtp,
  getCustomerInfoByCif,
  processJuniorAccountOpening,
  fetchOccupations,
  fetchMaritalStatuses,
  JuniorCustomerPayload,
  CustomerInfo,
} from "../services/junior-account-service";
import { showToast } from "@/components/shared/common/show-toast";
import SubmitSuccessModal from "@/features/account-opening/components/submit-success-modal";
import { SubmissionProgressModal } from "@/features/account-opening/components/submission-progress-modal";

// Modular Form Sections
import { ParentVerificationSection } from "./form-sections/parent-verification-section";
import { ReferenceDocUploadSection } from "./form-sections/reference-doc-upload-section";
import { JuniorPhoneVerificationSection } from "./form-sections/junior-phone-verification-section";
import { WarningAlertModal } from "./form-sections/warning-alert-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDateTimePicker } from "@/components/shared/common/custom-datetime-picker";

const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <div className="w-1 h-4 rounded-full bg-slate-300 flex-shrink-0" />
    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
      {label}
    </p>
  </div>
);

const Divider = () => <div className="border-t border-slate-100" />;

interface JuniorNoNidFormProps {
  branches?: any[];
  occupations?: any[];
  maritalStatuses?: any[];
}

export function JuniorNoNidForm({ occupations = [], branches = [], maritalStatuses = [] }: JuniorNoNidFormProps) {
  const translate = useTranslations("NIDPage");
  const translateCommon = useTranslations("common");
  const locale = useLocale();

  const [loading, setLoading] = useState(false);
  const [apiOccupations, setApiOccupations] = useState<any[]>(occupations);
  const [apiMaritalStatuses, setApiMaritalStatuses] = useState<any[]>(maritalStatuses);

  useEffect(() => {
    if (occupations && occupations.length > 0) {
      setApiOccupations(occupations);
    } else {
      fetchOccupations().then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setApiOccupations(data);
        }
      });
    }
  }, [occupations]);

  useEffect(() => {
    if (maritalStatuses && maritalStatuses.length > 0) {
      setApiMaritalStatuses(maritalStatuses);
    } else {
      fetchMaritalStatuses().then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setApiMaritalStatuses(data);
        }
      });
    }
  }, [maritalStatuses]);

  // Modals & States
  const [parentWarningModal, setParentWarningModal] = useState(false);
  const [unregisteredPhone, setUnregisteredPhone] = useState("");

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "warning" | "error";
  }>({ isOpen: false, title: "", message: "", type: "error" });

  const showAlertModal = (title: string, message: string, type: "warning" | "error" = "error") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Parent Verification State
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtpCode, setParentOtpCode] = useState("");
  const [parentVerified, setParentVerified] = useState(false);
  const [parentInfo, setParentInfo] = useState<CustomerInfo | null>(null);

  // Junior Phone OTP Verification State
  const [juniorOtpSent, setJuniorOtpSent] = useState(false);
  const [juniorOtpCode, setJuniorOtpCode] = useState("");
  const [juniorVerified, setJuniorVerified] = useState(false);

  // Countdown Timers (60 seconds)
  const [parentCountdown, setParentCountdown] = useState<number>(0);
  const [juniorCountdown, setJuniorCountdown] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (parentCountdown > 0) {
      interval = setInterval(() => {
        setParentCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [parentCountdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (juniorCountdown > 0) {
      interval = setInterval(() => {
        setJuniorCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [juniorCountdown]);

  // Reference document & child face photo state
  const [refDocType, setRefDocType] = useState("PARENT_NID");
  const [refDocFileName, setRefDocFileName] = useState("");
  const [refDocImagePreview, setRefDocImagePreview] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelfiePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          selfie_image_name: file.name,
          selfie_image_base64: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form State (default branch_code: 001)
  const [formData, setFormData] = useState<JuniorCustomerPayload>({
    has_nid: false,
    legal_id: "",
    family_name: "",
    given_name: "",
    last_name_kh: "",
    first_name_kh: "",
    date_of_birth: "",
    gender: "Male",
    phone_number: "",
    branch_code: "KH0012011",
    marital_status: "",
    occupation: "",
    legal_address: "",
    guardian_legal_id: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_relationship: "FATHER",
    guardian_cif: "",
    referral_id: "",
    reference_doc_type: "PARENT_NID",
    reference_doc_name: "",
  });

  const [successData, setSuccessData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const handleInputChange = (field: keyof JuniorCustomerPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "guardian_phone") {
      setParentOtpSent(false);
      setParentVerified(false);
      setParentOtpCode("");
      setParentCountdown(0);
    }
    if (field === "phone_number") {
      setJuniorOtpSent(false);
      setJuniorVerified(false);
      setJuniorOtpCode("");
      setJuniorCountdown(0);
    }
  };

  const getOccupationName = (occ: any) => {
    if (locale === "kh") {
      return occ.nameKh || occ.lookupKhmerName || occ.nameEn || occ.name || occ.occupationCode || occ.code || String(occ.id || "");
    }
    return occ.nameEn || occ.lookupName || occ.nameKh || occ.name || occ.occupationCode || occ.code || String(occ.id || "");
  };

  const getMaritalStatusName = (ms: any) => {
    if (locale === "kh") {
      return ms.nameKh || ms.lookupKhmerName || ms.nameEn || ms.name || ms.maritalCode || ms.code || String(ms.id || "");
    }
    return ms.nameEn || ms.lookupName || ms.nameKh || ms.name || ms.maritalCode || ms.code || String(ms.id || "");
  };

  // 1. Parent Phone Check & OTP
  const handleCheckParentPhone = async () => {
    if (!formData.guardian_phone) {
      showAlertModal(
        locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាល!" : "Please Enter Parent Phone Number!",
        locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាលដើម្បីផ្ទៀងផ្ទាត់គណនី CPBank Mobile Banking។" : "Please enter parent phone number to verify CPBank Mobile Banking account."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await checkPhone(formData.guardian_phone);
      if (!res.hasAccount) {
        setUnregisteredPhone(formData.guardian_phone);
        setParentWarningModal(true);
        return;
      }

      if (res.cif) {
        setFormData((prev) => ({ ...prev, guardian_cif: res.cif }));
        try {
          const info = await getCustomerInfoByCif(res.cif);
          setParentInfo(info);
          const parentBranch = info.coCode || info.companyBook || "KH0012011";
          setFormData((prev) => ({
            ...prev,
            guardian_cif: res.cif,
            guardian_name: (info.names && info.names.length > 0) ? info.names[0] : (info.shortNames && info.shortNames.length > 0 ? info.shortNames[0] : prev.guardian_name),
            guardian_legal_id: info.legalId || prev.guardian_legal_id,
            guardian_doc_type: info.legalDocName || "NATIONAL.ID",
            guardian_dob: info.birthDate || "",
            guardian_address: (info.streets && info.streets.length > 0) ? info.streets[0] : (prev.legal_address || ""),
            guardian_info_json: JSON.stringify(info),
            branch_code: parentBranch,
            legal_address: (info.streets && info.streets.length > 0) ? info.streets[0] : (prev.legal_address || ""),
          }));
        } catch (e) {
          console.warn("Parent background info lookup error", e);
        }
      }

      await sendOtp(formData.guardian_phone);
      setParentOtpSent(true);
      setParentCountdown(60);
      showToast.success(locale === "kh" ? "បានផ្ញើលេខកូដ OTP ទៅទូរស័ព្ទអាណាព្យាបាលដោយជោគជ័យ!" : "OTP sent to parent phone successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to verify parent phone.";
      showAlertModal(locale === "kh" ? "ការផ្ទៀងផ្ទាត់បរាជ័យ!" : "Verification Failed!", msg);
    } finally {
      setLoading(false);
    }
  };

  // Refs to prevent infinite auto-verify loops
  const lastTriedParentOtpRef = useRef<string>("");
  const lastTriedJuniorOtpRef = useRef<string>("");

  const handleVerifyParentOtp = async () => {
    if (!parentOtpCode || parentOtpCode.length !== 6) {
      showAlertModal(
        locale === "kh" ? "លេខកូដ OTP មិនត្រឹមត្រូវ!" : "Invalid OTP Code!",
        locale === "kh" ? "សូមបញ្ចូលលេខកូដ OTP ៦ខ្ទង់ឲ្យបានត្រឹមត្រូវ។" : "Please enter a valid 6-digit OTP code."
      );
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(formData.guardian_phone || "", parentOtpCode);
      setParentVerified(true);
      setParentCountdown(0);
      showToast.success(locale === "kh" ? "បានផ្ទៀងផ្ទាត់ OTP អាណាព្យាបាលដោយជោគជ័យ!" : "Parent OTP verified successfully!");
    } catch (err: any) {
      lastTriedParentOtpRef.current = "";
      const msg = err.response?.data?.message || err.message || "Invalid OTP code.";
      showAlertModal(locale === "kh" ? "ការផ្ទៀងផ្ទាត់ OTP បរាជ័យ!" : "OTP Verification Failed!", msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Junior Phone Pre-check & OTP Send
  const handleSendJuniorOtp = async () => {
    if (!formData.phone_number) {
      showAlertModal(
        locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទកុមារ!" : "Please Enter Junior Phone Number!",
        locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទទំនាក់ទំនងកុមារដើម្បីទទួលលេខកូដ OTP ផ្ទៀងផ្ទាត់។" : "Please enter junior contact phone number to receive OTP code."
      );
      return;
    }
    setLoading(true);
    try {
      const checkRes = await checkPhone(formData.phone_number);
      if (checkRes.hasAccount) {
        showAlertModal(
          translate("account_exists_title"),
          translate("account_exists_message")
        );
        return;
      }

      await sendOtp(formData.phone_number);
      setJuniorOtpSent(true);
      setJuniorCountdown(60);
      showToast.success(locale === "kh" ? "បានផ្ញើលេខកូដ OTP ទៅទូរស័ព្ទកុមារដោយជោគជ័យ!" : "OTP sent to junior phone successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to send junior OTP.";
      showAlertModal(locale === "kh" ? "ការផ្ញើ OTP បរាជ័យ!" : "Failed to Send OTP!", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJuniorOtp = async () => {
    if (!juniorOtpCode || juniorOtpCode.length !== 6) {
      showAlertModal(
        locale === "kh" ? "លេខកូដ OTP មិនត្រឹមត្រូវ!" : "Invalid OTP Code!",
        locale === "kh" ? "សូមបញ្ចូលលេខកូដ OTP ៦ខ្ទង់ឲ្យបានត្រឹមត្រូវ។" : "Please enter a valid 6-digit OTP code."
      );
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(formData.phone_number || "", juniorOtpCode);
      setJuniorVerified(true);
      setJuniorCountdown(0);
      showToast.success(locale === "kh" ? "បានផ្ទៀងផ្ទាត់ OTP កុមារដោយជោគជ័យ!" : "Junior OTP verified successfully!");
    } catch (err: any) {
      lastTriedJuniorOtpRef.current = "";
      const msg = err.response?.data?.message || err.message || "Invalid OTP code.";
      showAlertModal(locale === "kh" ? "ការផ្ទៀងផ្ទាត់ OTP បរាជ័យ!" : "OTP Verification Failed!", msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify Parent OTP (runs ONLY ONCE per 6-digit code entry)
  useEffect(() => {
    if (
      formData.guardian_phone &&
      parentOtpCode.length === 6 &&
      /^\d{6}$/.test(parentOtpCode) &&
      !parentVerified &&
      !loading &&
      lastTriedParentOtpRef.current !== parentOtpCode
    ) {
      lastTriedParentOtpRef.current = parentOtpCode;
      handleVerifyParentOtp();
    }
  }, [parentOtpCode, formData.guardian_phone, parentVerified, loading]);

  // Auto-verify Junior OTP (runs ONLY ONCE per 6-digit code entry)
  useEffect(() => {
    if (
      formData.phone_number &&
      juniorOtpCode.length === 6 &&
      /^\d{6}$/.test(juniorOtpCode) &&
      !juniorVerified &&
      !loading &&
      lastTriedJuniorOtpRef.current !== juniorOtpCode
    ) {
      lastTriedJuniorOtpRef.current = juniorOtpCode;
      handleVerifyJuniorOtp();
    }
  }, [juniorOtpCode, formData.phone_number, juniorVerified, loading]);

  // File Upload with Base64 conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRefDocFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setRefDocImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          reference_doc_type: refDocType,
          reference_doc_name: file.name,
          reference_doc_image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setFormData({
      has_nid: false,
      legal_id: "",
      family_name: "",
      given_name: "",
      last_name_kh: "",
      first_name_kh: "",
      date_of_birth: "",
      gender: "Male",
      phone_number: "",
      branch_code: "KH0012011",
      marital_status: "",
      occupation: "",
      legal_address: "",
      guardian_legal_id: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_relationship: "FATHER",
      guardian_cif: "",
      referral_id: "",
      reference_doc_type: "PARENT_NID",
      reference_doc_name: "",
      reference_doc_image: "",
      selfie_image_name: "",
    });
    setParentVerified(false);
    setParentOtpSent(false);
    setParentOtpCode("");
    setParentInfo(null);
    setJuniorVerified(false);
    setJuniorOtpSent(false);
    setJuniorOtpCode("");
    setParentCountdown(0);
    setJuniorCountdown(0);
    setRefDocFileName("");
    lastTriedParentOtpRef.current = "";
    lastTriedJuniorOtpRef.current = "";
  };

  // Zod Validation Schema
  const validateFormWithZod = (): boolean => {
    // 1. Parent Verification Check
    if (!parentVerified) {
      const msg = locale === "kh" ? "សូមផ្ទៀងផ្ទាត់លេខទូរស័ព្ទ និង OTP អាណាព្យាបាលជាមុនសិន" : "Please verify parent phone and OTP first";
      showToast.error(msg);
      showAlertModal(locale === "kh" ? "មិនទាន់ផ្ទៀងផ្ទាត់អាណាព្យាបាល!" : "Parent Not Verified!", msg);
      return false;
    }

    // 2. Child Face Photo Check
    if (!selfieFileName && !formData.selfie_image_name && !selfiePreview) {
      const msg = locale === "kh" ? "សូមថត ឬផ្ទុកឡើងរូបថតផ្ទាល់ខ្លួនកុមារ" : "Please upload child face photo";
      showToast.error(msg);
      showAlertModal(locale === "kh" ? "សូមថត ឬផ្ទុកឡើងរូបថតកុមារ!" : "Please Upload Child Face Photo!", msg);
      return false;
    }

    // 3. Reference Document Check
    if (!formData.reference_doc_name && !formData.reference_doc_image) {
      const msg = locale === "kh" ? "សូមផ្ទុកឡើងរូបភាពឯកសារយោង (សំបុត្រកំណើត ឬអត្តសញ្ញាណប័ណ្ណ)" : "Please upload reference document image";
      showToast.error(msg);
      showAlertModal(locale === "kh" ? "សូមផ្ទុកឡើងរូបភាពឯកសារយោង!" : "Please Upload Reference Document!", msg);
      return false;
    }

    // 4. Junior Phone Verification Check
    if (!juniorVerified) {
      const msg = locale === "kh" ? "សូមផ្ទៀងផ្ទាត់លេខទូរស័ព្ទ និង OTP របស់កុមារជាមុនសិន" : "Please verify junior phone and OTP first";
      showToast.error(msg);
      showAlertModal(locale === "kh" ? "មិនទាន់ផ្ទៀងផ្ទាត់ទូរស័ព្ទកុមារ!" : "Junior Phone Not Verified!", msg);
      return false;
    }

    // 5. Zod Schema Validation
    const schema = z.object({
      guardian_phone: z.string().min(8, locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាលឲ្យបានត្រឹមត្រូវ" : "Please enter valid parent phone number"),
      first_name_kh: z.string().min(1, locale === "kh" ? "សូមបញ្ចូលនាមខ្លួនជាភាសាខ្មែរ" : "Please enter First Name in Khmer"),
      last_name_kh: z.string().min(1, locale === "kh" ? "សូមបញ្ចូលគោត្តនាមជាភាសាខ្មែរ" : "Please enter Last Name in Khmer"),
      given_name: z.string().min(1, locale === "kh" ? "សូមបញ្ចូលនាមខ្លួនជាអក្សរឡាតាំង (Given Name)" : "Please enter Given Name in English"),
      family_name: z.string().min(1, locale === "kh" ? "សូមបញ្ចូលគោត្តនាមជាអក្សរឡាតាំង (Family Name)" : "Please enter Family Name in English"),
      date_of_birth: z.string().min(1, locale === "kh" ? "សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើតកុមារ" : "Please select Date of Birth"),
      gender: z.string().min(1, locale === "kh" ? "សូមជ្រើសរើសភេទ" : "Please select Gender"),
      phone_number: z.string().min(8, locale === "kh" ? "សូមបញ្ចូលលេខទូរស័ព្ទកុមារឲ្យបានត្រឹមត្រូវ" : "Please enter valid Junior phone number"),
    });

    const result = schema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Please complete all required fields correctly.";
      showToast.error(firstError);
      showAlertModal(locale === "kh" ? "ព័ត៌មានមិនទាន់គ្រប់គ្រាន់!" : "Incomplete Information!", firstError);
      return false;
    }

    return true;
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormWithZod()) {
      return;
    }
    setLoading(true);
    setIsSubmittingModal(true);

    try {
      const res = await processJuniorAccountOpening(formData);
      setIsSubmittingModal(false);
      setSuccessData(res);
      setShowSuccessModal(true);
    } catch (err: any) {
      setIsSubmittingModal(false);
      const msg = err.response?.data?.message || err.message || "Account opening failed.";
      showToast.error(msg);
      showAlertModal(locale === "kh" ? "ការបង្កើតគណនីបរាជ័យ!" : "Account Creation Failed!", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/60">
      {/* ── SECTION 1: Modular Parent Verification ── */}
      <div className="p-5 sm:p-6">
        <ParentVerificationSection
          guardianPhone={formData.guardian_phone || ""}
          onPhoneChange={(phone) => handleInputChange("guardian_phone", phone)}
          parentVerified={parentVerified}
          parentOtpSent={parentOtpSent}
          parentOtpCode={parentOtpCode}
          onOtpCodeChange={setParentOtpCode}
          parentCountdown={parentCountdown}
          loading={loading}
          parentInfo={parentInfo}
          onSendOtp={handleCheckParentPhone}
        />
      </div>

      <Divider />

      {/* ── SECTION 2: Junior Personal Details ── */}
      <div className="p-5 sm:p-6">
        <SectionLabel label={locale === "kh" ? "2. ព័ត៌មានផ្ទាល់ខ្លួនកុមារ" : "2. Personal Details"} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("firstNameKh")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              placeholder={translate("firstNameKh")}
              value={formData.last_name_kh || ""}
              onChange={(e) => handleInputChange("last_name_kh", e.target.value)}
              className="w-full h-9 text-sm rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("lastNameKH")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              placeholder={translate("lastNameKH")}
              value={formData.first_name_kh || ""}
              onChange={(e) => handleInputChange("first_name_kh", e.target.value)}
              className="w-full h-9 text-sm rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("familyNameEn")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              placeholder={translate("familyNameEn")}
              value={formData.family_name || ""}
              onChange={(e) => handleInputChange("family_name", e.target.value)}
              className="w-full h-9 text-sm rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("givenNameEn")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Input
              placeholder={translate("givenNameEn")}
              value={formData.given_name || ""}
              onChange={(e) => handleInputChange("given_name", e.target.value)}
              className="w-full h-9 text-sm rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("dateOfBirth")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <CustomDateTimePicker
              value={formData.date_of_birth || ""}
              onChange={(value) => handleInputChange("date_of_birth", value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("gender")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Select
              value={formData.gender || "Male"}
              onValueChange={(val) => handleInputChange("gender", val)}
            >
              <SelectTrigger className="w-full h-9 text-sm rounded-xl">
                <SelectValue placeholder={translateCommon("selectGender")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{locale === "kh" ? "ប្រុស (Male)" : "Male"}</SelectItem>
                <SelectItem value="Female">{locale === "kh" ? "ស្រី (Female)" : "Female"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("marital")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Select
              value={formData.marital_status || ""}
              onValueChange={(val) => handleInputChange("marital_status", val)}
            >
              <SelectTrigger className="w-full h-9 text-sm rounded-xl">
                <SelectValue placeholder={translateCommon("selectMarital")} />
              </SelectTrigger>
              <SelectContent>
                {apiMaritalStatuses.length > 0 ? (
                  apiMaritalStatuses.map((ms, idx) => {
                    const label = getMaritalStatusName(ms);
                    const val = String(
                      ms.maritalCode ||
                      ms.code ||
                      (ms.id !== undefined && ms.id !== null ? ms.id : "") ||
                      ms.lookupId ||
                      `ms-${idx}`
                    );
                    return (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    );
                  })
                ) : (
                  <>
                    <SelectItem value="Single">{locale === "kh" ? "នៅលីវ (Single)" : "Single"}</SelectItem>
                    <SelectItem value="Married">{locale === "kh" ? "រៀបការរួច (Married)" : "Married"}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              {translate("occupation")} <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <Select
              value={formData.occupation || ""}
              onValueChange={(val) => handleInputChange("occupation", val)}
            >
              <SelectTrigger className="w-full h-9 text-sm rounded-xl">
                <SelectValue placeholder={translateCommon("selectOccupation")} />
              </SelectTrigger>
              <SelectContent>
                {apiOccupations.length > 0 ? (
                  apiOccupations.map((occ, idx) => {
                    const label = getOccupationName(occ);
                    const val = String(
                      occ.occupationCode ||
                      (occ.id !== undefined && occ.id !== null ? occ.id : "") ||
                      occ.code ||
                      occ.lookupId ||
                      `occ-${idx}`
                    );
                    return (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    );
                  })
                ) : (
                  <>
                    <SelectItem value="STUDENT">{locale === "kh" ? "សិស្ស / និស្សិត" : "Student"}</SelectItem>
                    <SelectItem value="UNDERAGE">{locale === "kh" ? "កុមារតូច" : "Minor / Underage"}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700">{translate("referralId")}</Label>
            <Input
              placeholder={translate("referralIdPlaceholder")}
              value={formData.referral_id || ""}
              onChange={(e) => handleInputChange("referral_id", e.target.value)}
              className="w-full h-9 text-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* ── SECTION 3: Documents & Child Face Photo ── */}
      <div className="p-5 sm:p-6 space-y-5">
        <SectionLabel label={locale === "kh" ? "3. រូបថត និងឯកសារយោងកុមារ" : "3. Child Face Photo & Reference Document"} />

        {/* 1. Child Face Photo (Selfie) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700 block">
            {locale === "kh" ? "រូបថតផ្ទាល់ខ្លួនកុមារ (Child Face Photo)" : "Child Face Photo"} <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <label
            htmlFor="child-selfie-upload-input"
            className={`group relative flex flex-col items-center justify-center h-36 sm:h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 ${
              selfiePreview
                ? "border-emerald-500/50 bg-emerald-50/20 hover:border-emerald-500"
                : "border-slate-200 bg-slate-50/50 hover:border-primary hover:bg-primary/5"
            }`}
          >
            {selfiePreview ? (
              <>
                <img src={selfiePreview} alt="Child Face Photo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-semibold gap-2">
                  <Camera className="w-4 h-4" />
                  <span>{locale === "kh" ? "ផ្លាស់ប្តូររូបថត" : "Change Photo"}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {selfieFileName || (locale === "kh" ? "ចុចទីនេះដើម្បីថត ឬជ្រើសរើសរូបថតកុមារ" : "Click to Take or Upload Child Face Photo")}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG (Max 10MB)</p>
                </div>
              </div>
            )}
            <input
              type="file"
              id="child-selfie-upload-input"
              accept="image/*"
              onChange={handleSelfieUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 2. Reference Document */}
        <ReferenceDocUploadSection
          refDocType={refDocType}
          onRefDocTypeChange={(val) => {
            setRefDocType(val);
            setFormData((prev) => ({ ...prev, reference_doc_type: val }));
          }}
          refDocFileName={refDocFileName}
          refDocImagePreview={refDocImagePreview}
          onFileUpload={handleFileUpload}
        />
      </div>

      <Divider />

      {/* ── SECTION 4: Modular Junior Phone Verification ── */}
      <div className="p-5 sm:p-6">
        <JuniorPhoneVerificationSection
          phoneNumber={formData.phone_number || ""}
          onPhoneChange={(phone) => handleInputChange("phone_number", phone)}
          juniorVerified={juniorVerified}
          juniorOtpSent={juniorOtpSent}
          juniorOtpCode={juniorOtpCode}
          onOtpCodeChange={setJuniorOtpCode}
          juniorCountdown={juniorCountdown}
          loading={loading}
          onSendOtp={handleSendJuniorOtp}
        />
      </div>

      {/* ── ACTION BAR ── */}
      <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end items-center gap-3">
        <Button
          type="submit"
          disabled={loading || !parentVerified}
          className={`h-10 px-8 font-semibold rounded-xl text-sm gap-2 transition-all ${
            parentVerified && !loading
              ? "bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
          }`}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{translate("submitting")}...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{translate("submit")}</span>
            </>
          )}
        </Button>
      </div>

      {/* UNREGISTERED PARENT PHONE WARNING MODAL */}
      <WarningAlertModal
        isOpen={parentWarningModal}
        onClose={() => setParentWarningModal(false)}
        title={locale === "kh" ? "លេខទូរស័ព្ទអាណាព្យាបាលមិនទាន់ចុះឈ្មោះ!" : "Parent Phone Not Registered!"}
        message={
          locale === "kh"
            ? `លេខទូរស័ព្ទ ${unregisteredPhone} មិនទាន់មានគណនី Mobile Banking នៅក្នុងប្រព័ន្ធ CPBank ទេ។ សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាលដែលមានចុះឈ្មោះ Mobile Banking រួចរាល់ ឬបង្កើតគណនីធនាគារធម្មតាជាមុនសិន។`
            : `Phone number ${unregisteredPhone} does not have a CPBank Mobile Banking account. Please enter a registered parent phone number or create a standard bank account first.`
        }
        type="warning"
      />

      {/* GENERIC ERROR/ALERT MODAL */}
      <WarningAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: "", message: "" })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* SUBMISSION PROGRESS LOADING MODAL */}
      <SubmissionProgressModal
        isOpen={isSubmittingModal}
        title={locale === "kh" ? "កំពុងដំណើរការបង្កើតគណនី Junior" : "Creating Junior Account..."}
        message={locale === "kh" ? "សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការបង្កើតគណនី និងភ្ជាប់សេវា Mobile Banking..." : "Please wait while we set up the Junior account and Mobile Banking service..."}
      />

      {/* SUCCESS MODAL */}
      <SubmitSuccessModal
        isOpen={showSuccessModal}
        onClose={resetForm}
        data={successData}
      />
    </form>
  );
}
