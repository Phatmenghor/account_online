import { AmlStatusEnum, Status, StatusReport } from "../display-list/enum/status";

export const STATUS_FILTER = [
  { value: "ALL", label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
  { value: Status.DELETE, label: "Delete" },
];

export const STATUS_USER_OPTIONS = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
  { value: Status.DELETE, label: "Delete" },
];

// To get the list of all enum values
export const AmlStatusList: AmlStatusEnum[] = [
  AmlStatusEnum.PENDING,
  AmlStatusEnum.APPROVE,
  AmlStatusEnum.REJECT,
];


// Report status
export const STATUS_REPORT_OPTIONS = [
  { value: StatusReport.AML, label: "AML" },
  { value: StatusReport.FAILURE, label: "Failure" },
  { value: StatusReport.SUCCESS, label: "Success" },
];