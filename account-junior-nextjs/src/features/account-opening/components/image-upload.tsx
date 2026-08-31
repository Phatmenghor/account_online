import React from "react";
import { useTranslations } from "next-intl";

interface ImageUploadProps {
    uploadedImage: { idImage: string } | null;
    selfiePreview: string | null;
    validationErrors: Record<string, string>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelfieUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    isValidating: boolean;
    isSubmitting: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    uploadedImage,
    selfiePreview,
    validationErrors,
    handleImageUpload,
    handleSelfieUpload,
    isLoading,
    isValidating,
    isSubmitting,
}) => {
    const translate = useTranslations("NIDPage");

    return (
        <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 lg:gap-14 gap-8">
            <div>
                <p className="text-base text-gray-600 mb-4 text-center">
                    {translate("img_card")}
                </p>
                <div className="relative">
                    <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                    <div
                        className={`relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${validationErrors.idImage ? "border-2 border-red-500" : ""
                            }`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            id="image-upload"
                            disabled={isLoading || isValidating || isSubmitting}
                        />
                        {uploadedImage?.idImage && uploadedImage.idImage.trim() !== "" ? (
                            <img
                                src={uploadedImage.idImage}
                                alt="ID Card"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                                <span className="text-sm font-medium">{translate("img_card")}</span>
                            </div>
                        )}
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
                    <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                    <div
                        className={`relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${validationErrors.selfieImage ? "border-2 border-red-500" : ""
                            }`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSelfieUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            id="image-upload-user"
                            disabled={isLoading || isValidating || isSubmitting}
                        />
                        {selfiePreview && selfiePreview.trim() !== "" ? (
                            <img
                                src={selfiePreview}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                                <span className="text-sm font-medium">{translate("img_selfie")}</span>
                            </div>
                        )}
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
