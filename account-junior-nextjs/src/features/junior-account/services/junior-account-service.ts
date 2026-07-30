import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  guardian_cif?: string;
  guardian_doc_type?: string;
  guardian_dob?: string;
  guardian_address?: string;
  guardian_info_json?: string;
  referral_id?: string;
  reference_doc_type?: string;
  reference_doc_name?: string;
  reference_doc_image?: string;
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

export interface PhoneCheckResult {
  hasAccount: boolean;
  cif?: string;
  mobile?: string;
}

export interface CustomerInfo {
  cif: string;
  mnemonic?: string;
  customerType?: string;
  customerStatus?: string;
  shortNames?: string[];
  names?: string[];
  streets?: string[];
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  legalId?: string;
  legalDocName?: string;
  legalHolderName?: string;
  legalIssAuth?: string;
  legalIssDate?: string;
  birthDate?: string;
  nationality?: string;
  residence?: string;
  language?: string;
  sector?: string;
  industry?: string;
  accountOfficer?: string;
  relManager?: String;
  referralBy?: string;
  phones?: string[];
  companyBook?: string;
  coCode?: string;
  internetBankingService?: string;
  mobileBankingService?: string;
  khShortName?: string;
}

export async function checkPhone(phone: string): Promise<PhoneCheckResult> {
  const response = await axios.post(`${BASE_URL}/api/v1/public/otp/check-phone`, { phone });
  return response.data?.data || response.data;
}

// Guardian / Parent Phone OTP (Requires phone to BE registered in MB Core)
export async function sendGuardianOtp(phone: string) {
  const response = await axios.post(`${BASE_URL}/api/v1/public/junior-otp/send`, { phone });
  return response.data?.data || response.data;
}

export async function verifyGuardianOtp(phone: string, otpCode: string) {
  const response = await axios.post(`${BASE_URL}/api/v1/public/junior-otp/verify`, { phone, otpCode });
  return response.data?.data || response.data;
}

// Junior / Child Phone OTP (Requires phone to NOT be registered in MB Core)
export async function sendJuniorOtp(phone: string) {
  const response = await axios.post(`${BASE_URL}/api/v1/public/otp/send`, { phone });
  return response.data?.data || response.data;
}

export async function verifyJuniorOtp(phone: string, otpCode: string) {
  const response = await axios.post(`${BASE_URL}/api/v1/public/otp/verify`, { phone, otpCode });
  return response.data?.data || response.data;
}

// Backwards compatibility aliases
export const sendOtp = sendGuardianOtp;
export const verifyOtp = verifyGuardianOtp;

export async function getCustomerInfoByCif(cif: string): Promise<CustomerInfo> {
  const response = await axios.post(`${BASE_URL}/api/v1/public/junior-open-account/customer-info`, { cif });
  return response.data?.data || response.data;
}

export async function processJuniorAccountOpening(payload: JuniorCustomerPayload): Promise<JuniorAccountResponse> {
  const response = await axios.post(`${BASE_URL}/api/v1/public/junior-open-account/process`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data?.data || response.data;
}

export async function fetchBranches() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/public/branches`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function fetchOccupations() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/public/master-data/occupation/all`, {});
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching occupations:', error);
    try {
      const altRes = await axios.get(`${BASE_URL}/api/v1/public/occupations`);
      return altRes.data?.data || altRes.data || [];
    } catch (ignored) {
      return [];
    }
  }
}

export async function fetchMaritalStatuses() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/public/master-data/marital-status/all`, {});
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching marital statuses:', error);
    try {
      const altRes = await axios.get(`${BASE_URL}/api/v1/public/marital-statuses`);
      return altRes.data?.data || altRes.data || [];
    } catch (ignored) {
      return [];
    }
  }
}
