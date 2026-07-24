import { axiosClient } from '@/utils/axios';

export interface JuniorCustomerPayload {
  has_nid: boolean;
  legal_id?: string;
  family_name?: string;
  given_name?: string;
  last_name_kh?: string;
  first_name_kh?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  branch_code?: string;
  marital_status?: string;
  occupation?: string;
  legal_address?: string;
  legal_iss_date?: string;
  legal_exp_date?: string;
  customer_current_province?: string;
  customer_current_district?: string;
  customer_current_commune?: string;
  customer_current_village?: string;
  customer_pob_province?: string;
  customer_pob_district?: string;
  customer_pob_commune?: string;
  customer_pob_village?: string;
  nid_image_name?: string;
  selfie_image_name?: string;
  guardian_legal_id?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
}

export interface JuniorAccountResponse {
  legalId: string;
  cif: string;
  mnemonic: string;
  khrAccount: string;
  usdAccount: string;
  mbActivationCode?: string;
  status: string;
  message: string;
}

export async function processJuniorAccountOpening(payload: JuniorCustomerPayload): Promise<JuniorAccountResponse> {
  const response = await axiosClient.post('/api/v1/public/junior-open-account/process', payload);
  return response.data?.data || response.data;
}

export async function fetchBranches() {
  try {
    const response = await axiosClient.get('/api/v1/public/branches');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function fetchOccupations() {
  try {
    const response = await axiosClient.get('/api/v1/public/occupations');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching occupations:', error);
    return [];
  }
}

export async function sendJuniorOtp(phone: string) {
  const response = await axiosClient.post('/api/v1/junior-otp/send', { phone });
  return response.data;
}

export async function verifyJuniorOtp(phone: string, otpCode: string) {
  const response = await axiosClient.post('/api/v1/junior-otp/verify', { phone, otpCode });
  return response.data;
}
