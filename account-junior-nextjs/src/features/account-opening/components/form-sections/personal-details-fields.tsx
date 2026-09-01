"use client";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDateTimePicker } from "@/components/shared/common/custom-datetime-picker";
import { ResponseNID } from "@/features/account-opening/types/nid.response.model";
import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { useFormState } from "@/providers/form-state-context";
import { CheckCircle } from "lucide-react";

interface PersonalDetailsFieldsProps {
  formData: ResponseNID;
  handleInputChange: (field: keyof ResponseNID, value: string) => void;
  datePickerKey: number;
  legalTypes: LegalTypeModel[];
  selectedLegalType: LegalTypeModel | null;
  setSelectedLegalType: (value: LegalTypeModel | null) => void;
  isLegalTypeLoading: boolean;
  getLegalTypeName: (item: LegalTypeModel) => string;
  maritalStatuses?: MaritalModel[];
  selectedMaritalStatus?: MaritalModel | null;
  setSelectedMaritalStatus?: (value: MaritalModel | null) => void;
  isLoadingMarital?: boolean;
  getMaritalName?: (item: MaritalModel) => string;
  isVerified?: boolean;
  isNidExtracted?: boolean;
}

export const PersonalDetailsFields: React.FC<PersonalDetailsFieldsProps> = ({
  formData,
  handleInputChange,
  datePickerKey,
  legalTypes,
  selectedLegalType,
  setSelectedLegalType,
  isLegalTypeLoading,
  getLegalTypeName,
  maritalStatuses = [],
  selectedMaritalStatus = null,
  setSelectedMaritalStatus,
  isLoadingMarital = false,
  getMaritalName = (m) => m.nameEn,
  isVerified = false,
  isNidExtracted = false,
}) => {
  // Get values from FormStateContext
  const {
    validationErrors,
    isLoading,
    isValidating,
    isSubmitting,
    translate,
    translateSelect,
    validateField,
  } = useFormState();

  useEffect(() => {
    if (!selectedLegalType && legalTypes.length > 0) {
      setSelectedLegalType(legalTypes[0]);
      validateField("legalType", legalTypes[0].id.toString());
    }
  }, [legalTypes, selectedLegalType]);

  const renderLabel = (labelKey: string) => (
    <div className="flex items-center justify-between mb-1">
      <Label htmlFor={labelKey} className="text-sm font-medium text-gray-700">
        {translate(labelKey)}
      </Label>
      {isVerified && (
        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
      )}
    </div>
  );

  const getPlaceholder = (labelKey: string) => {
    const labelText = translate(labelKey);
    if (!labelText || labelText === labelKey) return "";
    if (labelText.startsWith("សូម") || labelText.startsWith("Enter")) return labelText;
    const isKhmer = /[\u1780-\u17FF]/.test(labelText);
    return isKhmer ? `សូមបញ្ចូល ${labelText}` : `Enter ${labelText}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name (KH) */}
      <div className="space-y-1">
        {renderLabel("firstNameKh")}
        <Input
          id="firstNameKh"
          placeholder={getPlaceholder("firstNameKh")}
          value={formData.firstNameKh}
          onChange={(e) => handleInputChange("firstNameKh", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.firstNameKh ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.firstNameKh && (
          <p className="text-xs text-red-500">{translate("err_firstNameKh")}</p>
        )}
      </div>

      {/* Last Name (KH) */}
      <div className="space-y-1">
        {renderLabel("lastNameKH")}
        <Input
          id="lastNameKh"
          placeholder={getPlaceholder("lastNameKH")}
          value={formData.lastNameKh}
          onChange={(e) => handleInputChange("lastNameKh", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.lastNameKh ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.lastNameKh && (
          <p className="text-xs text-red-500">{translate("err_lastNameKh")}</p>
        )}
      </div>

      {/* Family Name */}
      <div className="space-y-1">
        {renderLabel("familyNameEn")}
        <Input
          id="lastNameEn"
          placeholder={getPlaceholder("familyNameEn")}
          value={formData.lastNameEn}
          onChange={(e) => handleInputChange("lastNameEn", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.lastNameEn ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.lastNameEn && (
          <p className="text-xs text-red-500">{translate("err_lastNameEn")}</p>
        )}
      </div>

      {/* Given Name */}
      <div className="space-y-1">
        {renderLabel("givenNameEn")}
        <Input
          id="firstNameEn"
          placeholder={getPlaceholder("givenNameEn")}
          value={formData.firstNameEn}
          onChange={(e) => handleInputChange("firstNameEn", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.firstNameEn ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.firstNameEn && (
          <p className="text-xs text-red-500">{translate("err_firstNameEn")}</p>
        )}
      </div>

      {/* Date Of Birth */}
      <div className="space-y-1">
        {renderLabel("dateOfBirth")}
        <CustomDateTimePicker
          key={datePickerKey}
          value={formData.dob}
          onChange={(value) => handleInputChange("dob", value)}
          disabled={isLoading || isValidating || isSubmitting}
          error={!!validationErrors.dob}
        />
        {validationErrors.dob && (
          <p className="text-xs text-red-500">{translate("err_dob")}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-1">
        {renderLabel("gender")}
        <Select
          value={formData.gender || ""}
          onValueChange={(value) => handleInputChange("gender", value)}
          disabled={isLoading || isValidating || isSubmitting}
        >
          <SelectTrigger className={`w-full h-9 text-sm rounded-xl ${validationErrors.gender ? "border-red-400" : ""}`}>
            <SelectValue placeholder={translateSelect("selectGender")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Female">{translate("female")}</SelectItem>
            <SelectItem value="Male">{translate("male")}</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.gender && (
          <p className="text-xs text-red-500">{translate("err_gender")}</p>
        )}
      </div>

      {/* Legal ID */}
      <div className="space-y-1">
        {renderLabel("legalId")}
        <Input
          id="idNumber"
          placeholder={getPlaceholder("legalId")}
          value={formData.idNumber}
          onChange={(e) => handleInputChange("idNumber", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.idNumber ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting || isNidExtracted}
        />
        {validationErrors.idNumber && (
          <p className="text-xs text-red-500">{translate("err_idNumber")}</p>
        )}
      </div>

      {/* Place Of Birth */}
      <div className="space-y-1">
        {renderLabel("pob")}
        <Input
          id="pob"
          placeholder={getPlaceholder("pob")}
          value={formData.pob}
          onChange={(e) => handleInputChange("pob", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.pob ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.pob && (
          <p className="text-xs text-red-500">{translate("err_pob")}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1">
        {renderLabel("address")}
        <Input
          id="address"
          placeholder={getPlaceholder("address")}
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className={`w-full h-9 text-sm rounded-xl ${validationErrors.address ? "border-red-400 focus-visible:ring-red-300" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.address && (
          <p className="text-xs text-red-500">{translate("err_address")}</p>
        )}
      </div>

      {/* Marital Status (ស្ថានភាពគ្រួសារ) */}
      <div className="space-y-1">
        {renderLabel("marital")}
        <Select
          value={selectedMaritalStatus?.id.toString() || ""}
          onValueChange={(value) => {
            const marital = maritalStatuses.find((m) => m.id.toString() === value);
            if (setSelectedMaritalStatus) setSelectedMaritalStatus(marital || null);
            validateField("maritalStatus", value);
          }}
          disabled={isLoading || isValidating || isLoadingMarital}
        >
          <SelectTrigger
            className={`w-full h-9 text-sm rounded-xl ${validationErrors.maritalStatus ? "border-red-400" : ""}`}
          >
            <SelectValue
              placeholder={
                isLoadingMarital
                  ? translate("loading")
                  : translateSelect("selectMarital")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {maritalStatuses.map((marital) => (
              <SelectItem key={marital.id} value={marital.id.toString()}>
                {getMaritalName(marital)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.maritalStatus && (
          <p className="text-xs text-red-500">
            {translate("err_maritalStatus")}
          </p>
        )}
      </div>
    </div>
  );
};
