import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectVillageState,
  selectVillageData,
  selectSelectedVillage,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectVillageContent,
  selectPagination,
} from "../selectors/village-selectors";

export const useVillageState = () => {
  const dispatch = useAppDispatch();
  const villageState = useAppSelector(selectVillageState);
  const villageData = useAppSelector(selectVillageData);
  const villageContent = useAppSelector(selectVillageContent);
  const selectedVillage = useAppSelector(selectSelectedVillage);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    villageState,
    villageData,
    villageContent,
    selectedVillage,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
