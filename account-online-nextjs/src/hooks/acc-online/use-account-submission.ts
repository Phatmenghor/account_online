import { useState, useRef } from "react";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { AccOnlineCategoryModel } from "@/models/static/acc-online-category/acc-online-category.response";
import { BranchModel } from "@/models/branch/branch.response";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";
import { formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { createOpenAccountService } from "@/services/open-account/openAccount.service";
import { uploadDocument } from "@/services/document/document.service";
import { OpenAccountResponse } from "@/models/open-account/openAccount.response";

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
    const nidBase64Full: string = uploadedImage?.idImage ?? "";
    const selfieBase64Full: string = selfieImage ?? "";

    if (!nidBase64Full) {
      showError({
        title: translate("err_nid_missing_title"),
        message: translate("err_nid_missing_message"),
      });
      return;
    }

    if (!selfieBase64Full) {
      showError({
        title: translate("err_selfie_missing_title"),
        message: translate("err_selfie_missing_message"),
      });
      return;
    }

    setLoadingState({
      isLoading: true,
      title: translate("submitting_title"),
      message: translate("loading_images"),
    });

    try {
      if (
        !uploadCache.current.nidFileName ||
        !uploadCache.current.selfieFileName
      ) {
        const [nidFileName, selfieFileName] = await Promise.all([
          uploadCache.current.nidFileName
            ? Promise.resolve(uploadCache.current.nidFileName)
            : uploadDocument(
                nidBase64Full,
                `nid_${formData.idNumber}.jpg`,
                "nid",
                formData.idNumber,
              ),
          uploadCache.current.selfieFileName
            ? Promise.resolve(uploadCache.current.selfieFileName)
            : uploadDocument(
                selfieBase64Full,
                `selfie_${formData.idNumber}.jpg`,
                "selfie",
                formData.idNumber,
              ),
        ]);
        uploadCache.current = { nidFileName, selfieFileName };
      }

      const { nidFileName, selfieFileName } = uploadCache.current;

      setLoadingState((prev) => ({
        ...prev,
        message: translate("submitting_wait"),
      }));

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

      const response = await createOpenAccountService(accountData);
      uploadCache.current = { nidFileName: null, selfieFileName: null };

      setSuccessData(response?.data ?? response);
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage = error?.errorMessage || error?.message;
      const errorResponse = error?.rawError;

      const isAccountExists =
        errorMessage?.toLowerCase().includes("exist") ||
        errorMessage?.toLowerCase().includes("already") ||
        errorMessage?.includes("រួចហើយ") ||
        errorMessage?.includes("គណនីមាន") ||
        errorMessage?.includes("មានគណនី") ||
        errorResponse?.message?.toLowerCase().includes("exist") ||
        errorResponse?.message?.toLowerCase().includes("already") ||
        errorResponse?.message?.includes("រួចហើយ") ||
        errorMessage?.toLowerCase().includes("username") ||
        errorMessage?.toLowerCase().includes("mobile banking");

      if (isAccountExists) {
        setAccountExistsData({
          cif: errorResponse?.data?.cif,
          accountNumber: errorResponse?.data?.accountNumber || errorResponse?.data?.khrAccount,
          accountName: errorResponse?.data?.accountName || errorResponse?.data?.legalHolderName,
          message: errorMessage || translate("account_exists_message"),
        });
        setShowAccountExistsModal(true);
      } else if (errorMessage) {
        showError({
          title: translate("err_generic_title"),
          message: errorMessage,
        });
      } else {
        showError();
      }
    } finally {
      setLoadingState({ isLoading: false, title: "", message: "" });
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
