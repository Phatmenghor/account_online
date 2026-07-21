import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectReferenceState,
  selectReferenceData,
  selectSelectedReference,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectReferenceContent,
  selectPagination,
} from "../selectors/reference-selectors";

export const useReferenceState = () => {
  const dispatch = useAppDispatch();
  const referenceState = useAppSelector(selectReferenceState);
  const referenceData = useAppSelector(selectReferenceData);
  const referenceContent = useAppSelector(selectReferenceContent);
  const selectedReference = useAppSelector(selectSelectedReference);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    referenceState,
    referenceData,
    referenceContent,
    selectedReference,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
