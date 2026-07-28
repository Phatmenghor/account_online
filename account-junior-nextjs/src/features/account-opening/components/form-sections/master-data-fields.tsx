import React, { useEffect, useRef, useState } from "react";
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
import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { OccupationModel } from "@/features/master-data/types/occupation/occupation.response";
import { BranchModel } from "@/types/branch/branch.response";
import { AccOnlineCategoryModel } from "@/features/master-data/types/acc-online-category/acc-online-category.response";
import { useFormState } from "@/providers/form-state-context";
import { CheckCircle, Loader2 } from "lucide-react";
import { findStaffByIdCardService } from "@/features/auth/services/register.service";
import { getUserInfo } from "@/utils/local-storage/userInfo";

const STAFF_LOOKUP_DEBOUNCE_MS = 450;

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
  selectedBranch: BranchModel | null;
  onBranchChange: (branch: BranchModel) => void;
  staffCode: string;
  setStaffCode: (value: string) => void;
  accOnlineCategories: AccOnlineCategoryModel[];
  selectedCategory: AccOnlineCategoryModel | null;
  setSelectedCategory: (value: AccOnlineCategoryModel | null) => void;
  isLoadingCategories: boolean;
  isVerified?: boolean;
  isPublic?: boolean;
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
  selectedBranch,
  onBranchChange,
  staffCode,
  setStaffCode,
  accOnlineCategories,
  selectedCategory,
  setSelectedCategory,
  isLoadingCategories,
  isVerified = false,
  isPublic = false,
  showBranch = true,
}: MasterDataFieldsProps & { showBranch?: boolean }) => {
  // Get values from FormStateContext
  const {
    validationErrors,
    isLoading,
    isValidating,
    isSubmitting,
    translate,
    translateSelect,
    validateField,
    handleValidationChange,
  } = useFormState();

  const [isVerifyingStaff, setIsVerifyingStaff] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupSeq = useRef(0);
  const prefillDone = useRef(false);

  async function verifyStaffCode(code: string) {
    const seq = ++lookupSeq.current;
    setIsVerifyingStaff(true);
    try {
      await findStaffByIdCardService(code);
      if (seq !== lookupSeq.current) return;
      handleValidationChange("staffCode", null);
    } catch {
      if (seq !== lookupSeq.current) return;
      handleValidationChange("staffCode", translate("err_staffCodeNotFound"));
    } finally {
      if (seq === lookupSeq.current) setIsVerifyingStaff(false);
    }
  }

  function handleStaffCodeChange(value: string) {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);

    // Public route: stored for logs only, not validated against staff records.
    if (isPublic) return;

    const code = value.trim();
    if (!code) {
      lookupSeq.current++;
      setIsVerifyingStaff(false);
      return;
    }

    lookupTimer.current = setTimeout(
      () => verifyStaffCode(code),
      STAFF_LOOKUP_DEBOUNCE_MS
    );
  }

  useEffect(() => {
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isPublic || prefillDone.current || staffCode) return;
    const user = getUserInfo();
    if (user?.userRole === "STAFF" && user.idCard) {
      prefillDone.current = true;
      setStaffCode(user.idCard);
      verifyStaffCode(user.idCard);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderLabel = (labelKey: string, required = true) => (
    <div className="flex items-center justify-between mb-1">
      <Label htmlFor={labelKey} className="text-sm font-medium text-gray-700">
        {translate(labelKey)}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {isVerified && (
        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            className={`w-full h-9 text-sm rounded-xl ${validationErrors.occupation ? "border-red-400" : ""}`}
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
      {showBranch && (
        <div className="space-y-1">
          {renderLabel("branch")}
          <div
            className={
              validationErrors.branch ? "border border-red-400 rounded-xl" : ""
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
      )}

      {/* Account Type */}
      {!isPublic && (
        <div className="space-y-1">
          {renderLabel("accountType")}
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
              className={`w-full h-9 text-sm rounded-xl ${validationErrors.accountProduct ? "border-red-400" : ""}`}
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
      )}

      {/* Relationship Manager / Staff ID */}
      <div className={`${isPublic ? "" : "md:col-span-2"} space-y-1`}>
        {renderLabel(isPublic ? "referralId" : "relationshipManager", false)}
        <div className="relative">
          <Input
            placeholder={translate(isPublic ? "referralIdPlaceholder" : "staffCode")}
            value={staffCode}
            onChange={(e) => {
              setStaffCode(e.target.value);
              if (!isPublic) validateField("staffCode", e.target.value);
              handleStaffCodeChange(e.target.value);
            }}
            className={`w-full h-9 text-sm rounded-xl pr-10 ${validationErrors.staffCode ? "border-red-400" : ""}`}
            disabled={isLoading || isValidating || isSubmitting}
          />
          {!isPublic && isVerifyingStaff && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {!isPublic && isVerifyingStaff && (
          <p className="text-xs text-muted-foreground">
            {translate("verifyingStaffCode")}
          </p>
        )}
        {!isPublic && validationErrors.staffCode && (
          <p className="text-xs text-red-500">{validationErrors.staffCode}</p>
        )}
      </div>
    </div>
  );
};


