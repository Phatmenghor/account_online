"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera } from "lucide-react";
import { z } from "zod";
import {
  checkPhone,
  sendGuardianOtp,
  verifyGuardianOtp,
  sendJuniorOtp,
  verifyJuniorOtp,
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
import { ChildPhotoUploadSection } from "./form-sections/child-photo-upload-section";
import { WarningAlertModal } from "./form-sections/warning-alert-modal";
import { AgeRestrictionModal } from "@/features/account-opening/components/age-restriction-modal";
import { calculateAge } from "@/utils/date/calculate-age";

import { FormInputField, FormSelectField } from "@/features/account-opening/components/form-field/form-field";
import { Label } from "@/components/ui/label";
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
  const tJunior = useTranslations("junior");
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

  // Age restriction modal state
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ageModalAge, setAgeModalAge] = useState<number | null>(null);


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
        tJunior("enterParentPhoneTitle"),
        tJunior("enterParentPhoneDesc")
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
      }

      await sendGuardianOtp(formData.guardian_phone);
      setParentOtpSent(true);
      setParentCountdown(60);
      showToast.success(tJunior("otpSentParentSuccess"));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || tJunior("verificationFailed");
      showAlertModal(tJunior("verificationFailed"), msg);
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
        tJunior("invalidOtpTitle"),
        tJunior("invalidOtpDesc")
      );
      return;
    }
    setLoading(true);
    try {
      const verifyRes: any = await verifyGuardianOtp(formData.guardian_phone || "", parentOtpCode);
      setParentVerified(true);
      setParentCountdown(0);

      // Render parent info on UI INSTANTLY from OTP verify response
      const parentCif = verifyRes?.cif || verifyRes?.guardian_cif || formData.guardian_cif;
      const guardianName = verifyRes?.customerName || verifyRes?.guardian_name || formData.guardian_name;

      if (parentCif) {
        setParentInfo({
          cif: parentCif,
          names: [guardianName || "N/A"],
          shortNames: [guardianName || "N/A"],
        } as CustomerInfo);

        setFormData((prev) => ({
          ...prev,
          guardian_cif: parentCif,
          guardian_name: guardianName || prev.guardian_name,
        }));

        // Fetch remaining detailed customer fields in background without blocking UI
        getCustomerInfoByCif(parentCif).then((info) => {
          setParentInfo(info);
          const parentBranch = info.coCode || info.companyBook || "KH0012011";
          setFormData((prev) => ({
            ...prev,
            guardian_cif: parentCif,
            guardian_name: (info.names && info.names.length > 0) ? info.names[0] : (info.shortNames && info.shortNames.length > 0 ? info.shortNames[0] : prev.guardian_name),
            guardian_legal_id: info.legalId || prev.guardian_legal_id,
            guardian_doc_type: info.legalDocName || "NATIONAL.ID",
            guardian_dob: info.birthDate || "",
            guardian_address: (info.streets && info.streets.length > 0) ? info.streets[0] : (prev.legal_address || ""),
            guardian_info_json: JSON.stringify(info),
            branch_code: parentBranch,
            legal_address: (info.streets && info.streets.length > 0) ? info.streets[0] : (prev.legal_address || ""),
          }));
        }).catch((e) => console.warn("Background parent info fetch non-critical error", e));
      }

      showToast.success(tJunior("parentOtpVerifySuccess"));
    } catch (err: any) {
      lastTriedParentOtpRef.current = "";
      const msg = err.response?.data?.message || err.message || tJunior("invalidOtpDesc");
      showAlertModal(tJunior("otpVerifyFailed"), msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Junior Phone Pre-check & OTP Send
  const handleSendJuniorOtp = async () => {
    if (!formData.phone_number) {
      showAlertModal(
        tJunior("enterJuniorPhoneTitle"),
        tJunior("enterJuniorPhoneDesc")
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

      await sendJuniorOtp(formData.phone_number);
      setJuniorOtpSent(true);
      setJuniorCountdown(60);
      showToast.success(tJunior("otpSentJuniorSuccess"));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || tJunior("sendOtpFailed");
      showAlertModal(tJunior("sendOtpFailed"), msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJuniorOtp = async () => {
    if (!juniorOtpCode || juniorOtpCode.length !== 6) {
      showAlertModal(
        tJunior("invalidOtpTitle"),
        tJunior("invalidOtpDesc")
      );
      return;
    }
    setLoading(true);
    try {
      await verifyJuniorOtp(formData.phone_number || "", juniorOtpCode);
      setJuniorVerified(true);
      setJuniorCountdown(0);
      showToast.success(tJunior("juniorOtpVerifySuccess"));
    } catch (err: any) {
      lastTriedJuniorOtpRef.current = "";
      const msg = err.response?.data?.message || err.message || tJunior("invalidOtpDesc");
      showAlertModal(tJunior("otpVerifyFailed"), msg);
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

  // File Upload with Base64 conversion (PDF & Images only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type: Only PDF and Images allowed
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (!isPdf && !isImage) {
        showAlertModal(
          tJunior("invalidFileTypeTitle"),
          tJunior("invalidFileTypeDesc")
        );
        return;
      }

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
      selfie_image_base64: "",
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
    setRefDocImagePreview(null);
    setSelfieFileName("");
    setSelfiePreview(null);
    lastTriedParentOtpRef.current = "";
    lastTriedJuniorOtpRef.current = "";

    if (typeof document !== "undefined") {
      const selfieInput = document.getElementById("child-selfie-upload-input") as HTMLInputElement;
      if (selfieInput) selfieInput.value = "";
      const refDocInput = document.getElementById("ref-doc-upload-input") as HTMLInputElement;
      if (refDocInput) refDocInput.value = "";
    }
  };

  // Zod Validation Schema
  const validateFormWithZod = (): boolean => {
    // 1. Parent Verification Check
    if (!parentVerified) {
      const msg = tJunior("verifyParentPhoneFirst");
      showToast.error(msg);
      showAlertModal(tJunior("verificationFailed"), msg);
      return false;
    }

    // 2. Child Face Photo Check
    if (!selfieFileName && !formData.selfie_image_name && !selfiePreview) {
      const msg = translate("err_selfie");
      showToast.error(msg);
      showAlertModal(translate("err_selfie"), msg);
      return false;
    }

    // 3. Reference Document Check
    if (!formData.reference_doc_name && !formData.reference_doc_image) {
      const msg = tJunior("selectImage");
      showToast.error(msg);
      showAlertModal(tJunior("selectImage"), msg);
      return false;
    }

    // 4. Junior Phone Verification Check
    if (!juniorVerified) {
      const msg = tJunior("verifyJuniorPhoneFirst");
      showToast.error(msg);
      showAlertModal(tJunior("juniorPhoneNotVerified"), msg);
      return false;
    }

    // 5. Zod Schema Validation
    const schema = z.object({
      guardian_phone: z.string().min(8, tJunior("valParentPhone")),
      first_name_kh: z.string().min(1, tJunior("valFirstNameKh")),
      last_name_kh: z.string().min(1, tJunior("valLastNameKh")),
      given_name: z.string().min(1, tJunior("valGivenName")),
      family_name: z.string().min(1, tJunior("valFamilyName")),
      date_of_birth: z.string().min(1, tJunior("valDob")),
      gender: z.string().min(1, tJunior("valGender")),
      phone_number: z.string().min(8, tJunior("valJuniorPhone")),
    });

    const result = schema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Please complete all required fields correctly.";
      showToast.error(firstError);
      showAlertModal(tJunior("incompleteInfo"), firstError);
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

    // Age Check for Junior Account Opening (Must be < 18)
    const childAge = calculateAge(formData.date_of_birth);
    if (childAge !== null && childAge >= 18) {
      setAgeModalAge(childAge);
      setShowAgeModal(true);
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
      showAlertModal(tJunior("accountCreationFailed"), msg);
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
        <SectionLabel label={tJunior("personalDetailsTitle")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInputField
            label={translate("firstNameKh")}
            placeholder={translate("firstNameKh")}
            value={formData.last_name_kh || ""}
            onChange={(val) => handleInputChange("last_name_kh", val)}
            required
          />

          <FormInputField
            label={translate("lastNameKH")}
            placeholder={translate("lastNameKH")}
            value={formData.first_name_kh || ""}
            onChange={(val) => handleInputChange("first_name_kh", val)}
            required
          />

          <FormInputField
            label={translate("familyNameEn")}
            placeholder={translate("familyNameEn")}
            value={formData.family_name || ""}
            onChange={(val) => handleInputChange("family_name", val)}
            required
          />

          <FormInputField
            label={translate("givenNameEn")}
            placeholder={translate("givenNameEn")}
            value={formData.given_name || ""}
            onChange={(val) => handleInputChange("given_name", val)}
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
              {translate("dateOfBirth")} <span className="text-red-500 ml-0.5">*</span>
            </label>
            <CustomDateTimePicker
              value={formData.date_of_birth || ""}
              onChange={(value) => handleInputChange("date_of_birth", value)}
              disabled={loading}
            />
          </div>

          <FormSelectField
            label={translate("gender")}
            placeholder={translateCommon("selectGender")}
            value={formData.gender || "Male"}
            onChange={(val) => handleInputChange("gender", val)}
            options={[
              { id: "Male", label: tJunior("male"), value: "Male" },
              { id: "Female", label: tJunior("female"), value: "Female" },
            ]}
            required
          />

          <FormSelectField
            label={translate("marital")}
            placeholder={translateCommon("selectMarital")}
            value={formData.marital_status || ""}
            onChange={(val) => handleInputChange("marital_status", val)}
            options={
              apiMaritalStatuses.length > 0
                ? apiMaritalStatuses.map((ms, idx) => ({
                    id: ms.id ?? ms.maritalCode ?? ms.code ?? idx,
                    label: getMaritalStatusName(ms),
                    value: String(ms.maritalCode || ms.code || (ms.id !== undefined && ms.id !== null ? ms.id : "") || `ms-${idx}`),
                  }))
                : [
                    { id: "Single", label: tJunior("single"), value: "Single" },
                    { id: "Married", label: tJunior("married"), value: "Married" },
                  ]
            }
            required
          />

          <FormSelectField
            label={translate("occupation")}
            placeholder={translateCommon("selectOccupation")}
            value={formData.occupation || ""}
            onChange={(val) => handleInputChange("occupation", val)}
            options={
              apiOccupations.length > 0
                ? apiOccupations.map((occ, idx) => ({
                    id: occ.id ?? occ.occupationCode ?? occ.code ?? idx,
                    label: getOccupationName(occ),
                    value: String(occ.occupationCode || (occ.id !== undefined && occ.id !== null ? occ.id : "") || occ.code || `occ-${idx}`),
                  }))
                : [
                    { id: "STUDENT", label: tJunior("student"), value: "STUDENT" },
                    { id: "UNDERAGE", label: tJunior("underage"), value: "UNDERAGE" },
                  ]
            }
            required
          />

          <FormInputField
            label={translate("referralId")}
            placeholder={translate("referralIdPlaceholder")}
            value={formData.referral_id || ""}
            onChange={(val) => handleInputChange("referral_id", val)}
            className="md:col-span-2"
          />
        </div>
      </div>

      <Divider />

      {/* ── SECTION 3: Documents & Child Face Photo ── */}
      <div className="p-5 sm:p-6 space-y-5">
        <SectionLabel label={tJunior("childPhotoAndRefTitle")} />

        {/* 1. Child Face Photo (Selfie) */}
        <ChildPhotoUploadSection
          selfiePreview={selfiePreview}
          selfieFileName={selfieFileName}
          onSelfieUpload={handleSelfieUpload}
          onClearSelfie={() => {
            setSelfiePreview(null);
            setSelfieFileName("");
            setFormData((prev) => ({
              ...prev,
              selfie_image_name: "",
              selfie_image_base64: "",
            }));
            if (typeof document !== "undefined") {
              const selfieInput = document.getElementById("child-selfie-upload-input") as HTMLInputElement;
              if (selfieInput) selfieInput.value = "";
            }
          }}
        />

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
        title={tJunior("verificationFailed")}
        message={tJunior("parentPhoneNotRegisteredDesc", { phone: unregisteredPhone })}
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
        title={tJunior("creatingAccountTitle")}
        message={tJunior("creatingAccountMessage")}
      />

      {/* SUCCESS MODAL */}
      <SubmitSuccessModal
        isOpen={showSuccessModal}
        onClose={resetForm}
        data={successData}
      />

      {/* AGE RESTRICTION MODAL */}
      <AgeRestrictionModal
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        mode="junior"
        calculatedAge={ageModalAge}
      />
    </form>
  );

}
