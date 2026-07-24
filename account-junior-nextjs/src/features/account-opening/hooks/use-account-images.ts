import { useState } from "react";
import { RequestIdImage } from "@/features/account-opening/types/nid.request.model";
import { ResponseNID } from "@/features/account-opening/types/nid.response.model";
import { extractNIDService } from "@/features/account-opening/services/nid.service";
import {
  formatDateForInput,
  normalizeGender,
} from "@/utils/format/BranchFormat";
import { AppToast } from "@/components/shared/toast/app-toast";
import { NIDFormData } from "@/features/account-opening/components/form-field/form-validate-error";
import { Image } from "@/features/account-opening/types/address/open-acc-address.request.model";

interface UseAccountImagesProps {
  setFormData: (data: ResponseNID) => void;
  validateField: (fieldName: keyof NIDFormData, value: any) => void;
  translate: (key: string) => string;
}

interface LoadingImageState {
  isLoading: boolean;
  title: string;
  message: string;
}

interface OcrErrorData {
  title: string;
  message: string;
  description: string;
}

export const useAccountImages = ({
  setFormData,
  validateField,
  translate,
}: UseAccountImagesProps) => {
  const [imageData, setImageData] = useState<RequestIdImage | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [loadingImageState, setLoadingImageState] = useState<LoadingImageState>({
    isLoading: false,
    title: "",
    message: "",
  });

  const [ocrErrorData, setOcrErrorData] = useState<OcrErrorData | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleExtractNID = async (imageRequestData?: RequestIdImage) => {
    const dataToProcess = imageRequestData || imageData;

    if (!dataToProcess) {
      AppToast({
        type: "error",
        message: translate("ocr_extract_fail_title"),
        description: translate("ocr_extract_fail_desc"),
      });
      return;
    }

    try {
      const response = await extractNIDService(dataToProcess);

      const normalizedData = {
        ...response,
        dob: formatDateForInput(response.dob),
        gender: normalizeGender(response.gender),
      };

      console.log("Normalized data:", normalizedData);
      setFormData(normalizedData);

      // Validate all extracted fields to clear any validation errors
      validateField("lastNameKh", normalizedData.lastNameKh);
      validateField("firstNameKh", normalizedData.firstNameKh);
      validateField("lastNameEn", normalizedData.lastNameEn);
      validateField("firstNameEn", normalizedData.firstNameEn);
      validateField("dob", normalizedData.dob);
      validateField("gender", normalizedData.gender);
      validateField("idNumber", normalizedData.idNumber);
      validateField("address", normalizedData.address);
      validateField("pob", normalizedData.pob);

      AppToast({
        type: "success",
        message: translate("nid_extract_success"),
        description: translate("nid_extract_success_desc"),
      });
    } catch (error: any) {
      console.error("OCR extraction error:", error.response?.data);

      // Show error modal with translated message
      setOcrErrorData({
        title: translate("ocr_extract_fail_title"),
        message: "",
        description: translate("ocr_extract_fail_desc"),
      });
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoadingImageState({
        isLoading: true,
        title: translate("extracting_data") || "Extracting Data",
        message:
          translate("extracting") || "Extracting information from ID card...",
      });

      try {
        const base64WithPrefix = await convertToBase64(file);
        const base64ForService = base64WithPrefix.split(",")[1];

        const imageRequestData: RequestIdImage = {
          idImage: base64ForService,
        };

        setImageData(imageRequestData);
        setUploadedImage({
          idImage: base64WithPrefix,
        });
        setImagePreview(base64WithPrefix);

        // Validate image field
        validateField("idImage", base64WithPrefix);

        await handleExtractNID(imageRequestData);
      } catch (error) {
        console.error("Error converting image to base64", error);
        AppToast({
          type: "error",
          message: translate("img_processing_error"),
          description: translate("img_processing_error_desc"),
        });
      } finally {
        setLoadingImageState({
          isLoading: false,
          title: "",
          message: "",
        });
      }
    }
  };

  const handleSelfieUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64WithPrefix = await convertToBase64(file);
        const base64ForService = base64WithPrefix.split(",")[1];
        setSelfieImage(base64ForService);
        setSelfiePreview(base64WithPrefix);

        // Validate selfie field
        validateField("selfieImage", base64WithPrefix);

        AppToast({
          type: "success",
          message: translate("selfie_upload_success"),
          description: translate("selfie_upload_success_desc"),
        });
      } catch (error) {
        console.error("Error uploading selfie", error);
        AppToast({
          type: "error",
          message: translate("selfie_upload_fail"),
          description: translate("selfie_upload_fail_desc"),
        });
      }
    }
  };

  const clearImages = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setImageData(null);
    setSelfieImage(null);
    setSelfiePreview(null);

    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    const selfieInput = document.getElementById(
      "image-upload-user"
    ) as HTMLInputElement;
    if (selfieInput) {
      selfieInput.value = "";
    }
  };

  return {
    imageData,
    setImageData,
    imagePreview,
    setImagePreview,
    uploadedImage,
    setUploadedImage,
    selfieImage,
    setSelfieImage,
    selfiePreview,
    setSelfiePreview,
    handleImageUpload,
    handleSelfieUpload,
    loadingImageState,
    setLoadingImageState,
    clearImages,
    ocrErrorData,
    clearOcrError: () => setOcrErrorData(null),
  };
};


