export interface GetAccountModel {
  status: string;
  message: string;
  data: AccountModel;
}

interface AccountModel {
  id: string;
  cif: string;
  legalId: string;
  legalFirstNameEn: string;
  legalLastNameEn: string;
  legalFirstNameKh: string;
  legalLastNameKh: string;
  legalDateOfBirth: string;
  legalGender: string;
  legalAddress: string;
  legalPlaceOfBirth: string;
  maritalStatus: string;
  nationality: string;
  companyName: string;
  occupation: string;
  phoneNumber: string;
  nidImageName: string;
  selfieImageName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
