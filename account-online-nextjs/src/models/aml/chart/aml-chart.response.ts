export type AllAmlStatisticsModel = AmlStatisticsModel[];

export interface AmlStatisticsModel {
  date: string;
  successCount: number;
  failureCount: number;
  amlCount: number;
}
