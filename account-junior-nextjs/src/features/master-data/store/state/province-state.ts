import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectProvinceState,
  selectProvinceData,
  selectSelectedProvince,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectProvinceContent,
  selectPagination,
} from "../selectors/province-selectors";

export const useProvinceState = () => {
  const dispatch = useAppDispatch();
  const provinceState = useAppSelector(selectProvinceState);
  const provinceData = useAppSelector(selectProvinceData);
  const provinceContent = useAppSelector(selectProvinceContent);
  const selectedProvince = useAppSelector(selectSelectedProvince);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    provinceState,
    provinceData,
    provinceContent,
    selectedProvince,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
