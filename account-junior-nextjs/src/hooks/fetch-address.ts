import { CommuneModel, DistrictModel, ProvinceModel, VillageModel } from "@/types/address/address.response";
import { getAllCommuneService, getAllDistrictService, getAllProvinceService, getAllVillageService } from "@/services/address/address.service";
import { useEffect, useState } from "react";
import { AppToast } from "@/components/shared/toast/app-toast";

// Add these interfaces at the top if not already present
interface UseFetchDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Province Hook
export const useProvinces = (): UseFetchDataResult<ProvinceModel> => {
  const [data, setData] = useState<ProvinceModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllProvinceService({
        pageNo: 1,
        pageSize: 100,
        search: ""
      });
      setData(response.content || []);
    } catch (err: any) {
      console.error("Failed to fetch provinces:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load provinces" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

// District Hook
export const useDistricts = (provinceCode: string): UseFetchDataResult<DistrictModel> => {
  const [data, setData] = useState<DistrictModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!provinceCode) {
      setData([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllDistrictService(provinceCode, {
        pageNo: 1,
        pageSize: 100,
        search: ""
      });
      setData(response.content || []);
    } catch (err: any) {
      console.error("Failed to fetch districts:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load districts" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provinceCode]);

  return { data, isLoading, error, refetch: fetchData };
};

// Commune Hook
export const useCommunes = (districtCode: string): UseFetchDataResult<CommuneModel> => {
  const [data, setData] = useState<CommuneModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!districtCode) {
      setData([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllCommuneService(districtCode, {
        pageNo: 1,
        pageSize: 100,
        search: ""
      });
      setData(response.content || []);
    } catch (err: any) {
      console.error("Failed to fetch communes:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load communes" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [districtCode]);

  return { data, isLoading, error, refetch: fetchData };
};

// Village Hook
export const useVillages = (communeCode: string): UseFetchDataResult<VillageModel> => {
  const [data, setData] = useState<VillageModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!communeCode) {
      setData([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllVillageService(communeCode, {
        pageNo: 1,
        pageSize: 100,
        search: ""
      });
      setData(response.content || []);
    } catch (err: any) {
      console.error("Failed to fetch villages:", err);
      setError(err);
      AppToast({ type: "error", message: "Failed to load villages" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communeCode]);

  return { data, isLoading, error, refetch: fetchData };
};
