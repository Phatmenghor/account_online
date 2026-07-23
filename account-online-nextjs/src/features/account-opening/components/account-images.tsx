import React from "react";
import { Input } from "@/components/ui/input";
import { Camera, CreditCard, ImagePlus, UploadCloud } from "lucide-react";
import { useFormState } from "@/providers/form-state-context";

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
    placeholder,
    hasError,
    onChange,
  }: {
    id: string;
    label: string;
    hint: string;
    Icon: React.ElementType;
    preview?: string | null;
    placeholder?: string;
    hasError?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      </div>

      {/* Upload area — fixed h-40 on all screen sizes with clean subtle border */}
      <label
        htmlFor={id}
        className={[
          "group relative flex flex-col items-center justify-center h-40",
          "rounded-xl border border-dashed cursor-pointer overflow-hidden",
          "transition-all duration-200 select-none",
          hasError
            ? "border-red-300 bg-red-50/40 hover:border-red-400"
            : preview
            ? "border-primary/30 bg-gray-50 hover:border-primary"
            : "border-gray-200 bg-gray-50/60 hover:border-primary hover:bg-primary/5",
          disabled ? "opacity-60 cursor-not-allowed" : "active:scale-[0.995]",
        ].join(" ")}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1.5 text-white">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold bg-black/40 px-2 py-0.5 rounded-full">Change photo</span>
              </div>
            </div>
          </>
        ) : placeholder ? (
          <>
            <img src={placeholder} alt={label} className="w-full h-full object-contain p-3" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center rounded-xl">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                <UploadCloud className="w-3.5 h-3.5" />{hint}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-4 text-center pointer-events-none">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${hasError ? "bg-red-100" : "bg-gray-100 group-hover:bg-primary/10"}`}>
              <Icon className={`w-6 h-6 transition-colors ${hasError ? "text-red-400" : "text-gray-300 group-hover:text-primary/50"}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${hasError ? "text-red-500" : "text-gray-400"}`}>{hint}</p>
              <p className="text-xs text-gray-300 mt-0.5">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          id={id}
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={disabled}
        />
      </label>

      {hasError && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0 inline-block" />
          {translate(id === "nid-upload" ? "err_idImage" : "err_selfieImage")}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UploadCard
        id="nid-upload"
        label={translate("img_card")}
        hint="Upload ID card"
        Icon={CreditCard}
        preview={uploadedImage?.idImage || null}
        placeholder="/app/identity-card-4k.png"
        hasError={!!validationErrors.idImage}
        onChange={handleImageUpload}
      />
      <UploadCard
        id="selfie-upload"
        label={translate("img_selfie")}
        hint="Upload selfie photo"
        Icon={Camera}
        preview={selfiePreview}
        placeholder="/app/image_selfie_4K.png"
        hasError={!!validationErrors.selfieImage}
        onChange={handleSelfieUpload}
      />
    </div>
  );
};
