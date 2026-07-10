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
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { useFormState } from "@/contexts/form-state-context";
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
    <Label htmlFor={labelKey} className="text-base sm:text-lg font-medium mb-1 block">
      {translate(labelKey)}
      {isVerified && (
        <span className="float-right text-green-600 text-sm flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Verified
        </span>
      )}
    </Label>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First Name (KH) */}
      <div className="space-y-1">
        {renderLabel("firstNameKh")}
        <Input
          id="lastNameKh"
          placeholder={translate("firstNameKh")}
          value={formData.lastNameKh}
          onChange={(e) => handleInputChange("lastNameKh", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.lastNameKh ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.lastNameKh && (
          <p className="text-sm text-red-500">{translate("err_firstNameKh")}</p>
        )}
      </div>

      {/* Last Name (KH) */}
      <div className="space-y-1">
        {renderLabel("lastNameKH")}
        <Input
          id="firstNameKh"
          placeholder={translate("lastNameKH")}
          value={formData.firstNameKh}
          onChange={(e) => handleInputChange("firstNameKh", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.firstNameKh ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.firstNameKh && (
          <p className="text-sm text-red-500">{translate("err_lastNameKh")}</p>
        )}
      </div>

      {/* Family Name */}
      <div className="space-y-1">
        {renderLabel("familyNameEn")}
        <Input
          id="lastNameEn"
          placeholder={translate("familyNameEn")}
          value={formData.lastNameEn}
          onChange={(e) => handleInputChange("lastNameEn", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.lastNameEn ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.lastNameEn && (
          <p className="text-sm text-red-500">{translate("err_lastNameEn")}</p>
        )}
      </div>

      {/* Given Name */}
      <div className="space-y-1">
        {renderLabel("givenNameEn")}
        <Input
          id="firstNameEn"
          placeholder={translate("givenNameEn")}
          value={formData.firstNameEn}
          onChange={(e) => handleInputChange("firstNameEn", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.firstNameEn ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.firstNameEn && (
          <p className="text-sm text-red-500">{translate("err_firstNameEn")}</p>
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
          <p className="text-sm text-red-500">{translate("err_dob")}</p>
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
          <SelectTrigger
            className={`w-full h-12 text-base ${validationErrors.gender ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder={translateSelect("selectGender")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Female">{translate("female")}</SelectItem>
            <SelectItem value="Male">{translate("male")}</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.gender && (
          <p className="text-sm text-red-500">{translate("err_gender")}</p>
        )}
      </div>

      {/* Legal Type new*/}
      <div className="space-y-1">
        {renderLabel("legalType")}
        <Select
          value={selectedLegalType?.id.toString() || ""}
          onValueChange={(value) => {
            const legalType = legalTypes.find(
              (l) => l.id.toString() === value
            );
            setSelectedLegalType(legalType || null);
            validateField("legalType", value);
          }}
          disabled={isLoading || isValidating || isLegalTypeLoading}
        >
          <SelectTrigger
            className={`w-full h-12 text-base ${validationErrors.legalType ? "border-red-500" : ""}`}
          >
            <SelectValue
              placeholder={
                isLegalTypeLoading
                  ? translate("loading")
                  : translateSelect("selectLegalType")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {legalTypes.map((legalType) => (
              <SelectItem key={legalType.id} value={legalType.id.toString()}>
                {getLegalTypeName(legalType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.legalType && (
          <p className="text-sm text-red-500">{translate("err_legalType")}</p>
        )}
      </div>

      {/* Legal ID */}
      <div className="space-y-1">
        {renderLabel("legalId")}
        <Input
          id="idNumber"
          placeholder={translate("legalId")}
          value={formData.idNumber}
          onChange={(e) => handleInputChange("idNumber", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.idNumber ? "border-red-500" : ""} ${isNidExtracted ? "cursor-default select-text" : ""}`}
          readOnly={isNidExtracted}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.idNumber && (
          <p className="text-sm text-red-500">{translate("err_idNumber")}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1">
        {renderLabel("address")}
        <Input
          id="address"
          placeholder={translate("address")}
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.address ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.address && (
          <p className="text-sm text-red-500">{translate("err_address")}</p>
        )}
      </div>

      {/* Place Of Birth */}
      <div className="space-y-1">
        {renderLabel("pob")}
        <Input
          id="pob"
          placeholder={translate("pob")}
          value={formData.pob}
          onChange={(e) => handleInputChange("pob", e.target.value)}
          className={`w-full h-12 text-base ${validationErrors.pob ? "border-red-500" : ""}`}
          disabled={isLoading || isValidating || isSubmitting}
        />
        {validationErrors.pob && (
          <p className="text-sm text-red-500">{translate("err_pob")}</p>
        )}
      </div>
    </div>
  );
};
