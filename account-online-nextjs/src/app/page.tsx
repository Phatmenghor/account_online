"use client";
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
      <div className="flex flex-col h-screen">
        <PageHeader />
        <div className="flex-1 pt-16 md:pt-20 pb-0">
          <div className="px-3 sm:px-4 md:px-6 lg:px-16 py-4 sm:py-6 md:py-8">
            <Card className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg rounded-2xl border-0">
              <div className="mx-auto">
                <HeaderSection
                  title={translate("header_acc")}
                  onClear={() => setShowClearConfirm(true)}
                  translate={translate}
                />
                <AccountImages
                  uploadedImage={uploadedImage}
                  selfiePreview={selfiePreview}
                  handleImageUpload={handleImageUpload}
                  handleSelfieUpload={handleSelfieUpload}
                />
                <PersonalDetailsFields
                  formData={formData}
                  handleInputChange={handleInputChangeWrapper}
                  datePickerKey={datePickerKey}
                  legalTypes={legalTypes}
                  selectedLegalType={selectedLegalType}
                  setSelectedLegalType={(val) =>
                    handleMasterDataChange(setSelectedLegalType, val)
                  }
                  isLegalTypeLoading={isLegalTypeLoading}
                  getLegalTypeName={getLegalTypeName}
                  isVerified={isVerified}
                  isNidExtracted={!!uploadedImage}
                />
                <MasterDataFields
                  maritalStatuses={maritalStatuses}
                  selectedMaritalStatus={selectedMaritalStatus}
                  setSelectedMaritalStatus={(val) =>
                    handleMasterDataChange(setSelectedMaritalStatus, val)
                  }
                  isLoadingMarital={isLoadingMarital}
                  getMaritalName={getMaritalName}
                  occupations={occupations}
                  selectedOccupation={selectedOccupation}
                  setSelectedOccupation={(val) =>
                    handleMasterDataChange(setSelectedOccupation, val)
                  }
                  isLoadingOccupations={isLoadingOccupations}
                  getOccupationName={getOccupationName}
                  referenceBanks={referenceBanks}
                  selectedReferenceBank={selectedReferenceBank}
                  setSelectedReferenceBank={(val) =>
                    handleMasterDataChange(setSelectedReferenceBank, val)
                  }
                  isLoadingReferenceBanks={isLoadingReferenceBanks}
                  getReferenceName={getReferenceName}
                  selectedBranch={selectedBranch}
                  onBranchChange={(val) => {
                    onBranchChange(val);
                    setIsVerified(false);
                  }}
                  staffCode={staffCode}
                  setStaffCode={(val) =>
                    handleMasterDataChange(setStaffCode, val)
                  }
                  isVerified={isVerified}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                  {/* Verify button — disabled while any operation is running or already verified */}
                  <Button
                    className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleVerificationClick}
                    disabled={isBusy || isVerified} // FIX: added loadingState.isLoading via isBusy
                  >
                    {isValidating ? (
                      <>
                        {translate("processing")}
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
                      </>
                    ) : (
                      translate("verification")
                    )}
                  </Button>

                  {/* Submit button — disabled while any operation is running or not yet verified */}
                  <Button
                    className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl shadow-md shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitAccount}
                    disabled={isBusy || !isVerified}
                  >
                    {loadingState.isLoading ? (
                      <>
                        {translate("submitting") || "Submitting"}
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0 ml-2"></span>
                      </>
                    ) : (
                      translate("submit")
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          <Footer />
        </div>

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
          onContinue={() => {
            // Clear form after account exists
            setShowClearConfirm(true);
          }}
        />
      </div>
    </FormStateProvider>
  );
}
