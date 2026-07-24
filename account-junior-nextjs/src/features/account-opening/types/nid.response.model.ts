
export interface ResponseNID {
  idNumber: string;
  lastNameKh: string;
  firstNameKh: string;
  dob: string;
  gender: string;
  lastNameEn: string;
  firstNameEn: string;
  expiredDate: string;
  issuedDate: string;
  address: string;
  pob: string;
  MRZ1: string;
  MRZ2: string;
  MRZ3: string;
}

export interface ResponseValid {
  idNumber: string;
  score: number;
  incorrectFields: string[];
}

export interface ValidationResponse {
  error: number;
  message: string;
  data: ResponseValid;
}
  
