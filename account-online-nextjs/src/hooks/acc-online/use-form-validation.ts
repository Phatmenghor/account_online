import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import {
  NIDFormData,
  NIDFormSchema,
  PublicNIDFormSchema,
} from "@/components/acc-online/form-field/form-validate-error";

export const useFormValidation = (isPublic: boolean = false) => {
  const [formData, setFormData] = useState<ResponseNID>({
    idNumber: "",
    lastNameKh: "",
    firstNameKh: "",
    dob: "",
    gender: "",
    lastNameEn: "",
    firstNameEn: "",
    expiredDate: "",
    issuedDate: "",
    address: "",
    pob: "",
    MRZ1: "",
    MRZ2: "",
    MRZ3: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [datePickerKey, setDatePickerKey] = useState(0);

  const translate = useTranslations("NIDPage");
  const translateSelect = useTranslations("common");

  // Validate a single field
  const validateField = (fieldName: keyof NIDFormData, value: any) => {
    try {
      const schema = isPublic ? PublicNIDFormSchema : NIDFormSchema;
      const fieldSchema = schema.shape[fieldName];
      fieldSchema.parse(value);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error: any) {
      if (error.issues?.[0]) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldName]: error.issues[0].message,
        }));
      }
    }
  };

  // Validation handler from OTP component
  const handleValidationChange = useCallback(
    (field: string, error: string | null) => {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    },
    []
  );

  const handleInputChange = (field: keyof ResponseNID, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateField(field as keyof NIDFormData, value);
  };

  const clearValidation = () => {
    setValidationErrors({});
    setFormData({
      idNumber: "",
      lastNameKh: "",
      firstNameKh: "",
      dob: "",
      gender: "",
      lastNameEn: "",
      firstNameEn: "",
      expiredDate: "",
      issuedDate: "",
      address: "",
      pob: "",
      MRZ1: "",
      MRZ2: "",
      MRZ3: "",
    });
    setDatePickerKey((prev) => prev + 1);
  };

  return {
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
  };
};
