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

const GENERIC_ERROR = {
  title: "មានបញ្ហាកើតឡើង",
  message:
    "មានបញ្ហាបច្ចេកទេស។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក ហើយព្យាយាមម្តងទៀត។",
  variant: "error" as const,
};

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
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const uploadCache = useRef<UploadCache>({
    nidFileName: null,
    selfieFileName: null,
  });

  const showError = (override?: Partial<{ title: string; message: string; variant?: "error" | "warning" }>) => {
    setSubmitErrorData({
      title: translate("err_generic_title") || GENERIC_ERROR.title,
      message: translate("err_generic_message") || GENERIC_ERROR.message,
      variant: "error" as const,
      ...override,
    });
    setShowSubmitErrorModal(true);
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

    setProgressPercent(5);
    setLoadingState({
      isLoading: true,
      title: translate("submitting_title") || "កំពុងដំណើរការបង្កើតគណនី",
      message: "សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងដំណើរការស្នើសុំគណនីរបស់លោកអ្នក...",
    });

    try {
      // Step 1: Compress images client-side before uploading (reduces payload from ~5MB to ~150KB)
      setProgressPercent(15);
      const [compressedNid, compressedSelfie] = await Promise.all([
        compressBase64Image(nidBase64Raw, 1200, 1200, 0.78),
        compressBase64Image(selfieBase64Raw, 1200, 1200, 0.78),
      ]);

      // Step 2: Upload Compressed Documents
      setProgressPercent(35);

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

      // Step 3: Verifying and Creating Account
      setProgressPercent(65);

      const accountData = {
        legalId: formData.idNumber,
        familyName: formData.lastNameEn,
        givenName: formData.firstNameEn,
        firstNameKh: formData.firstNameKh,
        lastNameKh: formData.lastNameKh,
        gender: convertGenderToAPI(formData.gender),
        dateOfBirth: formatDate(formData.dob),
        legalAddress: formData.address,
        placeOfBirth: formData.pob,
        legalIssueDate: formatDate(formData.issuedDate),
        legalExpireDate: formatDate(formData.expiredDate),
        legalMrz1: formData.MRZ1,
        legalMrz2: formData.MRZ2,
        legalMrz3: formData.MRZ3,
        legalDocType: selectedLegalType?.legalTypeValue || "",
        phoneNumber: phoneNumber,
        maritalStatus: selectedMaritalStatus
          ? getMaritalStatusString(selectedMaritalStatus.id.toString())
          : "",
        occupation: selectedOccupation?.occupationCode || "",
        companyName: selectedReferenceBank?.nameEn || "",
        referralId: staffCode || "",
        releasedBy: staffCode || "",
        relationManager: isPublic ? "" : (staffCode || ""),
        branchCode: selectedBranch!.branchID,
        customerCurrentProvince: locationData.currentAddress.province?.provinceCode || "",
        customerCurrentDistrict: locationData.currentAddress.district?.districtCode || "",
        customerCurrentCommune: locationData.currentAddress.commune?.communeCode || "",
        customerCurrentVillage: locationData.currentAddress.village?.villageCode || "",
        customerProvinceKh: locationData.currentAddress.province?.provinceKh || "",
        customerDistrictKh: locationData.currentAddress.district?.districtKh || "",
        customerCommuneKh: locationData.currentAddress.commune?.communeKh || "",
        customerVillageKh: locationData.currentAddress.village?.villageKh || "",
        customerPobProvince: locationData.placeOfBirth.province?.provinceCode || "",
        customerPobDistrict: locationData.placeOfBirth.district?.districtCode || "",
        customerPobCommune: locationData.placeOfBirth.commune?.communeCode || "",
        customerPobVillage: locationData.placeOfBirth.village?.villageCode || "",
        customerPobProvinceKh: locationData.placeOfBirth.province?.provinceKh || "",
        customerPobDistrictKh: locationData.placeOfBirth.district?.districtKh || "",
        customerPobCommuneKh: locationData.placeOfBirth.commune?.communeKh || "",
        customerPobVillageKh: locationData.placeOfBirth.village?.villageKh || "",
        nidImageName: nidFileName!,
        selfieImageName: selfieFileName!,
        customerRole: "OWNER",
        accountType: isPublic ? "6011" : (selectedCategory?.lookupId || "6011"),
      };

      setProgressPercent(85);
      const response = await createOpenAccountService(accountData);

      // Step 4: Finalizing & Success
      setProgressPercent(100);
      uploadCache.current = { nidFileName: null, selfieFileName: null };

      setSuccessData(response?.data ?? response);
      setShowSuccessModal(true);
    } catch (error: any) {
      // Clean up cache on failure so retry doesn't reuse partial/failed files
      resetUploadCache();

      const rawErr = error?.rawError || error?.response?.data;
      const statusCode = error?.status || error?.response?.status || rawErr?.code || rawErr?.statusCode;

      let extractedMsg =
        error?.errorMessage ||
        (typeof rawErr === "object" ? (rawErr?.message || rawErr?.error) : (typeof rawErr === "string" ? rawErr : null)) ||
        error?.message;

      if (extractedMsg && extractedMsg.includes("Request failed with status code")) {
        const detailMsg = typeof rawErr === "object" ? (rawErr?.message || rawErr?.error) : (typeof rawErr === "string" ? rawErr : null);
        extractedMsg = detailMsg || (statusCode === 409 ? "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។" : null);
      }

      const errorMessage = extractedMsg;
      const errorResponse = rawErr;

      const isAccountExists =
        statusCode === 409 ||
        statusCode === "409" ||
        (errorMessage != null && (
          errorMessage.toLowerCase().includes("exist") ||
          errorMessage.toLowerCase().includes("already") ||
          errorMessage.includes("រួចហើយ") ||
          errorMessage.includes("គណនីមាន") ||
          errorMessage.includes("មានគណនី")
        ));

      if (isAccountExists) {
        const friendlyMessage =
          errorMessage ||
          "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។";

        setAccountExistsData({
          cif: errorResponse?.details?.cif || errorResponse?.data?.cif,
          accountNumber: errorResponse?.details?.accountNumber || errorResponse?.data?.khrAccount,
          accountName: errorResponse?.details?.accountName || errorResponse?.data?.legalHolderName,
          message: friendlyMessage,
        });
        setShowAccountExistsModal(true);
      } else {
        const fullMsg =
          errorMessage ||
          (typeof error === "string" ? error : error?.message) ||
          translate("err_generic_message") ||
          "មានបញ្ហាកើតឡើងក្នុងការស្នើសុំគណនី។ សូមព្យាយាមម្តងទៀត។";

        showError({
          title: translate("err_generic_title") || "ការស្នើសុំមិនជោគជ័យ",
          message: fullMsg,
        });
      }
    } finally {
      setTimeout(() => {
        setLoadingState({ isLoading: false, title: "", message: "" });
        setProgressPercent(0);
      }, 300);
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
    progressPercent,
  };
};


