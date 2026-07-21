import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { RequestValidModel } from "@/features/account-opening/types/nid.request.model";
import { ResponseNID } from "@/features/account-opening/types/nid.response.model";
import { validateNIDService } from "@/features/account-opening/services/nid.service";
import {
  convertGenderForAPI,
  formatDate,
} from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { useClientLocale } from "@/providers/local-provider";
import { OccupationModel } from "@/features/master-data/types/occupation/occupation.response";
import { ReferenceModel } from "@/features/master-data/types/reference/reference.response";
import { AppToast } from "@/components/shared/toast/app-toast";
import { BranchModel } from "@/types/branch/branch.response";
import {
  NIDFormData,
  NIDFormSchema,
  NIDVerificationSchema,
  PublicNIDFormSchema,
} from "@/features/account-opening/components/form-field/form-validate-error";
import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { AccOnlineCategoryModel } from "@/features/master-data/types/acc-online-category/acc-online-category.response";
import { LocationSubmitData } from "@/features/account-opening/types/address/open-acc-address.request.model";
import { applicationName } from "@/constants/AppResource/display-list/enum/status";

interface UseVerificationFlowProps {
  formData: ResponseNID;
  setFormData: (
    data: ResponseNID | ((prev: ResponseNID) => ResponseNID)
  ) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (
    errors:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>)
  ) => void;
  validateField: (field: keyof NIDFormData, value: any) => void;
  selectedMaritalStatus: MaritalModel | null;
  selectedOccupation: OccupationModel | null;
  selectedReferenceBank: ReferenceModel | null;
  selectedLegalType: LegalTypeModel | null;
  selectedCategory: AccOnlineCategoryModel | null;
  phoneNumber: string;
  isPublic?: boolean;
}

export const useVerificationFlow = ({
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
  isPublic = false,
}: UseVerificationFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchModel | null>(
    null
  );
  const [staffCode, setStaffCode] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);

  const { locale: currentLocale } = useClientLocale();
  const translate = useTranslations("NIDPage");

  // Validate entire form for verification - accepts images as parameters
  const validateVerificationForm = (
    uploadedImageData: string,
    selfieImageData: string
  ): boolean => {
    const verificationData = {
      idImage: uploadedImageData || "",
      selfieImage: selfieImageData || "",
      lastNameKh: formData.lastNameKh,
      firstNameKh: formData.firstNameKh,
      lastNameEn: formData.lastNameEn,
      firstNameEn: formData.firstNameEn,
      dob: formData.dob,
      gender: formData.gender,
      idNumber: formData.idNumber,
      address: formData.address,
      pob: formData.pob,
    };

    const result = NIDVerificationSchema.safeParse(verificationData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  // Validate entire form for final submission
  const validateFullForm = (
    uploadedImageData: string,
    selfieImageData: string,
    phoneNumberData: string,
    isPhoneVerifiedData: boolean
  ): boolean => {
    const fullData: NIDFormData = {
      idImage: uploadedImageData || "",
      selfieImage: selfieImageData || "",
      lastNameKh: formData.lastNameKh,
      firstNameKh: formData.firstNameKh,
      lastNameEn: formData.lastNameEn,
      firstNameEn: formData.firstNameEn,
      dob: formData.dob,
      gender: formData.gender,
      idNumber: formData.idNumber,
      address: formData.address,
      pob: formData.pob,
      legalType: selectedLegalType?.legalTypeValue || "",
      maritalStatus: selectedMaritalStatus?.nameEn || "",
      occupation: selectedOccupation?.occupationCode || "",
      branch: selectedBranch?.branchkh || "",
      accountProduct: selectedCategory?.lookupId || "",
      referenceBank: selectedReferenceBank?.nameEn || "",
      staffCode: staffCode,
      phoneNumber: phoneNumberData,
      isPhoneVerified: isPhoneVerifiedData,
    };

    const schema = isPublic ? PublicNIDFormSchema : NIDFormSchema;
    const result = schema.safeParse(fullData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  const handleValidateNID = async (
    setShowLocationModal: (show: boolean) => void,
    setShowErrorModal: (show: boolean) => void,
    setValidationResult: (result: any) => void,
    setShowValidationErrorModal: (show: boolean) => void,
    setValidationErrorData: (data: any) => void
  ) => {
    setIsValidating(true);
    try {
      const validationData: RequestValidModel = {
        applicationName: applicationName.ACCOUNT_ONLINE,
        idNumber: formData.idNumber,
        lastNameKh: formData.lastNameKh,
        firstNameKh: formData.firstNameKh,
        lastNameEn: formData.lastNameEn,
        firstNameEn: formData.firstNameEn,
        dob: formatDate(formData.dob),
        gender: convertGenderForAPI(formData.gender),
        expiredDate: formatDate(formData.expiredDate),
        issuedDate: formatDate(formData.issuedDate),
        address: formData.address,
        pob: formData.pob,
        MRZ1: formData.MRZ1,
        MRZ2: formData.MRZ2,
        MRZ3: formData.MRZ3,
        phoneNumber: phoneNumber,
      };

      const response = await validateNIDService(validationData);
      setValidationResult(response);

      const incorrectFields = response.data.incorrectFields || [];

      // Check if any critical fields are in the incorrectFields array
      if (incorrectFields.length > 0) {
        setShowErrorModal(true);
      } else {
        setShowLocationModal(true);
      }
    } catch (error: any) {
      // Check error on "Number Id,..."
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to validate NID information.";
      // const errorStatus = error.message || "";

      console.log("## Error response:", error.response);
      console.log("## Error message:", errorMessage);

      setValidationErrorData({
        title: translate("valid_fail"),
        message: "",
        description: errorMessage,
      });
      setShowValidationErrorModal(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenConfirmModal = (
    uploadedImageData: string,
    selfieImageData: string,
    phoneNumberData: string,
    isPhoneVerifiedData: boolean,
    setShowConfirmationModal: (show: boolean) => void
  ) => {
    const isVerificationValid = validateVerificationForm(
      uploadedImageData,
      selfieImageData
    );
    const isFullFormValid = validateFullForm(
      uploadedImageData,
      selfieImageData,
      phoneNumberData,
      isPhoneVerifiedData
    );

    if (isVerificationValid && isFullFormValid) {
      setShowConfirmationModal(true);
    } else {
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        AppToast({
          type: "error",
          message: "Validation Error",
          description: validationErrors[firstErrorKey],
        });
      }
    }
  };

  const handleLocationSubmit = (
    data: LocationSubmitData,
    setLocationData: (data: LocationSubmitData) => void,
    setShowLocationModal: (show: boolean) => void
  ) => {
    setLocationData(data);

    const addressParts = [
      data.currentAddress.village?.villageKh,
      data.currentAddress.commune?.communeKh,
      data.currentAddress.district?.districtKh,
      data.currentAddress.province?.provinceKh,
    ].filter(Boolean);

    const currentAddressString = addressParts.join(" ");

    const pobParts = [
      data.placeOfBirth.village?.villageKh,
      data.placeOfBirth.commune?.communeKh,
      data.placeOfBirth.district?.districtKh,
      data.placeOfBirth.province?.provinceKh,
    ].filter(Boolean);

    const placeOfBirthString = pobParts.join(" ");

    setFormData((prev) => ({
      ...prev,
      address: currentAddressString,
      pob: placeOfBirthString,
    }));

    validateField("address", currentAddressString);
    validateField("pob", placeOfBirthString);

    setIsVerified(true);

    AppToast({
      type: "success",
      message:
        currentLocale === "kh"
          ? "ព័ត៌មានទីតាំងត្រូវបានរក្សាទុកដោយជោគជ័យ!"
          : "Location information saved successfully!",
      description:
        currentLocale === "kh"
          ? "ទិន្នន័យទីតាំងត្រូវបានកត់ត្រា។"
          : "Location data has been recorded.",
    });

    setShowLocationModal(false);
  };

  const onBranchChange = useCallback(
    (branch: BranchModel) => {
      setSelectedBranch(branch);
      validateField("branch", branch.branchkh);
    },
    [validateField]
  );

  // Helper function to convert gender to API format
  const convertGenderToAPI = (gender: string): string => {
    if (gender.toLowerCase() === "male" || gender.toLowerCase() === "m") {
      return "MALE";
    } else if (
      gender.toLowerCase() === "female" ||
      gender.toLowerCase() === "f"
    ) {
      return "FEMALE";
    }
    return gender.toUpperCase();
  };

  return {
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
  };
};


