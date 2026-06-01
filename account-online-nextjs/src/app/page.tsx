"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/local-storage/token";
// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/shared/footer/footer";
// Feature Components
import { AccountImages } from "@/components/acc-online/account-images";
import { PersonalDetailsFields } from "@/components/acc-online/form-sections/personal-details-fields";
import { MasterDataFields } from "@/components/acc-online/form-sections/master-data-fields";
import OTPInput from "@/components/acc-online/form-field/form-otp";
import { PageHeader } from "@/components/acc-online/page-header";
import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import AccountExistsModal from "@/components/acc-online/accountExistsModal";
import LoadingModal from "@/components/shared/modal/extract-modal";
import SubmitSuccessModal from "@/components/shared/modal/submit-success-modal";
import SubmitErrorModal from "@/components/shared/modal/submit-error-modal";
import { HeaderSection } from "@/components/acc-online/header-section";
import { ConfirmClearModal } from "@/components/acc-online/confirm-clear-modal";
// Contexts
import { FormStateProvider } from "@/contexts/form-state-context";
// Hooks
import { useMemo, useCallback, useState } from "react";
import { useAccountImages } from "@/hooks/acc-online/use-account-images";
import { useAccountOtp } from "@/hooks/acc-online/use-account-otp";
import { useMasterData } from "@/hooks/acc-online/use-master-data";
import { useFormValidation } from "@/hooks/acc-online/use-form-validation";
import { useModalState } from "@/hooks/acc-online/use-modal-state";
import { useAccountSubmission } from "@/hooks/acc-online/use-account-submission";
import { useVerificationFlow } from "@/hooks/acc-online/use-verification-flow";
// Types
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";

export default function OpenAccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return <OpenAccountContent />;
}

function OpenAccountContent() {
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
  } = useFormValidation();

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
    phoneNumber,
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
    staffCode,
    locationData,
    convertGenderToAPI,
    getMaritalStatusString,
    translate,
  });

  // ========================================
  // Additional State for Clear Confirmation
  // ========================================
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Combine all busy states into one flag to disable buttons consistently
  const isBusy = isLoading || isValidating || loadingState.isLoading;

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

  // ========================================
  // Context Setup
  // ========================================
  const formStateContextValue = useMemo(
    () => ({
      isLoading,
      isValidating,
      isSubmitting: loadingState.isLoading, // FIX: expose submission loading to context
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
      <div className="min-h-screen flex flex-col bg-gray-50/60">
        <PageHeader />

        {/* Main content */}
        <main className="flex-1 pt-16 sm:pt-[60px]">
          <div className="max-w-5xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8">

            {/* Page header */}
            <HeaderSection
              title={translate("header_acc")}
              onClear={() => setShowClearConfirm(true)}
              translate={translate}
            />

            {/* Upload section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
              <AccountImages
                uploadedImage={uploadedImage}
                selfiePreview={selfiePreview}
                handleImageUpload={handleImageUpload}
                handleSelfieUpload={handleSelfieUpload}
              />
            </section>

            {/* Personal details section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {translate("personal_details_label") || "Personal Details"}
                </p>
              </div>
              <PersonalDetailsFields
                formData={formData}
                handleInputChange={handleInputChangeWrapper}
                datePickerKey={datePickerKey}
                legalTypes={legalTypes}
                selectedLegalType={selectedLegalType}
                setSelectedLegalType={(val) => handleMasterDataChange(setSelectedLegalType, val)}
                isLegalTypeLoading={isLegalTypeLoading}
                getLegalTypeName={getLegalTypeName}
                isVerified={isVerified}
                isNidExtracted={!!uploadedImage}
              />
            </section>

            {/* Master data + branch section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {translate("additional_info_label") || "Additional Information"}
                </p>
              </div>
              <MasterDataFields
                maritalStatuses={maritalStatuses}
                selectedMaritalStatus={selectedMaritalStatus}
                setSelectedMaritalStatus={(val) => handleMasterDataChange(setSelectedMaritalStatus, val)}
                isLoadingMarital={isLoadingMarital}
                getMaritalName={getMaritalName}
                occupations={occupations}
                selectedOccupation={selectedOccupation}
                setSelectedOccupation={(val) => handleMasterDataChange(setSelectedOccupation, val)}
                isLoadingOccupations={isLoadingOccupations}
                getOccupationName={getOccupationName}
                referenceBanks={referenceBanks}
                selectedReferenceBank={selectedReferenceBank}
                setSelectedReferenceBank={(val) => handleMasterDataChange(setSelectedReferenceBank, val)}
                isLoadingReferenceBanks={isLoadingReferenceBanks}
                getReferenceName={getReferenceName}
                selectedBranch={selectedBranch}
                onBranchChange={(val) => { onBranchChange(val); setIsVerified(false); }}
                staffCode={staffCode}
                setStaffCode={(val) => handleMasterDataChange(setStaffCode, val)}
                isVerified={isVerified}
              />
            </section>

            {/* OTP section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {translate("phone_verification_label") || "Phone Verification"}
                </p>
              </div>
              <div className="max-w-sm">
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
            </section>

            {/* Action buttons — sticky on mobile */}
            <div className="sticky bottom-0 sm:relative bg-white sm:bg-transparent border-t sm:border-0 border-gray-100 px-4 sm:px-0 py-3 sm:py-0 -mx-3 sm:mx-0 sm:mt-2 mb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:shadow-none z-30">
              <div className="flex gap-3 max-w-5xl mx-auto">
                <Button
                  className="flex-1 sm:flex-none sm:min-w-[160px] h-11 sm:h-12 font-semibold rounded-xl sm:rounded-2xl text-sm flex items-center justify-center gap-2 transition-all
                    bg-white border-2 border-primary text-primary hover:bg-primary/5
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleVerificationClick}
                  disabled={isBusy || isVerified}
                  variant="outline"
                >
                  {isValidating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      {translate("processing")}
                    </>
                  ) : translate("verification")}
                </Button>

                <Button
                  className="flex-1 sm:flex-none sm:min-w-[160px] h-11 sm:h-12 font-semibold rounded-xl sm:rounded-2xl text-sm flex items-center justify-center gap-2 transition-all
                    bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleSubmitAccount}
                  disabled={isBusy || !isVerified}
                >
                  {loadingState.isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      {translate("submitting") || "Submitting"}
                    </>
                  ) : translate("submit")}
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

        {/* Submission loading */}
        <LoadingModal
          isOpen={loadingState.isLoading}
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
          title={successData.title}
          message={successData.message}
          status={successData.status}
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
