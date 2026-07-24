import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectOccupationState,
  selectOccupationData,
  selectSelectedOccupation,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectOccupationContent,
  selectPagination,
} from "../selectors/occupation-selectors";

export const useOccupationState = () => {
  const dispatch = useAppDispatch();
  const occupationState = useAppSelector(selectOccupationState);
  const occupationData = useAppSelector(selectOccupationData);
  const occupationContent = useAppSelector(selectOccupationContent);
  const selectedOccupation = useAppSelector(selectSelectedOccupation);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    occupationState,
    occupationData,
    occupationContent,
    selectedOccupation,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
