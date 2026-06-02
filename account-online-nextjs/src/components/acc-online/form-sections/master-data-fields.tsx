import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxSelectBranch } from "@/components/shared/combo-box/combobox-branch";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { BranchModel } from "@/models/branch/branch.response";
import { AccOnlineCategoryModel } from "@/models/static/acc-online-category/acc-online-category.response";
import { useFormState } from "@/contexts/form-state-context";
import { CheckCircle } from "lucide-react";

interface MasterDataFieldsProps {
  maritalStatuses: MaritalModel[];
  selectedMaritalStatus: MaritalModel | null;
  setSelectedMaritalStatus: (value: MaritalModel | null) => void;
  isLoadingMarital: boolean;
  getMaritalName: (item: MaritalModel) => string;
  occupations: OccupationModel[];
  selectedOccupation: OccupationModel | null;
  setSelectedOccupation: (value: OccupationModel | null) => void;
  isLoadingOccupations: boolean;
  getOccupationName: (item: OccupationModel) => string;
  referenceBanks: ReferenceModel[];
  selectedReferenceBank: ReferenceModel | null;
  setSelectedReferenceBank: (value: ReferenceModel | null) => void;
  isLoadingReferenceBanks: boolean;
  getReferenceName: (item: ReferenceModel) => string;
  selectedBranch: BranchModel | null;
  onBranchChange: (branch: BranchModel) => void;
  staffCode: string;
  setStaffCode: (value: string) => void;
  accOnlineCategories: AccOnlineCategoryModel[];
  selectedCategory: AccOnlineCategoryModel | null;
  setSelectedCategory: (value: AccOnlineCategoryModel | null) => void;
  isLoadingCategories: boolean;
  isVerified?: boolean;
}

export const MasterDataFields: React.FC<MasterDataFieldsProps> = ({
  maritalStatuses,
  selectedMaritalStatus,
  setSelectedMaritalStatus,
  isLoadingMarital,
  getMaritalName,
  occupations,
  selectedOccupation,
  setSelectedOccupation,
  isLoadingOccupations,
  getOccupationName,
  referenceBanks,
  selectedReferenceBank,
  setSelectedReferenceBank,
  isLoadingReferenceBanks,
  getReferenceName,
  selectedBranch,
  onBranchChange,
  staffCode,
  setStaffCode,
  accOnlineCategories,
  selectedCategory,
  setSelectedCategory,
  isLoadingCategories,
  isVerified = false,
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

  const renderLabel = (labelKey: string) => (
    <Label htmlFor={labelKey} className="text-sm sm:text-base mb-1 block">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
      {/* Marital Status */}
      <div className="space-y-1">
        {renderLabel("marital")}
        <Select
          value={selectedMaritalStatus?.id.toString() || ""}
          onValueChange={(value) => {
            const marital = maritalStatuses.find(
              (m) => m.id.toString() === value
            );
            setSelectedMaritalStatus(marital || null);
            validateField("maritalStatus", value);
          }}
          disabled={isLoading || isValidating || isLoadingMarital}
        >
          <SelectTrigger
            className={`w-full h-10 text-sm ${validationErrors.maritalStatus ? "border-red-500" : ""}`}
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

      {/* Occupation */}
      <div className="space-y-1">
        {renderLabel("occupation")}
        <Select
          value={selectedOccupation?.id.toString() || ""}
          onValueChange={(value) => {
            const occupation = occupations.find(
              (o) => o.id.toString() === value
            );
            setSelectedOccupation(occupation || null);
            validateField("occupation", value);
          }}
          disabled={isLoading || isValidating || isLoadingOccupations}
        >
          <SelectTrigger
            className={`w-full h-10 text-sm ${validationErrors.occupation ? "border-red-500" : ""}`}
          >
            <SelectValue
              placeholder={
                isLoadingOccupations
                  ? translate("loading")
                  : translateSelect("selectOccupation")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {occupations.map((occupation) => (
              <SelectItem
                key={occupation.id}
                value={occupation.id.toString()}
              >
                {getOccupationName(occupation)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.occupation && (
          <p className="text-xs text-red-500">{translate("err_occupation")}</p>
        )}
      </div>

      {/* Branch */}
      <div className="space-y-1">
        {renderLabel("branch")}
        <div
          className={
            validationErrors.branch ? "border border-red-500 rounded" : ""
          }
        >
          <ComboboxSelectBranch
            dataSelect={selectedBranch}
            onChangeSelected={onBranchChange}
            disabled={isLoading || isValidating || isSubmitting}
          />
        </div>
        {validationErrors.branch && (
          <p className="text-xs text-red-500">{translate("err_branch")}</p>
        )}
      </div>

      {/* Account Product */}
      <div className="space-y-1">
        {renderLabel("accountProduct")}
        <Select
          value={selectedCategory?.id.toString() || ""}
          onValueChange={(value) => {
            const category = accOnlineCategories.find((c) => c.id.toString() === value);
            setSelectedCategory(category || null);
            validateField("accountProduct", value);
          }}
          disabled={isLoading || isValidating || isLoadingCategories}
        >
          <SelectTrigger
            className={`w-full h-10 text-sm ${validationErrors.accountProduct ? "border-red-500" : ""}`}
          >
            <SelectValue
              placeholder={isLoadingCategories ? translate("loading") : translateSelect("selectAccount")}
            />
          </SelectTrigger>
          <SelectContent>
            {accOnlineCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.lookupId} - {cat.lookupName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.accountProduct && (
          <p className="text-xs text-red-500">{translate("err_accountProduct")}</p>
        )}
      </div>

      {/* Reference */}
      <div className="md:col-span-2 space-y-1">
        {renderLabel("reference")}
        <div className="flex">
          <Select
            value={selectedReferenceBank?.id.toString() || ""}
            onValueChange={(value) => {
              const reference = referenceBanks.find(
                (r) => r.id.toString() === value
              );
              setSelectedReferenceBank(reference || null);
              validateField("referenceBank", value);
            }}
            disabled={isLoading || isValidating || isLoadingReferenceBanks}
          >
            <SelectTrigger
              className={`w-40 h-10 rounded-r-none ${validationErrors.referenceBank ? "border-red-500" : ""}`}
            >
              <SelectValue
                placeholder={
                  isLoadingReferenceBanks
                    ? translate("loading")
                    : translateSelect("selectRef")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {referenceBanks.map((reference) => (
                <SelectItem key={reference.id} value={reference.id.toString()}>
                  {getReferenceName(reference)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={translate("staffCode")}
            value={staffCode}
            onChange={(e) => {
              setStaffCode(e.target.value);
              validateField("staffCode", e.target.value);
            }}
            className="flex-1 h-10 !rounded-l-none text-sm"
            disabled={isLoading || isValidating || isSubmitting}
          />
        </div>
        {validationErrors.referenceBank && (
          <p className="text-xs text-red-500">
            {validationErrors.referenceBank}
          </p>
        )}
        {validationErrors.staffCode && (
          <p className="text-xs text-red-500">{validationErrors.staffCode}</p>
        )}
      </div>
    </div>
  );
};
