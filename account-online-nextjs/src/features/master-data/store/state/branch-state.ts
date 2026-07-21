import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  selectBranchState,
  selectBranchData,
  selectSelectedBranch,
  selectIsLoading,
  selectError,
  selectFilters,
  selectOperations,
  selectBranchContent,
  selectPagination,
} from "../selectors/branch-selectors";

export const useBranchState = () => {
  const dispatch = useAppDispatch();
  const branchState = useAppSelector(selectBranchState);
  const branchData = useAppSelector(selectBranchData);
  const branchContent = useAppSelector(selectBranchContent);
  const selectedBranch = useAppSelector(selectSelectedBranch);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);

  return {
    branchState,
    branchData,
    branchContent,
    selectedBranch,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
