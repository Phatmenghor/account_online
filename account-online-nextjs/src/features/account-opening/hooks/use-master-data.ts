import { useState, useEffect } from "react";
import { useClientLocale } from "@/providers/local-provider";

import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { OccupationModel } from "@/features/master-data/types/occupation/occupation.response";
import { ReferenceModel } from "@/features/master-data/types/reference/reference.response";
import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { AccOnlineCategoryModel } from "@/features/master-data/types/acc-online-category/acc-online-category.response";
import {
  useLegalTypes,
  useMaritalStatuses,
  useOccupations,
  useReferenceBanks,
  useAccOnlineCategories,
} from "@/hooks/fetch-master";

export const useMasterData = () => {
  const { locale: currentLocale } = useClientLocale();

  // Use custom hooks for data fetching
  const { data: maritalStatuses, isLoading: isLoadingMarital } =
    useMaritalStatuses();
  const [selectedMaritalStatus, setSelectedMaritalStatus] =
    useState<MaritalModel | null>(null);

  const { data: occupations, isLoading: isLoadingOccupations } =
    useOccupations();
  const [selectedOccupation, setSelectedOccupation] =
    useState<OccupationModel | null>(null);

  const { data: referenceBanks, isLoading: isLoadingReferenceBanks } =
    useReferenceBanks();
  const [selectedReferenceBank, setSelectedReferenceBank] =
    useState<ReferenceModel | null>(null);

  const { data: legalTypes, isLoading: isLegalTypeLoading } = useLegalTypes();
  const [selectedLegalType, setSelectedLegalType] =
    useState<LegalTypeModel | null>(null);

  const { data: accOnlineCategories, isLoading: isLoadingCategories } = useAccOnlineCategories();
  const [selectedCategory, setSelectedCategory] = useState<AccOnlineCategoryModel | null>(null);

  useEffect(() => {
    if (maritalStatuses.length > 0 && !selectedMaritalStatus) {
      setSelectedMaritalStatus(maritalStatuses[0]);
    }
  }, [maritalStatuses, selectedMaritalStatus]);

  // Default to first item with lookupId === "6011" once list loads
  useEffect(() => {
    if (accOnlineCategories.length > 0 && !selectedCategory) {
      const defaultItem = accOnlineCategories.find((c) => c.lookupId === "6011");
      if (defaultItem) setSelectedCategory(defaultItem);
    }
  }, [accOnlineCategories]);

  // Helper function to get marital name based on locale
  const getMaritalName = (marital: MaritalModel) => {
    if (!marital) return "";
    if (currentLocale === "kh" && marital.nameKh && marital.nameKh.trim() !== "") {
      return marital.nameKh;
    }
    return marital.nameEn || marital.nameKh || "";
  };

  // Helper function to get occupation name based on locale
  const getOccupationName = (occupation: OccupationModel) => {
    if (!occupation) return "";
    if (currentLocale === "kh" && occupation.nameKh && occupation.nameKh.trim() !== "") {
      return occupation.nameKh;
    }
    return occupation.nameEn || occupation.nameKh || "";
  };

  // Helper function to get reference bank name based on locale
  const getReferenceName = (reference: ReferenceModel) => {
    if (!reference) return "";
    if (currentLocale === "kh" && reference.nameKh && reference.nameKh.trim() !== "") {
      return reference.nameKh;
    }
    return reference.nameEn || reference.nameKh || "";
  };

  const getLegalTypeName = (legalType: LegalTypeModel) => {
    if (!legalType) return "";
    if (currentLocale === "kh" && legalType.nameKh && legalType.nameKh.trim() !== "") {
      return legalType.nameKh;
    }
    return legalType.nameEn || legalType.nameKh || "";
  };

  // Helper function to get marital status string
  const getMaritalStatusString = (maritalId: string): string => {
    const marital = maritalStatuses.find((m) => m.id.toString() === maritalId);
    if (marital) {
      return marital.nameEn.toUpperCase().replace(/\s+/g, ".");
    }
    return "SINGLE";
  };

  const resetMasterData = () => {
    setSelectedMaritalStatus(null);
    setSelectedOccupation(null);
    setSelectedReferenceBank(null);
    setSelectedLegalType(null);
    setSelectedCategory(null);
  };

  return {
    maritalStatuses,
    isLoadingMarital,
    selectedMaritalStatus,
    setSelectedMaritalStatus,
    occupations,
    isLoadingOccupations,
    selectedOccupation,
    setSelectedOccupation,
    referenceBanks,
    isLoadingReferenceBanks,
    selectedReferenceBank,
    setSelectedReferenceBank,
    legalTypes,
    isLegalTypeLoading,
    selectedLegalType,
    setSelectedLegalType,
    accOnlineCategories,
    isLoadingCategories,
    selectedCategory,
    setSelectedCategory,
    getMaritalName,
    getOccupationName,
    getReferenceName,
    getLegalTypeName,
    getMaritalStatusString,
    resetMasterData,
  };
};


