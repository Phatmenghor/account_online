import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectCommuneState,
  selectCommuneData,
  selectSelectedCommune,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectCommuneContent,
  selectPagination,
} from "../selectors/commune-selectors";

export const useCommuneState = () => {
  const dispatch = useAppDispatch();
  const communeState = useAppSelector(selectCommuneState);
  const communeData = useAppSelector(selectCommuneData);
  const communeContent = useAppSelector(selectCommuneContent);
  const selectedCommune = useAppSelector(selectSelectedCommune);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    communeState,
    communeData,
    communeContent,
    selectedCommune,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
