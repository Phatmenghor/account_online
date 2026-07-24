import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectMaritalState,
  selectMaritalData,
  selectSelectedMarital,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectMaritalContent,
  selectPagination,
} from "../selectors/marital-selectors";

export const useMaritalState = () => {
  const dispatch = useAppDispatch();
  const maritalState = useAppSelector(selectMaritalState);
  const maritalData = useAppSelector(selectMaritalData);
  const maritalContent = useAppSelector(selectMaritalContent);
  const selectedMarital = useAppSelector(selectSelectedMarital);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    maritalState,
    maritalData,
    maritalContent,
    selectedMarital,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
