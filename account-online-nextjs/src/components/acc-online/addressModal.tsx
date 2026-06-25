"use client";
import { MapPin, X, Loader2, Home, Navigation } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useClientLocale } from "@/context/provider/local-provider";
import {
  useCommunes,
  useDistricts,
  useProvinces,
  useVillages,
} from "@/hooks/fetch-address";
import type {
  CommuneModel,
  DistrictModel,
  ProvinceModel,
  VillageModel,
} from "@/models/address/address.response";
import { ComboboxSelectProvince } from "../shared/combo-box/combobox-province";
import { ComboboxSelectDistrict } from "../shared/combo-box/combobox-district";
import { ComboboxSelectCommune } from "../shared/combo-box/combobox-commune";
import { ComboboxSelectVillage } from "../shared/combo-box/combobox-village";
import { getAddressSelectService } from "@/services/address/selectAddress.service";
import { AddressSelectReq } from "@/models/address/select-address/selectAddress.request";
import { PosSelectReq } from "@/models/address/select-pos/selectPos.request";
import { getPosSelectService } from "@/services/address/selectPos.service";
import { useTranslations } from "next-intl";
import {
  LocationFormData,
  LocationFormSchema,
} from "./form-field/form-validate-error";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";
import { motion, AnimatePresence } from "framer-motion";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LocationSubmitData) => void;
  formData: LocationSubmitData;
  setFormData: React.Dispatch<React.SetStateAction<LocationSubmitData>>;
  addressFromForm?: string;
  placeOfBirthFromForm?: string;
}

const LocationModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  addressFromForm,
  placeOfBirthFromForm,
}: LocationModalProps) => {
  const { locale: currentLocale } = useClientLocale();
  const translate = useTranslations("address");

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // First section (Current Address)
  const [selectedProvince, setSelectedProvince] =
    useState<ProvinceModel | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictModel | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<CommuneModel | null>(
    null,
  );
  const [selectedVillage, setSelectedVillage] = useState<VillageModel | null>(
    null,
  );

  // Second section (Place of Birth)
  const [pobProvince, setPobProvince] = useState<ProvinceModel | null>(null);
  const [pobDistrict, setPobDistrict] = useState<DistrictModel | null>(null);
  const [pobCommune, setPobCommune] = useState<CommuneModel | null>(null);
  const [pobVillage, setPobVillage] = useState<VillageModel | null>(null);

  // Loading states for auto-fill
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingPob, setIsLoadingPob] = useState(false);

  // Fetch data for FIRST SECTION (Current Address)
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(
    selectedProvince?.provinceCode || "",
  );
  const { data: communes, isLoading: isLoadingCommunes } = useCommunes(
    selectedDistrict?.districtCode || "",
  );
  const { data: villages, isLoading: isLoadingVillages } = useVillages(
    selectedCommune?.communeCode || "",
  );

  // Fetch data for SECOND SECTION (Place of Birth)
  const { data: pobDistricts, isLoading: isLoadingPobDistricts } = useDistricts(
    pobProvince?.provinceCode || "",
  );
  const { data: pobCommunes, isLoading: isLoadingPobCommunes } = useCommunes(
    pobDistrict?.districtCode || "",
  );
  const { data: pobVillages, isLoading: isLoadingPobVillages } = useVillages(
    pobCommune?.communeCode || "",
  );

  // Reset state when modal opens + lock body scroll so Radix Popover
  // scroll-lock doesn't cause a scrollbar flash on the page
  useEffect(() => {
    if (isOpen) {
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedCommune(null);
      setSelectedVillage(null);
      setPobProvince(null);
      setPobDistrict(null);
      setPobCommune(null);
      setPobVillage(null);
      setValidationErrors({});

      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Validate a single field
  const validateField = (
    section: "currentAddress" | "placeOfBirth",
    field: string,
    value: string,
  ) => {
    const fieldPath = `${section}.${field}`;

    try {
      const fieldSchema =
        LocationFormSchema.shape[section].shape[
          field as keyof typeof LocationFormSchema.shape.currentAddress.shape
        ];
      fieldSchema.parse(value);

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    } catch (error: any) {
      if (error.issues?.[0]) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldPath]: error.issues[0].message,
        }));
      }
    }
  };

  // Validate entire form before submission
  const validateFullForm = (): boolean => {
    const locationData: LocationFormData = {
      currentAddress: {
        province: selectedProvince?.provinceCode || "",
        district: selectedDistrict?.districtCode || "",
        commune: selectedCommune?.communeCode || "",
        village: selectedVillage?.villageCode || "",
      },
      placeOfBirth: {
        province: pobProvince?.provinceCode || "",
        district: pobDistrict?.districtCode || "",
        commune: pobCommune?.communeCode || "",
        village: pobVillage?.villageCode || "",
      },
    };

    const result = LocationFormSchema.safeParse(locationData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Auto-fill current address when modal opens
  useEffect(() => {
    const fetchAddressData = async () => {
      if (isOpen && addressFromForm && addressFromForm.trim() !== "") {
        setIsLoadingAddress(true);
        try {
          const request: AddressSelectReq = {
            address: addressFromForm,
          };

          const addressData = await getAddressSelectService(request);

          if (addressData) {
            if (addressData.province) {
              setSelectedProvince(addressData.province);
              setFormData((prev) => ({
                ...prev,
                currentAddress: {
                  ...prev.currentAddress,
                  province: addressData.province,
                },
              }));
              validateField(
                "currentAddress",
                "province",
                addressData.province.provinceCode,
              );
            }

            if (addressData.district) {
              setSelectedDistrict(addressData.district);
              setFormData((prev) => ({
                ...prev,
                currentAddress: {
                  ...prev.currentAddress,
                  district: addressData.district,
                },
              }));
              validateField(
                "currentAddress",
                "district",
                addressData.district.districtCode,
              );
            }

            if (addressData.commune) {
              setSelectedCommune(addressData.commune);
              setFormData((prev) => ({
                ...prev,
                currentAddress: {
                  ...prev.currentAddress,
                  commune: addressData.commune,
                },
              }));
              validateField(
                "currentAddress",
                "commune",
                addressData.commune.communeCode,
              );
            }

            if (addressData.village) {
              setSelectedVillage(addressData.village);
              setFormData((prev) => ({
                ...prev,
                currentAddress: {
                  ...prev.currentAddress,
                  village: addressData.village,
                },
              }));
              validateField(
                "currentAddress",
                "village",
                addressData.village.villageCode,
              );
            }
          }
        } catch (error: any) {
          console.error("Error fetching address data:", error);
        } finally {
          setIsLoadingAddress(false);
        }
      }
    };

    fetchAddressData();
  }, [isOpen, addressFromForm]);

  // Auto-fill place of birth when modal opens
  useEffect(() => {
    const fetchPobData = async () => {
      if (
        isOpen &&
        placeOfBirthFromForm &&
        placeOfBirthFromForm.trim() !== ""
      ) {
        setIsLoadingPob(true);
        try {
          const request: PosSelectReq = {
            address: placeOfBirthFromForm,
          };

          const pobData = await getPosSelectService(request);

          if (pobData) {
            if (pobData.province) {
              setPobProvince(pobData.province);
              validateField(
                "placeOfBirth",
                "province",
                pobData.province.provinceCode,
              );
            }

            if (pobData.district) {
              setPobDistrict(pobData.district);
              validateField(
                "placeOfBirth",
                "district",
                pobData.district.districtCode,
              );
            }

            if (pobData.commune) {
              setPobCommune(pobData.commune);
              validateField(
                "placeOfBirth",
                "commune",
                pobData.commune.communeCode,
              );
            }

            if (pobData.village) {
              setPobVillage(pobData.village);
              validateField(
                "placeOfBirth",
                "village",
                pobData.village.villageCode,
              );
            }
          }
        } catch (error: any) {
          console.error("Error fetching place of birth data:", error);
        } finally {
          setIsLoadingPob(false);
        }
      }
    };

    fetchPobData();
  }, [isOpen, placeOfBirthFromForm]);

  // Handlers for cascading dropdowns (FIRST SECTION: Current Address)
  const handleProvinceChange = (province: ProvinceModel | null) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setSelectedVillage(null);

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        province: province,
        district: null,
        commune: null,
        village: null,
      },
    }));

    if (province) {
      validateField("currentAddress", "province", province.provinceCode);
    }
  };

  const handleDistrictChange = (district: DistrictModel | null) => {
    setSelectedDistrict(district);
    setSelectedCommune(null);
    setSelectedVillage(null);

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        district: district,
        commune: null,
        village: null,
      },
    }));

    if (district) {
      validateField("currentAddress", "district", district.districtCode);
    }
  };

  const handleCommuneChange = (commune: CommuneModel | null) => {
    setSelectedCommune(commune);
    setSelectedVillage(null);

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        commune: commune,
        village: null,
      },
    }));

    if (commune) {
      validateField("currentAddress", "commune", commune.communeCode);
    }
  };

  const handleVillageChange = (village: VillageModel | null) => {
    setSelectedVillage(village);

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        village: village,
      },
    }));

    if (village) {
      validateField("currentAddress", "village", village.villageCode);
    }
  };

  // Handlers for cascading dropdowns (SECOND SECTION: Place of Birth)
  const handlePobProvinceChange = (province: ProvinceModel | null) => {
    setPobProvince(province);
    setPobDistrict(null);
    setPobCommune(null);
    setPobVillage(null);

    if (province) {
      validateField("placeOfBirth", "province", province.provinceCode);
    }
  };

  const handlePobDistrictChange = (district: DistrictModel | null) => {
    setPobDistrict(district);
    setPobCommune(null);
    setPobVillage(null);

    if (district) {
      validateField("placeOfBirth", "district", district.districtCode);
    }
  };

  const handlePobCommuneChange = (commune: CommuneModel | null) => {
    setPobCommune(commune);
    setPobVillage(null);

    if (commune) {
      validateField("placeOfBirth", "commune", commune.communeCode);
    }
  };

  const handlePobVillageChange = (village: VillageModel | null) => {
    setPobVillage(village);

    if (village) {
      validateField("placeOfBirth", "village", village.villageCode);
    }
  };

  // Handle submit with validation
  const handleSubmit = () => {
    if (!validateFullForm()) {
      return;
    }

    const submitData: LocationSubmitData = {
      currentAddress: {
        province: selectedProvince,
        district: selectedDistrict,
        commune: selectedCommune,
        village: selectedVillage,
      },
      placeOfBirth: {
        province: pobProvince,
        district: pobDistrict,
        commune: pobCommune,
        village: pobVillage,
      },
    };

    onSubmit(submitData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-[900px] lg:max-w-[1050px] rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Primary top accent bar */}
            <div className="h-1.5 w-full bg-primary flex-shrink-0 rounded-t-2xl sm:rounded-t-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin
                    style={{ width: 20, height: 20 }}
                    className="text-primary-foreground"
                  />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                    {translate("locationInfo")}
                  </h2>
                  <p className="text-sm text-gray-400 hidden sm:block">
                    {translate("selectAddress")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-fill loading bar */}
            <AnimatePresence>
              {(isLoadingAddress || isLoadingPob) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-primary/5 border-b border-primary/20 flex-shrink-0"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-primary font-medium">
                    {translate("loading")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5">
              {/* === SECTION 1: Current Address === */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-700">
                    <span className="text-red-500 mr-1">*</span>
                    {translate("selectAddress")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Province */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("province")}
                      {isLoadingProvinces && (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      )}
                    </label>
                    <div
                      className={
                        validationErrors["currentAddress.province"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectProvince
                        dataSelect={selectedProvince}
                        onChangeSelected={handleProvinceChange}
                        disabled={isLoadingAddress}
                        provinces={provinces}
                        isLoading={isLoadingProvinces}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["currentAddress.province"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_province")}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {currentLocale === "kh" ? "ស្រុក/ខណ្ឌ" : "District"}
                      {isLoadingDistricts && (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      )}
                    </label>
                    <div
                      className={
                        validationErrors["currentAddress.district"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectDistrict
                        dataSelect={selectedDistrict}
                        onChangeSelected={handleDistrictChange}
                        disabled={isLoadingAddress}
                        districts={districts}
                        isLoading={isLoadingDistricts}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["currentAddress.district"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_district")}
                      </p>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("commune")}
                      {isLoadingCommunes && (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      )}
                    </label>
                    <div
                      className={
                        validationErrors["currentAddress.commune"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectCommune
                        dataSelect={selectedCommune}
                        onChangeSelected={handleCommuneChange}
                        disabled={isLoadingAddress}
                        communes={communes}
                        isLoading={isLoadingCommunes}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["currentAddress.commune"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_commune")}
                      </p>
                    )}
                  </div>

                  {/* Village */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("village")}
                      {isLoadingVillages && (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      )}
                    </label>
                    <div
                      className={
                        validationErrors["currentAddress.village"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectVillage
                        dataSelect={selectedVillage}
                        onChangeSelected={handleVillageChange}
                        disabled={isLoadingAddress}
                        villages={villages}
                        isLoading={isLoadingVillages}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["currentAddress.village"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_village")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* === SECTION 2: Place of Birth === */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-700">
                    <span className="text-red-500 mr-1">*</span>
                    {translate("selectPlaceOfBirth")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Province */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("province")}
                    </label>
                    <div
                      className={
                        validationErrors["placeOfBirth.province"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectProvince
                        dataSelect={pobProvince}
                        onChangeSelected={handlePobProvinceChange}
                        disabled={isLoadingPob}
                        provinces={provinces}
                        isLoading={isLoadingProvinces}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["placeOfBirth.province"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_province")}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("district")}
                    </label>
                    <div
                      className={
                        validationErrors["placeOfBirth.district"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectDistrict
                        dataSelect={pobDistrict}
                        onChangeSelected={handlePobDistrictChange}
                        disabled={isLoadingPob}
                        districts={pobDistricts}
                        isLoading={isLoadingPobDistricts}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["placeOfBirth.district"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_district")}
                      </p>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("commune")}
                    </label>
                    <div
                      className={
                        validationErrors["placeOfBirth.commune"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectCommune
                        dataSelect={pobCommune}
                        onChangeSelected={handlePobCommuneChange}
                        disabled={isLoadingPob}
                        communes={pobCommunes}
                        isLoading={isLoadingPobCommunes}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["placeOfBirth.commune"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_commune")}
                      </p>
                    )}
                  </div>

                  {/* Village */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-600 mb-1.5">
                      <span className="text-red-400">*</span>
                      {translate("village")}
                    </label>
                    <div
                      className={
                        validationErrors["placeOfBirth.village"]
                          ? "rounded border border-red-400"
                          : ""
                      }
                    >
                      <ComboboxSelectVillage
                        dataSelect={pobVillage}
                        onChangeSelected={handlePobVillageChange}
                        disabled={isLoadingPob}
                        villages={pobVillages}
                        isLoading={isLoadingPobVillages}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors["placeOfBirth.village"] && (
                      <p className="text-sm text-red-500 mt-1">
                        {translate("err_village")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 px-4 sm:px-6 py-4 bg-gray-50/80 border-t border-gray-100 rounded-b-none sm:rounded-b-2xl flex-shrink-0">
              <Button
                onClick={onClose}
                className="w-full sm:w-auto h-auto min-h-12 py-3 px-6 text-base bg-white border-2 border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <span className="whitespace-normal leading-tight text-center">{translate("close")}</span>
              </Button>
              <Button
                onClick={handleSubmit}
                className="w-full sm:w-auto h-auto min-h-12 py-3 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all shadow-sm"
              >
                <span className="whitespace-normal leading-tight text-center">{translate("submit")}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;
