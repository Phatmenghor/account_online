export interface TopUserOpenAccount {
  userId: number;
  fullName: string;
  position: string;
  profileUrl: string;
  branch: string | null;
  count: number;
}

export interface TopAmlActionUser {
  userId: number;
  fullName: string;
  position: string;
  profileUrl: string;
  branch: string | null;
  approveCount: number;
  rejectCount: number;
  totalCount: number;
}
