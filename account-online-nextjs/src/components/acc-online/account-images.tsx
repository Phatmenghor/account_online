import React from "react";
import { Input } from "../ui/input";
import { Camera, CreditCard, ImagePlus } from "lucide-react";
import { useFormState } from "@/contexts/form-state-context";

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
  const { validationErrors, isLoading, isValidating, isSubmitting, translate } = useFormState();
  const disabled = isLoading || isValidating || isSubmitting;

  const UploadCard = ({
    id,
    label,
    hint,
    Icon,
    preview,
    hasError,
    onChange,
  }: {
    id: string;
    label: string;
    hint: string;
    Icon: React.ElementType;
    preview?: string | null;
    hasError?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      </div>

      <label
        htmlFor={id}
        className={[
          "group relative flex flex-col items-center justify-center aspect-[16/10]",
          "rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden",
          "transition-all duration-200 select-none",
          hasError
            ? "border-red-300 bg-red-50/50"
            : preview
            ? "border-primary/30 bg-gray-50"
            : "border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/5",
          disabled ? "opacity-60 cursor-not-allowed" : "active:scale-[0.99]",
        ].join(" ")}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1 text-white">
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs font-medium">Change</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center pointer-events-none">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${hasError ? "bg-red-100" : "bg-gray-100 group-hover:bg-primary/10"}`}>
              <Icon className={`w-7 h-7 transition-colors ${hasError ? "text-red-400" : "text-gray-300 group-hover:text-primary/60"}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${hasError ? "text-red-500" : "text-gray-400"}`}>{hint}</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, HEIC</p>
            </div>
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          id={id}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={disabled}
        />
      </label>

      {hasError && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0 inline-block" />
          {translate(id === "nid-upload" ? "err_idImage" : "err_selfieImage")}
        </p>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Document Upload
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <UploadCard
          id="nid-upload"
          label={translate("img_card")}
          hint="Tap to upload ID card"
          Icon={CreditCard}
          preview={uploadedImage?.idImage || null}
          hasError={!!validationErrors.idImage}
          onChange={handleImageUpload}
        />
        <UploadCard
          id="selfie-upload"
          label={translate("img_selfie")}
          hint="Tap to upload selfie photo"
          Icon={Camera}
          preview={selfiePreview}
          hasError={!!validationErrors.selfieImage}
          onChange={handleSelfieUpload}
        />
      </div>
    </div>
  );
};
