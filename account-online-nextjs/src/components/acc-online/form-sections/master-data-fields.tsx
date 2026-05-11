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

  const renderVerifiedIcon = (isCombo = false) =>
    isVerified && (
      <CheckCircle
        className={`absolute right-${isCombo ? "8" : "3"
          } top-2.5 h-5 w-5 text-green-600 pointer-events-none`}
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
      {/* Marital Status */}
      <div className="md:col-span-2 space-y-1">
        {renderLabel("marital")}
        <div className="relative">
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
              className={`w-full h-10 text-sm ${validationErrors.maritalStatus ? "border-red-500" : ""
                }`}
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
          {isVerified && (
            <CheckCircle className="absolute right-8 top-2.5 h-5 w-5 text-green-600 pointer-events-none" />
          )}
        </div>
        {validationErrors.maritalStatus && (
          <p className="text-xs text-red-500">
            {translate("err_maritalStatus")}
          </p>
        )}
      </div>

      {/* Occupation */}
      <div className="space-y-1">
        {renderLabel("occupation")}
        <div className="relative">
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
              className={`w-full h-10 text-sm ${validationErrors.occupation ? "border-red-500" : ""
                }`}
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
          {isVerified && (
            <CheckCircle className="absolute right-8 top-2.5 h-5 w-5 text-green-600 pointer-events-none" />
          )}
        </div>
        {validationErrors.occupation && (
          <p className="text-xs text-red-500">{translate("err_occupation")}</p>
        )}
      </div>

      {/* Branch */}
      <div className="space-y-1">
        {renderLabel("branch")}
        <div className="relative">
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
          {isVerified && (
            <CheckCircle className="absolute right-8 top-2.5 h-5 w-5 text-green-600 pointer-events-none" />
          )}
        </div>
        {validationErrors.branch && (
          <p className="text-xs text-red-500">{translate("err_branch")}</p>
        )}
      </div>

      {/* Reference */}
      <div className="md:col-span-2 space-y-1">
        {renderLabel("reference")}
        <div className="flex relative">
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
              className={`w-40 h-10 rounded-r-none ${validationErrors.referenceBank ? "border-red-500" : ""
                }`}
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
          <div className="flex-1 relative">
            <Input
              placeholder={translate("staffCode")}
              value={staffCode}
              onChange={(e) => {
                setStaffCode(e.target.value);
                validateField("staffCode", e.target.value);
              }}
              className="w-full h-10 !rounded-l-none text-sm"
              disabled={isLoading || isValidating || isSubmitting}
            />
            {renderVerifiedIcon()}
          </div>
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
