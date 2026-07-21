export interface ApiResponse<T> {
  error: string;
  message: string;
  data?: T;
}

export interface RequestIdImage {
  idImage: string;
}

export interface RequestValidModel {
  applicationName: string;
  idNumber: string;
  lastNameKh: string;
  firstNameKh: string;
  lastNameEn: string;
  firstNameEn: string;
  dob: string;
  gender: string;
  expiredDate: string;
  issuedDate: string;
  address: string;
  pob: string;
  MRZ1: string;
  MRZ2: string;

  MRZ3: string;
  phoneNumber?: string;
}
