export interface AllSuccessAccountOnlineModel {
  content: SuccessAccountOnlineModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AllSuccessAccountOnlineExcelModel {
  content: SuccessAccountOnlineExcelModel[];
  countAll: number;
}

export interface SuccessAccountOnlineExcelModel {
  id: string;
  cif: string;
  khrAccount: string;
  usdAccount: string;
  mnemonic: string;
  legalId: string;
  branchCode: string;
  branchNameKh: string;
  nidImageName: string;
  selfieImageName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessAccountOnlineModel {
  id: string;
  cif: string;
  khrAccount: string;
  usdAccount: string;
  mnemonic: string;
  legalId: string;
  legalDocName: string;
  legalHolderName: string;
  legalFirstNameEn: string;
  legalLastNameEn: string;
  legalFirstNameKh: string;
  legalLastNameKh: string;
  legalDateOfBirth: string;
  legalGender: string;
  legalAddress: string;
  legalPlaceOfBirth: string;
  legalIssuedDate: string;
  legalExpiredDate: string;
  legalMRZ1: string;
  legalMRZ2: string;
  legalMRZ3: string;
  maritalStatus: string;
  nationality: string;
  companyName: string;
  occupation: string;
  averageIncome: string;
  referralId: string;
  releasedBy: string;
  branchCode: string;
  branchNameKh: string;
  customerProvinceCode: string;
  customerProvince: string;
  customerDistrictCode: string;
  customerDistrict: string;
  customerCommuneCode: string;
  customerCommune: string;
  customerVillageCode: string;
  customerVillage: string;
  customerPobProvinceCode: string;
  customerPobProvince: string;
  customerPobDistrictCode: string;
  customerPobDistrict: string;
  customerPobCommuneCode: string;
  customerPobCommune: string;
  customerPobVillageCode: string;
  customerPobVillage: string;
  phoneNumber: string;
  amlStatus: string;
  amlActionBy: number;
  amlActionName: string;
  amlActionRole: string;
  amlRemarks: string;
  amlScreeningResult: string;
  amlRiskLevel: string;
  amlActionTaken: string;
  amlTotalRulesScore: number;
  amlTrxnId: string;
  serviceName: string;
  amlRulesTriggered: string;
  nidImage: string;
  selfieImage: string;
  mbActivationCode: string;
  mbAppDownloadLink: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
