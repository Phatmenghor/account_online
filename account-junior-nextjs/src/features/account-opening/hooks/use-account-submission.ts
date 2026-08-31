import { useState, useRef } from "react";
import { ResponseNID } from "@/features/account-opening/types/nid.response.model";
import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { OccupationModel } from "@/features/master-data/types/occupation/occupation.response";
import { ReferenceModel } from "@/features/master-data/types/reference/reference.response";
import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { AccOnlineCategoryModel } from "@/features/master-data/types/acc-online-category/acc-online-category.response";
import { BranchModel } from "@/types/branch/branch.response";
import { LocationSubmitData } from "@/features/account-opening/types/address/open-acc-address.request.model";
import { formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { createOpenAccountService } from "@/services/open-account/openAccount.service";
import { uploadDocument } from "@/services/document/document.service";
import { OpenAccountResponse } from "@/features/account-opening/types/openAccount.response";
import { compressBase64Image } from "@/utils/image-compressor";

interface UseAccountSubmissionProps {
  formData: ResponseNID;
  uploadedImage: { idImage: string } | null;
  selfieImage: string | null;
  phoneNumber: string;
  selectedMaritalStatus: MaritalModel | null;
  selectedOccupation: OccupationModel | null;
  selectedReferenceBank: ReferenceModel | null;
  selectedLegalType: LegalTypeModel | null;
  selectedBranch: BranchModel | null;
  selectedCategory: AccOnlineCategoryModel | null;
  staffCode: string;
  locationData: LocationSubmitData;
  convertGenderToAPI: (gender: string) => string;
  getMaritalStatusString: (id: string) => string;
  translate: (key: string) => string;
  isPublic?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  title: string;
  message: string;
}

interface UploadCache {
  nidFileName: string | null;
  selfieFileName: string | null;
}

export const useAccountSubmission = ({
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
  isPublic = false,
}: UseAccountSubmissionProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<OpenAccountResponse | null>(null);
  const [showSubmitErrorModal, setShowSubmitErrorModal] = useState(false);
  const [submitErrorData, setSubmitErrorData] = useState<{
    title: string;
    message: string;
    variant?: "error" | "warning";
  }>({
    title: "",
    message: "",
    variant: "error",
  });
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);
  const [accountExistsData, setAccountExistsData] = useState<{
    cif?: string;
    accountNumber?: string;
    accountName?: string;
    message?: string;
  } | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    title: "",
    message: "",
  });

  const uploadCache = useRef<UploadCache>({
    nidFileName: null,
    selfieFileName: null,
  });

  const closeLoading = () => {
    setLoadingState({ isLoading: false, title: "", message: "" });
  };

  /** Close loading modal first, then open error modal after transition gap */
  const showError = (override?: Partial<{ title: string; message: string; variant?: "error" | "warning" }>) => {
    closeLoading();
    setTimeout(() => {
      setSubmitErrorData({
        title: translate("err_generic_title"),
        message: translate("err_generic_message"),
        variant: "error" as const,
        ...override,
      });
      setShowSubmitErrorModal(true);
    }, 350);
  };

  const resetUploadCache = () => {
    uploadCache.current = { nidFileName: null, selfieFileName: null };
  };

  const handleSubmitAccount = async () => {
    const nidBase64Raw: string = uploadedImage?.idImage ?? "";
    const selfieBase64Raw: string = selfieImage ?? "";

    if (!nidBase64Raw) {
      showError({
        title: translate("err_nid_missing_title"),
        message: translate("err_nid_missing_message"),
      });
      return;
    }

    if (!selfieBase64Raw) {
      showError({
        title: translate("err_selfie_missing_title"),
        message: translate("err_selfie_missing_message"),
      });
      return;
    }

    setLoadingState({
      isLoading: true,
      title: translate("submitting_title"),
      message: translate("submitting_message"),
    });

    try {
      // Step 1: Compress images client-side before uploading (reduces payload from ~5MB to ~150KB)
      const [compressedNid, compressedSelfie] = await Promise.all([
        compressBase64Image(nidBase64Raw, 1200, 1200, 0.78),
        compressBase64Image(selfieBase64Raw, 1200, 1200, 0.78),
      ]);

      // Step 2: Upload Compressed Documents
      if (
        !uploadCache.current.nidFileName ||
        !uploadCache.current.selfieFileName
      ) {
        const [nidFileName, selfieFileName] = await Promise.all([
          uploadCache.current.nidFileName
            ? Promise.resolve(uploadCache.current.nidFileName)
            : uploadDocument(
                compressedNid,
                `nid_${formData.idNumber}.jpg`,
                "nid",
                formData.idNumber
              ),
          uploadCache.current.selfieFileName
            ? Promise.resolve(uploadCache.current.selfieFileName)
            : uploadDocument(
                compressedSelfie,
                `selfie_${formData.idNumber}.jpg`,
                "selfie",
                formData.idNumber
              ),
        ]);
        uploadCache.current = { nidFileName, selfieFileName };
      }

      const { nidFileName, selfieFileName } = uploadCache.current;

      // Step 3: Create Account Payload (clean 1-to-1 snake_case matching backend @JsonProperty)
      const accountData = {
        legal_id: formData.idNumber,
        family_name: formData.lastNameEn,
        given_name: formData.firstNameEn,
        first_name_kh: formData.firstNameKh,
        last_name_kh: formData.lastNameKh,
        gender: convertGenderToAPI(formData.gender),
        date_of_birth: formatDate(formData.dob),
        address: formData.address,
        place_of_birth: formData.pob,
        legal_iss_date: formatDate(formData.issuedDate),
        legal_exp_date: formatDate(formData.expiredDate),
        legal_doc_name: selectedLegalType?.legalTypeValue || "",
        sms: phoneNumber,
        marital_status: selectedMaritalStatus
          ? getMaritalStatusString(selectedMaritalStatus.id.toString())
          : "",
        occupation: selectedOccupation?.occupationCode || "",
        company: selectedReferenceBank?.nameEn || "",
        staff_code: staffCode || "",
        released_by: staffCode || "",
        relation_manager: isPublic ? "" : (staffCode || ""),
        branch_code: selectedBranch!.branchID,
        cust_province: locationData.currentAddress.province?.provinceCode || "",
        cust_district: locationData.currentAddress.district?.districtCode || "",
        cust_commune: locationData.currentAddress.commune?.communeCode || "",
        cust_village: locationData.currentAddress.village?.villageCode || "",
        customer_province_en: locationData.currentAddress.province?.provinceEn || "",
        customer_district_en: locationData.currentAddress.district?.districtEn || "",
        customer_commune_en: locationData.currentAddress.commune?.communeEn || "",
        customer_village_en: locationData.currentAddress.village?.villageEn || "",
        customer_province_kh: locationData.currentAddress.province?.provinceKh || "",
        customer_district_kh: locationData.currentAddress.district?.districtKh || "",
        customer_commune_kh: locationData.currentAddress.commune?.communeKh || "",
        customer_village_kh: locationData.currentAddress.village?.villageKh || "",
        cust_pob_province: locationData.placeOfBirth.province?.provinceCode || "",
        cust_pob_district: locationData.placeOfBirth.district?.districtCode || "",
        cust_pob_commune: locationData.placeOfBirth.commune?.communeCode || "",
        cust_pob_village: locationData.placeOfBirth.village?.villageCode || "",
        customer_pob_province_en: locationData.placeOfBirth.province?.provinceEn || "",
        customer_pob_district_en: locationData.placeOfBirth.district?.districtEn || "",
        customer_pob_commune_en: locationData.placeOfBirth.commune?.communeEn || "",
        customer_pob_village_en: locationData.placeOfBirth.village?.villageEn || "",
        customer_pob_province_kh: locationData.placeOfBirth.province?.provinceKh || "",
        customer_pob_district_kh: locationData.placeOfBirth.district?.districtKh || "",
        customer_pob_commune_kh: locationData.placeOfBirth.commune?.communeKh || "",
        customer_pob_village_kh: locationData.placeOfBirth.village?.villageKh || "",
        nid_image_name: nidFileName!,
        selfie_image_name: selfieFileName!,
        customer_role: "OWNER",
        product_account: isPublic ? "SAVE.JUNIOR.SAVING" : (selectedCategory?.lookupCode || "SAVE.JUNIOR.SAVING"),
        account_type: isPublic ? "SAVE.JUNIOR.SAVING" : (selectedCategory?.lookupCode || "SAVE.JUNIOR.SAVING"),
      };

      const response = await createOpenAccountService(accountData);

      // Step 4: Finalizing & Success
      uploadCache.current = { nidFileName: null, selfieFileName: null };

      // Close loading first, then show success modal smoothly
      closeLoading();
      setTimeout(() => {
        setSuccessData(response?.data ?? response);
        setShowSuccessModal(true);
      }, 350);
    } catch (error: any) {
      // Clean up cache on failure so retry doesn't reuse partial/failed files
      resetUploadCache();

      const responseData = error?.response?.data || error?.rawError;
      const statusCode = error?.response?.status || error?.status || responseData?.code;
      const backendMessage = responseData?.message || responseData?.error || error?.message || translate("err_generic_message");

      if (statusCode === 409) {
        closeLoading();
        setTimeout(() => {
          setAccountExistsData({
            cif: responseData?.details?.cif || responseData?.data?.cif,
            accountNumber: responseData?.details?.accountNumber || responseData?.data?.khrAccount,
            accountName: responseData?.details?.accountName || responseData?.data?.legalHolderName,
            message: backendMessage,
          });
          setShowAccountExistsModal(true);
        }, 350);
      } else {
        showError({
          title: translate("err_generic_title"),
          message: backendMessage,
        });
      }
    } finally {
      // Only close loading if not already handled inside catch block
      setTimeout(() => {
        setLoadingState((prev) => (prev.isLoading ? { isLoading: false, title: "", message: "" } : prev));
      }, 350);
    }
  };

  return {
    handleSubmitAccount,
    resetUploadCache,
    showSuccessModal,
    setShowSuccessModal,
    successData,
    setSuccessData,
    showSubmitErrorModal,
    setShowSubmitErrorModal,
    submitErrorData,
    setSubmitErrorData,
    showAccountExistsModal,
    setShowAccountExistsModal,
    accountExistsData,
    setAccountExistsData,
    loadingState,
    setLoadingState,
  };
};
