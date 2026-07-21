import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectLegalTypeState,
  selectLegalTypeData,
  selectSelectedLegalType,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectLegalTypeContent,
  selectPagination,
} from "../selectors/legaltype-selectors";

export const useLegalTypeState = () => {
  const dispatch = useAppDispatch();
  const legalTypeState = useAppSelector(selectLegalTypeState);
  const legalTypeData = useAppSelector(selectLegalTypeData);
  const legalTypeContent = useAppSelector(selectLegalTypeContent);
  const selectedLegalType = useAppSelector(selectSelectedLegalType);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    legalTypeState,
    legalTypeData,
    legalTypeContent,
    selectedLegalType,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
