export interface AllHistoryModel {
  content: HistoryModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface HistoryModel {
  id: number;
  customerInfo: CustomerInfo;
  status: string;
  screeningResult: string;
  riskLevel: string;
  actionTaken: string;
  rulesTriggered: string;
  serviceName: string;
  totalRulesScore: number;
  trxnID: string;
  approvedBy: ApprovedBy;
  rejectedBy: RejectedBy;
  createdAt: string;
  updatedAt: string;
  currentAddressName: string;
  currentAddressCode: string;
  placeOfBirthName: string;
  placeOfBirthCode: string;
  branch?: string;
  maritalStatus: string;
  occupationCode: string;
  occupationStatus: string;
  remarks: string;
  nidImageName?: string;
  selfieImageName?: string;
}

export interface CustomerInfo {
  legalId: string;
  familyName: string;
  givenName: string;
  firstNameKh: string;
  lastNameKh: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  legalAddress: string;
  phoneNumber: string;
  issuedDate: string;
  expiredDate: string;
}

export interface ApprovedBy {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  userPermission: string;
  createdAt: string;
  updatedAt: string;
}

export interface RejectedBy {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  userPermission: string;
  createdAt: string;
  updatedAt: string;
}
