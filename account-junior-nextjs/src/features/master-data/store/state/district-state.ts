import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectDistrictState,
  selectDistrictData,
  selectSelectedDistrict,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectDistrictContent,
  selectPagination,
} from "../selectors/district-selectors";

export const useDistrictState = () => {
  const dispatch = useAppDispatch();
  const districtState = useAppSelector(selectDistrictState);
  const districtData = useAppSelector(selectDistrictData);
  const districtContent = useAppSelector(selectDistrictContent);
  const selectedDistrict = useAppSelector(selectSelectedDistrict);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    districtState,
    districtData,
    districtContent,
    selectedDistrict,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
