import React from "react";
import { useFormState } from "@/contexts/form-state-context";
import { Input } from "../ui/input";

interface AccountImagesProps {
  uploadedImage: any;
  selfiePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelfieUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AccountImages: React.FC<AccountImagesProps> = ({
  uploadedImage,
  selfiePreview,
  handleImageUpload,
  handleSelfieUpload,
}) => {
  // Get values from FormStateContext
  const { validationErrors, isLoading, isValidating, isSubmitting, translate } =
    useFormState();
  return (
    <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 lg:gap-14 gap-8">
      <div>
        <p className="text-base text-gray-600 mb-4 text-center">
          {translate("img_card")}
        </p>
        <div className="relative">
          <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-orange-400"></div>
          <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-orange-400"></div>
          <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-orange-400"></div>
          <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-orange-400"></div>
          <div
            className={`relative lg:w-96 w-80 h-60 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
              validationErrors.idImage ? "border-2 border-red-500" : ""
            }`}
          >
            <Input
              type="file"
              accept="image/*"
              name="idImage"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="image-upload"
              disabled={isLoading || isValidating || isSubmitting}
            />
            <img
              src={
                uploadedImage?.idImage ||
                "/app/identity-card-4k.png?height=192&width=320"
              }
              alt="ID Card"
              className="w-full h-full"
            />
          </div>
        </div>
        {validationErrors.idImage && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {translate("err_idImage")}
          </p>
        )}
      </div>

      <div>
        <p className="text-base text-gray-600 mb-4 text-center">
          {translate("img_selfie")}
        </p>
        <div className="relative">
          <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-orange-400"></div>
          <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-orange-400"></div>
          <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-orange-400"></div>
          <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-orange-400"></div>
          <div
            className={`relative lg:w-96 w-80 h-60 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
              validationErrors.selfieImage ? "border-2 border-red-500" : ""
            }`}
          >
            <Input
              type="file"
              accept="image/*"
              name="selfieImage"
              onChange={handleSelfieUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="image-upload-user"
              disabled={isLoading || isValidating || isSubmitting}
            />
            <img
              src={
                selfiePreview || "/app/image_selfie_4K.png?height=192&width=320"
              }
              alt="Selfie"
              className="w-full h-full"
            />
          </div>
        </div>
        {validationErrors.selfieImage && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {translate("err_selfieImage")}
          </p>
        )}
      </div>
    </div>
  );
};
