"use client"
import { z } from "zod";

// Schema for NID Form Validation
export const NIDFormSchema = z.object({
  // Images
  idImage: z.string().min(1, "ID card image is required"),
  selfieImage: z.string().min(1, "Selfie image is required"),
  
  // Personal Information (Khmer)
  lastNameKh: z.string().min(1, "First name (Khmer) is required"),
  firstNameKh: z.string().min(1, "Last name (Khmer) is required"),
  
  // Personal Information (English)
  lastNameEn: z.string().min(1, "Family name (English) is required"),
  firstNameEn: z.string().min(1, "Given name (English) is required"),
  
  // Date and Identity
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  idNumber: z.string().min(1, "Legal ID is required"),
  
  // Address Information
  address: z.string().min(1, "Address is required"),
  pob: z.string().min(1, "Place of birth is required"),
  
  // Additional Information
  maritalStatus: z.string().min(1, "Marital status is required"),
  occupation: z.string().min(1, "Occupation is required"),
  branch: z.string().min(1, "Branch is required"),
  legalType: z.string().optional(),
  accountProduct: z.string().optional(),
  referenceBank: z.string().optional(),
  staffCode: z.string().optional(),
  
  // Phone and OTP
  phoneNumber: z.string()
    .min(9, "Phone number must be at least 9 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  isPhoneVerified: z.boolean().refine((val) => val === true, {
    message: "Phone number must be verified. And then input otp 6 digit",
  }),
});

export type NIDFormData = z.infer<typeof NIDFormSchema>;

// Public self-service opening: no relation manager (staff ID) required, and
// account product/category is hidden from the UI (auto-set to 6011 server
// side), so it must never be user-facing-validated as required either.
export const PublicNIDFormSchema = NIDFormSchema.extend({
  staffCode: z.string().optional(),
  accountProduct: z.string().optional(),
});

// Partial schema for verification step (before full submission)
export const NIDVerificationSchema = NIDFormSchema.pick({
  idImage: true,
  selfieImage: true,
  lastNameKh: true,
  firstNameKh: true,
  lastNameEn: true,
  firstNameEn: true,
  dob: true,
  gender: true,
  idNumber: true,
  address: true,
  pob: true,
});

export type NIDVerificationData = z.infer<typeof NIDVerificationSchema>;


// Schema for Location/Address Form Validation
export const LocationFormSchema = z.object({
  // Current Address
  currentAddress: z.object({
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
    commune: z.string().min(1, "Commune is required"),
    village: z.string().min(1, "Village is required"),
  }),
  
  // Place of Birth
  placeOfBirth: z.object({
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
    commune: z.string().min(1, "Commune is required"),
    village: z.string().min(1, "Village is required"),
  }),
});

export type LocationFormData = z.infer<typeof LocationFormSchema>;