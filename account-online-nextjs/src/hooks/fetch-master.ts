import { useState, useEffect } from "react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { getAllPublicMaritalService } from "@/services/dashboard/marital/marital.service";
import { getAllPublicOccupationService } from "@/services/dashboard/occupation/occupation.service";
import { getAllPublicReferenceService } from "@/services/dashboard/reference/reference.service";
import { getAllPublicBranchService } from "@/services/branch/branch.service";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { BranchModel } from "@/models/branch/branch.response";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { getAllPublicLegalTypeService } from "@/services/dashboard/legal-type/legal-type.service";

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
