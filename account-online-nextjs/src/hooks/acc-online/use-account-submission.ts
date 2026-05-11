import { useState, useRef } from "react";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { BranchModel } from "@/models/branch/branch.response";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";
import { formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { createOpenAccountService } from "@/services/open-account/openAccount.service";
import { uploadDocument } from "@/services/document/document.service";

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
  staffCode: string;
  locationData: LocationSubmitData;
  convertGenderToAPI: (gender: string) => string;
  getMaritalStatusString: (id: string) => string;
  translate: (key: string) => string;
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
  staffCode,
  locationData,
  convertGenderToAPI,
  getMaritalStatusString,
  translate,
}: UseAccountSubmissionProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    title: "",
    message: "",
  });
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

  // ── Cache uploaded filenames to prevent duplicate uploads ──
  const uploadCache = useRef<UploadCache>({
    nidFileName: null,
    selfieFileName: null,
  });

  const showError = (override?: Partial<typeof GENERIC_ERROR>) => {
    setSubmitErrorData({ ...GENERIC_ERROR, ...override });
    setShowSubmitErrorModal(true);
  };

  // ── Call this when user retakes NID or Selfie photo ──
  const resetUploadCache = () => {
    uploadCache.current = { nidFileName: null, selfieFileName: null };
  };

  const handleSubmitAccount = async () => {
    // ── 1. Guard: validate images exist ──
    const nidBase64Full: string = uploadedImage?.idImage ?? "";
    const selfieBase64Full: string = selfieImage ?? "";

    if (!nidBase64Full) {
      showError({
        title: "រូបភាព NID បាត់",
        message: "រូបភាព NID បាត់។ សូមថតរូបម្ដងទៀត រួចព្យាយាមម្ដងទៀត។",
      });
      return;
    }

    if (!selfieBase64Full) {
      showError({
        title: "រូបថតខ្លួនបាត់",
        message: "រូបថតខ្លួនបាត់។ សូមថតរូបម្ដងទៀត រួចព្យាយាមម្ដងទៀត។",
      });
      return;
    }

    setLoadingState({
      isLoading: true,
      title: "កំពុងដាក់ស្នើ",
      message: "កំពុងផ្ទុករូបភាព...",
    });

    try {
      // ── 2. Upload only if not already uploaded this session ──
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

        // Store in cache — retry reuses these, no duplicate upload
        uploadCache.current = { nidFileName, selfieFileName };
      }

      const { nidFileName, selfieFileName } = uploadCache.current;

      // ── 3. Update loading message ──
      setLoadingState((prev) => ({
        ...prev,
        message: "កំពុងដាក់ស្នើសុំបង្កើតគណនីសម្រាប់ឆ្លើយប្រតិកម្ម...",
      }));

      // ── 4. Submit account ──
      // Helper to only include fields with actual values
      const buildAccountData = () => {
        const data: Record<string, any> = {
          // Personal Information - always required
          familyName: formData.lastNameEn,
          givenName: formData.firstNameEn,
          firstNameKh: formData.firstNameKh,
          lastNameKh: formData.lastNameKh,
          gender: convertGenderToAPI(formData.gender),
          dateOfBirth: formatDate(formData.dob),
          phoneNumber: phoneNumber,

          // Legal Information - always required
          legalId: formData.idNumber,
          legalAddress: formData.address,
          legalIssueDate: formatDate(formData.issuedDate),
          legalExpireDate: formatDate(formData.expiredDate),
          legalMrz1: formData.MRZ1,
          legalMrz2: formData.MRZ2,
          legalMrz3: formData.MRZ3,

          // Place of Birth - always include
          placeOfBirth: formData.pob,

          // Branch and Images - always required
          branchCode: selectedBranch!.branchID,
          nidImageName: nidFileName!,
          selfieImageName: selfieFileName!,
          customerRole: "OWNER",
        };

        // Conditionally add fields if they have values
        if (selectedLegalType?.legalTypeValue) {
          data.legalDocType = selectedLegalType.legalTypeValue;
        }

        if (phoneNumber) {
          data.phoneNumber = phoneNumber;
        }

        if (selectedMaritalStatus) {
          data.maritalStatus = getMaritalStatusString(selectedMaritalStatus.id.toString());
        }

        if (selectedOccupation?.occupationCode) {
          data.occupation = selectedOccupation.occupationCode;
        }

        if (selectedReferenceBank?.nameEn) {
          data.companyName = selectedReferenceBank.nameEn;
        }

        if (staffCode) {
          data.referralId = staffCode;
          data.releasedBy = staffCode;
        }

        // Add address fields only if they have values
        if (locationData.currentAddress.province?.provinceCode) {
          data.customerCurrentProvince = locationData.currentAddress.province.provinceCode;
        }
        if (locationData.currentAddress.district?.districtCode) {
          data.customerCurrentDistrict = locationData.currentAddress.district.districtCode;
        }
        if (locationData.currentAddress.commune?.communeCode) {
          data.customerCurrentCommune = locationData.currentAddress.commune.communeCode;
        }
        if (locationData.currentAddress.village?.villageCode) {
          data.customerCurrentVillage = locationData.currentAddress.village.villageCode;
        }

        // Place of birth address - only if provided
        if (locationData.placeOfBirth.province?.provinceCode) {
          data.customerPobProvince = locationData.placeOfBirth.province.provinceCode;
        }
        if (locationData.placeOfBirth.district?.districtCode) {
          data.customerPobDistrict = locationData.placeOfBirth.district.districtCode;
        }
        if (locationData.placeOfBirth.commune?.communeCode) {
          data.customerPobCommune = locationData.placeOfBirth.commune.communeCode;
        }
        if (locationData.placeOfBirth.village?.villageCode) {
          data.customerPobVillage = locationData.placeOfBirth.village.villageCode;
        }

        return data;
      };

      const accountData = buildAccountData();
      const response = await createOpenAccountService(accountData);

      // ── 5. Clear cache on success ──
      uploadCache.current = { nidFileName: null, selfieFileName: null };

      setSuccessData({
        title: "សូមស្វាគមន៍",
        message: response?.message || "ស្នើសុំបង្កើតគណនីរបស់អ្នកត្រូវបានបញ្ជូនដោយជោគជ័យ។",
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Submission error:", error);

      // Extract actual error message from backend
      const errorMessage = error?.errorMessage || error?.message;
      const errorResponse = error?.rawError;

      // Check if this is a pending request already exists message
      const isPendingRequest = errorMessage?.toLowerCase().includes("ដាក់ស្នើសុំបង្កើតគណនីរួចហើយ");

      // Check if account already exists
      const isAccountExists =
        errorMessage?.toLowerCase().includes("exist") ||
        errorMessage?.toLowerCase().includes("already") ||
        errorResponse?.message?.toLowerCase().includes("exist") ||
        errorResponse?.message?.toLowerCase().includes("already");

      if (isPendingRequest) {
        // Show as waiting message, not error
        setSubmitErrorData({
          title: "សូមរង់ចាំ",
          message: errorMessage,
          variant: "warning",
        });
        setShowSubmitErrorModal(true);
      } else if (isAccountExists && errorResponse?.data) {
        // Show account exists modal with account details
        setAccountExistsData({
          cif: errorResponse.data.cif,
          accountNumber: errorResponse.data.accountNumber || errorResponse.data.khrAccount,
          accountName: errorResponse.data.accountName || errorResponse.data.legalHolderName,
          message: errorMessage || "គណនីធនាគារលក់ដ៏ងរបស់អ្នកបានបង្កើតរួចរាល់។ អ្នកអាចបង្ហាញលេខគណនីរបស់អ្នក ឬបន្តប្រើប្រាស់វា។",
        });
        setShowAccountExistsModal(true);
      } else if (errorMessage) {
        // Show actual backend error message
        showError({
          title: "មានបញ្ហាកើតឡើង",
          message: errorMessage,
        });
      } else {
        // Fallback to generic error only if no message available
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
