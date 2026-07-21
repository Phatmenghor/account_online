import { useState, useEffect } from "react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { getAllPublicMaritalService } from "@/features/master-data/services/marital/marital.service";
import { getAllPublicOccupationService } from "@/features/master-data/services/occupation/occupation.service";
import { getAllPublicReferenceService } from "@/features/master-data/services/reference/reference.service";
import { getAllPublicBranchService } from "@/services/branch/branch.service";
import { MaritalModel } from "@/features/master-data/types/marital/marital.response";
import { OccupationModel } from "@/features/master-data/types/occupation/occupation.response";
import { ReferenceModel } from "@/features/master-data/types/reference/reference.response";
import { BranchModel } from "@/types/branch/branch.response";
import { LegalTypeModel } from "@/features/master-data/types/legal-type/legal-type.response";
import { getAllPublicLegalTypeService } from "@/features/master-data/services/legal-type/legal-type.service";
import { AccOnlineCategoryModel } from "@/features/master-data/types/acc-online-category/acc-online-category.response";
import { getAllPublicAccOnlineCategoryService } from "@/features/master-data/services/acc-online-category/acc-online-category.service";

/**
 * Generic hook for fetching data with loading and error states
 */
interface UseFetchDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch marital statuses
 */
export const useMaritalStatuses = (): UseFetchDataResult<MaritalModel> => {
  const [data, setData] = useState<MaritalModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicMaritalService({});
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch marital statuses:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load marital statuses" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch occupations
 */
export const useOccupations = (): UseFetchDataResult<OccupationModel> => {
  const [data, setData] = useState<OccupationModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicOccupationService({});
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch occupations:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load occupations" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch Legal Type
 */
export const useLegalTypes = (): UseFetchDataResult<LegalTypeModel> => {
  const [data, setData] = useState<LegalTypeModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicLegalTypeService({});
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch legal type:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load legal type" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch reference banks
 */
export const useReferenceBanks = (): UseFetchDataResult<ReferenceModel> => {
  const [data, setData] = useState<ReferenceModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicReferenceService({});
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch reference banks:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load reference banks" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch acc_online_category list
 */
export const useAccOnlineCategories = (): UseFetchDataResult<AccOnlineCategoryModel> => {
  const [data, setData] = useState<AccOnlineCategoryModel[]>([]);
  // Starts true: the fetch always kicks off in the effect below, and
  // isLoading must be true for the brief window before that effect runs,
  // otherwise Verify/Submit can be clicked while the list is still empty
  // and the 6011-default hasn't been auto-selected yet.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicAccOnlineCategoryService({});
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch acc online categories:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load product categories" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch branches
 */
export const useBranches = (): UseFetchDataResult<BranchModel> => {
  const [data, setData] = useState<BranchModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPublicBranchService({
        pageNo: 1,
        pageSize: 100,
      });
      setData(response || []);
    } catch (err: any) {
      console.error("Failed to fetch branches:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load branches" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};


