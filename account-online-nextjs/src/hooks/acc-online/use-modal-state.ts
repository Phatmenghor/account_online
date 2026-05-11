import { useState } from "react";
import { ValidationResponse } from "@/models/open-acc-online/nid.response.model";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";

export const useModalState = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);

  const [showValidationErrorModal, setShowValidationErrorModal] =
    useState(false);
  const [validationErrorData, setValidationErrorData] = useState({
    title: "",
    message: "",
    description: "",
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Location data state - Store complete objects
  const [locationData, setLocationData] = useState<LocationSubmitData>({
    currentAddress: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
    placeOfBirth: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
  });

  // Separate state for LocationModal (it expects LocationSubmitData type)
  const [locationFormData, setLocationFormData] = useState<LocationSubmitData>({
    currentAddress: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
    placeOfBirth: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
  });

  const clearModalState = () => {
    setValidationResult(null);
    setLocationData({
      currentAddress: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
      placeOfBirth: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
    });
    setLocationFormData({
      currentAddress: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
      placeOfBirth: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
    });
  };

  return {
    showLocationModal,
    setShowLocationModal,
    showErrorModal,
    setShowErrorModal,
    validationResult,
    setValidationResult,
    showValidationErrorModal,
    setShowValidationErrorModal,
    validationErrorData,
    setValidationErrorData,
    showConfirmationModal,
    setShowConfirmationModal,
    locationData,
    setLocationData,
    locationFormData,
    setLocationFormData,
    clearModalState,
  };
};
