"use client";
// UI Components
import { Button } from "@/components/ui/button";
import Footer from "@/components/shared/footer/footer";
// Feature Components
import { AccountImages } from "@/features/account-opening/components/account-images";
import { PersonalDetailsFields } from "@/features/account-opening/components/form-sections/personal-details-fields";
import { MasterDataFields } from "@/features/account-opening/components/form-sections/master-data-fields";
import OTPInput from "@/features/account-opening/components/form-field/form-otp";
import { PageHeader } from "@/features/account-opening/components/page-header";
import ValidationErrorModal from "@/features/account-opening/components/validateModal";
import ErrorModal from "@/features/account-opening/components/errorModal";
import ConfirmationModal from "@/features/account-opening/components/confirmModal";
import LocationModal from "@/features/account-opening/components/addressModal";
import AccountExistsModal from "@/features/account-opening/components/accountExistsModal";
import LoadingModal from "@/features/master-data/components/extract-modal";
import { SubmissionProgressModal } from "@/features/account-opening/components/submission-progress-modal";
import SubmitSuccessModal from "@/features/account-opening/components/submit-success-modal";
import SubmitErrorModal from "@/features/account-opening/components/submit-error-modal";

import { ConfirmClearModal } from "@/features/account-opening/components/confirm-clear-modal";
// Contexts
import { FormStateProvider } from "@/providers/form-state-context";
// Hooks
import { useMemo, useCallback, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle, CreditCard, FileText } from "lucide-react";
import { useAccountImages } from "@/features/account-opening/hooks/use-account-images";
import { useAccountOtp } from "@/features/account-opening/hooks/use-account-otp";
import { useMasterData } from "@/features/account-opening/hooks/use-master-data";
import { useFormValidation } from "@/features/account-opening/hooks/use-form-validation";
import { useModalState } from "@/features/account-opening/hooks/use-modal-state";
import { useAccountSubmission } from "@/features/account-opening/hooks/use-account-submission";
import { useVerificationFlow } from "@/features/account-opening/hooks/use-verification-flow";
// Types
import { LocationSubmitData } from "@/features/account-opening/types/address/open-acc-address.request.model";

// Fade-up animation variant reused across sections
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <div className="w-1 h-4 rounded-full bg-slate-300 flex-shrink-0" />
    <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">{label}</p>
  </div>
);

const Divider = () => <div className="border-t border-slate-100" />;

interface OpenAccountContentProps {
  // true for the public self-service ("/") flow: hides category selection,
  // forces category 6011, and does not require a relation manager.
  isPublic?: boolean;
}

export function JuniorAccountContent({ isPublic = false }: OpenAccountContentProps) {
  // Top 2 navigation mode tabs (With NID default vs Without NID)
  const [hasNid, setHasNid] = useState<boolean>(true);

  // Parent / Guardian details for Junior flow
  const [guardianInfo, setGuardianInfo] = useState({
    guardian_legal_id: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_relationship: "FATHER",
  });

  // ========================================
  // Hooks Setup
  // ========================================
  const {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    datePickerKey,
    validateField,
    handleValidationChange,
    handleInputChange,
    clearValidation,
    translate,
    translateSelect,
  } = useFormValidation(isPublic);

  const {
    showLocationModal,
    setShowLocationModal,
    showErrorModal,
    setShowErrorModal,
    validationResult,
    setValidationResult,
    showValidationErrorModal,
    setShowValidationErrorModal,
    validationErrorData,
    setValidationErrorData,
    showConfirmationModal,
    setShowConfirmationModal,
    locationData,
    setLocationData,
    locationFormData,
    setLocationFormData,
    clearModalState,
  } = useModalState();

  const {
    maritalStatuses,
    isLoadingMarital,
    selectedMaritalStatus,
    setSelectedMaritalStatus,
    occupations,
    isLoadingOccupations,
    selectedOccupation,
    setSelectedOccupation,
    referenceBanks,
    isLoadingReferenceBanks,
    selectedReferenceBank,
    setSelectedReferenceBank,
    legalTypes,
    isLegalTypeLoading,
    selectedLegalType,
    setSelectedLegalType,
    accOnlineCategories,
    isLoadingCategories,
    selectedCategory,
    setSelectedCategory,
    getMaritalName,
    getOccupationName,
    getReferenceName,
    getLegalTypeName,
    getMaritalStatusString,
    resetMasterData,
  } = useMasterData();

  const {
    phoneNumber,
    setPhoneNumber,
    isPhoneVerified,
    setIsPhoneVerified,
    resetOtp,
    clearOtp,
  } = useAccountOtp();

  const {
    uploadedImage,
    selfiePreview,
    selfieImage,
    handleImageUpload,
    handleSelfieUpload,
    loadingImageState,
    clearImages,
    ocrErrorData,
    clearOcrError,
  } = useAccountImages({
    setFormData,
    validateField,
    translate,
  });

  const {
    isLoading,
    isValidating,
    selectedBranch,
    setSelectedBranch,
    staffCode,
    setStaffCode,
    isVerified,
    setIsVerified,
    convertGenderToAPI,
    handleValidateNID,
    handleOpenConfirmModal,
    handleLocationSubmit,
    onBranchChange,
  } = useVerificationFlow({
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    validateField,
    selectedMaritalStatus,
    selectedOccupation,
    selectedReferenceBank,
    selectedLegalType,
    selectedCategory,
    phoneNumber,
    isPublic,
  });

  const {
    handleSubmitAccount,
    showSuccessModal,
    setShowSuccessModal,
    successData,
    showSubmitErrorModal,
    setShowSubmitErrorModal,
    submitErrorData,
    showAccountExistsModal,
    setShowAccountExistsModal,
    accountExistsData,
    loadingState,
    progressPercent,
  } = useAccountSubmission({
    formData,
    uploadedImage,
    selfieImage,
    phoneNumber,
    selectedMaritalStatus,
    selectedOccupation,
    selectedReferenceBank,
    selectedLegalType,
    selectedBranch,
    selectedCategory,
    staffCode,
    locationData,
    convertGenderToAPI,
    getMaritalStatusString,
    translate,
    isPublic,
  });

  // ========================================
  // Additional State for Clear Confirmation
  // ========================================
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Combine all busy states into one flag to disable buttons consistently.
  const isBusy = isLoading || isValidating || loadingState.isLoading || isLoadingCategories;

  // ========================================
  // Event Handlers
  // ========================================
  const handleConfirmValidation = useCallback(async () => {
    setShowConfirmationModal(false);
    await handleValidateNID(
      setShowLocationModal,
      setShowErrorModal,
      setValidationResult,
      setShowValidationErrorModal,
      setValidationErrorData,
    );
  }, [
    handleValidateNID,
    setShowConfirmationModal,
    setShowLocationModal,
    setShowErrorModal,
    setValidationResult,
    setShowValidationErrorModal,
    setValidationErrorData,
  ]);

  const handleLocationSubmitCallback = useCallback(
    (data: LocationSubmitData) => {
      handleLocationSubmit(data, setLocationData, setShowLocationModal);
    },
    [handleLocationSubmit, setLocationData, setShowLocationModal],
  );

  const handleVerificationClick = useCallback(() => {
    handleOpenConfirmModal(
      uploadedImage?.idImage || "",
      selfieImage || "",
      phoneNumber,
      isPhoneVerified,
      setShowConfirmationModal,
    );
  }, [
    handleOpenConfirmModal,
    uploadedImage,
    selfieImage,
    phoneNumber,
    isPhoneVerified,
    setShowConfirmationModal,
  ]);

  const handlePhoneChange = useCallback(
    (value: string) => {
      setPhoneNumber(value);
      validateField("phoneNumber", value);
      setIsVerified(false);
    },
    [setPhoneNumber, validateField, setIsVerified],
  );

  const handleVerificationSuccess = useCallback(() => {
    setIsPhoneVerified(true);
    validateField("isPhoneVerified", true);
  }, [setIsPhoneVerified, validateField]);

  const handleClear = useCallback(() => {
    clearValidation();
    clearImages();
    clearOtp();
    clearModalState();
    resetMasterData();
    setSelectedBranch(null);
    setStaffCode("");
    setIsVerified(false);
    setShowClearConfirm(false);
    setGuardianInfo({
      guardian_legal_id: "",
      guardian_name: "",
      guardian_phone: "",
      guardian_relationship: "FATHER",
    });
  }, [
    clearValidation,
    clearImages,
    clearOtp,
    clearModalState,
    resetMasterData,
    setSelectedBranch,
    setStaffCode,
    setIsVerified,
    setShowClearConfirm,
  ]);

  const handleInputChangeWrapper = useCallback(
    (field: any, value: string) => {
      handleInputChange(field, value);
      setIsVerified(false);
    },
    [handleInputChange, setIsVerified],
  );

  const handleMasterDataChange = useCallback(
    (setter: any, value: any) => {
      setter(value);
      setIsVerified(false);
    },
    [setIsVerified],
  );

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    handleClear();
  }, [setShowSuccessModal, handleClear]);

  const handleSetSelectedLegalType = useCallback(
    (val: any) => handleMasterDataChange(setSelectedLegalType, val),
    [handleMasterDataChange, setSelectedLegalType],
  );

  const handleSetSelectedMaritalStatus = useCallback(
    (val: any) => handleMasterDataChange(setSelectedMaritalStatus, val),
    [handleMasterDataChange, setSelectedMaritalStatus],
  );

  const handleSetSelectedOccupation = useCallback(
    (val: any) => handleMasterDataChange(setSelectedOccupation, val),
    [handleMasterDataChange, setSelectedOccupation],
  );

  const handleSetSelectedReferenceBank = useCallback(
    (val: any) => handleMasterDataChange(setSelectedReferenceBank, val),
    [handleMasterDataChange, setSelectedReferenceBank],
  );

  const handleSetStaffCode = useCallback(
    (val: any) => handleMasterDataChange(setStaffCode, val),
    [handleMasterDataChange, setStaffCode],
  );

  const handleBranchChange = useCallback(
    (val: any) => { onBranchChange(val); setIsVerified(false); },
    [onBranchChange, setIsVerified],
  );

  // ========================================
  // Context Setup
  // ========================================
  const formStateContextValue = useMemo(
    () => ({
      isLoading,
      isValidating,
      isSubmitting: loadingState.isLoading,
      translate,
      translateSelect,
      validationErrors,
      validateField,
      handleValidationChange,
    }),
    [
      isLoading,
      isValidating,
      loadingState.isLoading,
      translate,
      translateSelect,
      validationErrors,
      validateField,
      handleValidationChange,
    ],
  );

  // ========================================
  // Render
  // ========================================
  return (
    <FormStateProvider value={formStateContextValue}>
      {/* ── Page shell with mesh gradient background ── */}
      <div className="min-h-screen w-full flex flex-col" style={{
        background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 40%, #f0fdf4 70%, #fafafa 100%)"
      }}>
        <PageHeader />

        <main className="flex-1 pt-16 sm:pt-[60px]">

          {/* ── Header Title Block — 2 Lines Only (Gradient Title + Subtitle) ── */}
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-1">
            {/* Line 1 */}
            <h1
              className="inline-block text-2xl sm:text-3xl font-bold tracking-tight pb-0.5"
              style={{
                background: "linear-gradient(135deg, #c8450a 0%, #ea580c 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CPBank Junior Account Opening
            </h1>
            {/* Line 2 */}
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium leading-relaxed">
              Open an instant digital account for minors and students with or without National ID
            </p>
          </div>

          {/* ── Top Mode Navigation Tabs (With NID vs Without NID) ── */}
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
            <div className="bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60 grid grid-cols-2 gap-2 shadow-inner">
              <button
                type="button"
                onClick={() => setHasNid(true)}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  hasNid
                    ? "bg-white text-orange-600 shadow-md border border-orange-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0 text-orange-500" />
                <span>With National ID (NID)</span>
                <span className="hidden sm:inline-block text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase font-bold">
                  Default
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHasNid(false)}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  !hasNid
                    ? "bg-white text-orange-600 shadow-md border border-orange-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-orange-500" />
                <span>Without NID (No NID)</span>
              </button>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="max-w-5xl mx-auto w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/60">

              {/* ── Document Upload (if NID mode) ── */}
              {hasNid && (
                <>
                  <div className="p-5 sm:p-6">
                    <SectionLabel label={translate("section_document_upload")} />
                    <AccountImages
                      uploadedImage={uploadedImage}
                      selfiePreview={selfiePreview}
                      handleImageUpload={handleImageUpload}
                      handleSelfieUpload={handleSelfieUpload}
                    />
                  </div>
                  <Divider />
                </>
              )}

              {/* ── Personal Details ── */}
              <div className="p-5 sm:p-6">
                <SectionLabel label={translate("section_personal_details")} />
                <PersonalDetailsFields
                  formData={formData}
                  handleInputChange={handleInputChangeWrapper}
                  datePickerKey={datePickerKey}
                  legalTypes={legalTypes}
                  selectedLegalType={selectedLegalType}
                  setSelectedLegalType={handleSetSelectedLegalType}
                  isLegalTypeLoading={isLegalTypeLoading}
                  getLegalTypeName={getLegalTypeName}
                  isVerified={isVerified}
                  isNidExtracted={!!uploadedImage}
                />
                <MasterDataFields
                  maritalStatuses={maritalStatuses}
                  selectedMaritalStatus={selectedMaritalStatus}
                  setSelectedMaritalStatus={handleSetSelectedMaritalStatus}
                  isLoadingMarital={isLoadingMarital}
                  getMaritalName={getMaritalName}
                  occupations={occupations}
                  selectedOccupation={selectedOccupation}
                  setSelectedOccupation={handleSetSelectedOccupation}
                  isLoadingOccupations={isLoadingOccupations}
                  getOccupationName={getOccupationName}
                  selectedBranch={selectedBranch}
                  onBranchChange={handleBranchChange}
                  staffCode={staffCode}
                  setStaffCode={handleSetStaffCode}
                  accOnlineCategories={accOnlineCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  isLoadingCategories={isLoadingCategories}
                  isVerified={isVerified}
                  isPublic={isPublic}
                />
              </div>

              <Divider />

              {/* ── Parent / Guardian Details Section ── */}
              <div className="p-5 sm:p-6">
                <SectionLabel label="Parent / Legal Guardian Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Guardian National ID Number *
                    </label>
                    <input
                      type="text"
                      value={guardianInfo.guardian_legal_id}
                      onChange={(e) =>
                        setGuardianInfo((prev) => ({ ...prev, guardian_legal_id: e.target.value }))
                      }
                      placeholder="Guardian NID e.g. 0101928374"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      value={guardianInfo.guardian_name}
                      onChange={(e) =>
                        setGuardianInfo((prev) => ({ ...prev, guardian_name: e.target.value }))
                      }
                      placeholder="Guardian Full Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Phone Number *</label>
                    <input
                      type="tel"
                      value={guardianInfo.guardian_phone}
                      onChange={(e) =>
                        setGuardianInfo((prev) => ({ ...prev, guardian_phone: e.target.value }))
                      }
                      placeholder="012345678"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Relationship to Child *</label>
                    <select
                      value={guardianInfo.guardian_relationship}
                      onChange={(e) =>
                        setGuardianInfo((prev) => ({ ...prev, guardian_relationship: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
                    >
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                    </select>
                  </div>
                </div>
              </div>

              <Divider />

              {/* ── Phone Verification ── */}
              <div className="p-5 sm:p-6">
                <SectionLabel label={translate("section_phone_verification")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <OTPInput
                    phoneNumber={phoneNumber}
                    onPhoneChange={handlePhoneChange}
                    onVerificationSuccess={handleVerificationSuccess}
                    disabled={isBusy}
                    validationErrors={validationErrors}
                    onValidationChange={handleValidationChange}
                    reset={resetOtp}
                  />
                </div>
              </div>

              {/* ── Action Bar ── */}
              <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3">
                {/* Verify button */}
                <Button
                  className={`w-full sm:w-auto min-w-[130px] h-10 font-semibold rounded-xl text-sm gap-1.5 transition-all ${
                    !isVerified && !isBusy
                      ? "border border-primary text-primary bg-white hover:bg-primary/5 shadow-sm cursor-pointer"
                      : "border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}
                  onClick={handleVerificationClick}
                  disabled={isBusy || isVerified}
                >
                  {isValidating ? (
                    <><span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span>{translate("processing")}</span></>
                  ) : (
                    <span>{translate("verification")}</span>
                  )}
                </Button>

                {/* Submit button */}
                <Button
                  className={`w-full sm:w-auto min-w-[130px] h-10 font-semibold rounded-xl text-sm gap-1.5 transition-all ${
                    isVerified && !isBusy
                      ? "bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer"
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                  }`}
                  onClick={handleSubmitAccount}
                  disabled={isBusy || !isVerified || loadingState.isLoading}
                >
                  {loadingState.isLoading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{translate("submitting") || "Submitting"}</span></>
                  ) : (
                    <><CheckCircle className="w-4 h-4 flex-shrink-0" /><span>{translate("submit")}</span></>
                  )}
                </Button>
              </div>

            </div>
          </div>

          <Footer />
        </main>

        {/* Clear Confirmation Modal */}
        <ConfirmClearModal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClear}
          title={translate("clearTitle")}
          message={translate("clearConfirmMessage")}
        />

        {/* Submission Real-time Progress Modal */}
        <SubmissionProgressModal
          isOpen={loadingState.isLoading}
          progress={progressPercent}
          title={loadingState.title}
          message={loadingState.message}
        />

        {/* Image extraction loading */}
        <LoadingModal
          isOpen={loadingImageState.isLoading}
          title={loadingImageState.title}
          message={loadingImageState.message}
        />

        <ConfirmationModal
          isOpen={showConfirmationModal}
          onConfirm={handleConfirmValidation}
          onCancel={() => setShowConfirmationModal(false)}
          title={translate("cfTitle")}
          message={translate("cfMessage")}
        />
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSubmit={handleLocationSubmitCallback}
          formData={locationFormData}
          setFormData={setLocationFormData}
          addressFromForm={formData.address}
          placeOfBirthFromForm={formData.pob}
        />
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          data={
            validationResult?.data
              ? {
                  score: validationResult.data.score,
                  incorrectFields: validationResult.data.incorrectFields,
                }
              : null
          }
        />
        <ValidationErrorModal
          isOpen={showValidationErrorModal}
          onClose={() => setShowValidationErrorModal(false)}
          title={validationErrorData.title}
          message={validationErrorData.message}
          description={validationErrorData.description}
        />
        {/* OCR Extraction Error Modal */}
        <ValidationErrorModal
          isOpen={!!ocrErrorData}
          onClose={clearOcrError}
          title={ocrErrorData?.title ?? ""}
          message={ocrErrorData?.message ?? ""}
          description={ocrErrorData?.description ?? ""}
        />
        <SubmitSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          data={successData}
        />
        <SubmitErrorModal
          isOpen={showSubmitErrorModal}
          onClose={() => setShowSubmitErrorModal(false)}
          title={submitErrorData.title}
          message={submitErrorData.message}
          variant={submitErrorData.variant}
        />
        <AccountExistsModal
          isOpen={showAccountExistsModal}
          onClose={() => setShowAccountExistsModal(false)}
          data={accountExistsData}
        />
      </div>
    </FormStateProvider>
  );
}
