import { axiosClient, ACCOUNT_CREATION_TIMEOUT } from '@/utils/axios';

export interface JuniorCustomerPayload {
  has_nid: boolean;
  legal_id?: string;
  family_name?: string;
  given_name?: string;
  last_name_kh?: string;
  first_name_kh?: string;
  date_of_birth?: string;
  gender?: string;
  sms?: string;
  phone_number?: string;
  branch_code?: string;
  marital_status?: string;
  occupation?: string;
  address?: string;
  legal_address?: string;
  legal_iss_date?: string;
  legal_exp_date?: string;
  cust_province?: string;
  cust_district?: string;
  cust_commune?: string;
  cust_village?: string;
  cust_pob_province?: string;
  cust_pob_district?: string;
  cust_pob_commune?: string;
  cust_pob_village?: string;
  nid_image_name?: string;
  selfie_image_name?: string;
  guardian_legal_id?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  guardian_cif?: string;
  guardian_doc_type?: string;
  guardian_dob?: string;
  guardian_address?: string;
  guardian_info_json?: string;
  referral_id?: string;
  reference_doc_type?: string;
  reference_doc_name?: string;
  reference_doc_image?: string;
  selfie_image_base64?: string;
  product_account?: string;
  account_type?: string;
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

export interface CustomerInfo {
  legalId?: string;
  cif?: string;
  fullName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  [key: string]: any;
}

export async function processJuniorAccountOpening(payload: JuniorCustomerPayload): Promise<JuniorAccountResponse> {
  const response = await axiosClient.post('/api/v1/public/junior-open-account/process', payload, {
    timeout: ACCOUNT_CREATION_TIMEOUT,
  });
  return response.data.data;
}

export async function getCustomerInfoByCif(cif: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/junior-open-account/customer-info', { cif });
  return response.data.data;
}

export async function checkPhone(phone: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/otp/check-phone', { phone });
  return response.data.data;
}

export async function sendGuardianOtp(phone: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/junior-otp/send', { phone, type: 'GUARDIAN' });
  return response.data.data;
}

export async function verifyGuardianOtp(phone: string, otp: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/junior-otp/verify', { phone, otpCode: otp, code: otp });
  return response.data.data;
}

export async function sendJuniorOtp(phone: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/junior-otp/send', { phone, type: 'JUNIOR' });
  return response.data.data;
}

export async function verifyJuniorOtp(phone: string, otp: string): Promise<any> {
  const response = await axiosClient.post('/api/v1/public/junior-otp/verify', { phone, otpCode: otp, code: otp });
  return response.data.data;
}

export async function fetchBranches() {
  try {
    const response = await axiosClient.post('/api/v1/public/master-data/branch', { search: '' });
    return response.data.data ?? [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function fetchOccupations() {
  try {
    const response = await axiosClient.post('/api/v1/public/master-data/occupation/all', { search: '' });
    return response.data.data ?? [];
  } catch (error) {
    console.error('Error fetching occupations:', error);
    return [];
  }
}

export async function fetchMaritalStatuses() {
  try {
    const response = await axiosClient.post('/api/v1/public/master-data/marital/all', { search: '' });
    return response.data.data ?? [];
  } catch (error) {
    console.error('Error fetching marital statuses:', error);
    return [];
  }
}
