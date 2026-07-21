import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import userReducer from "@/features/auth/store/userSlice";
import uiReducer from "./slices/ui-slice";
import comboboxCacheReducer from "./slices/combobox-cache-slice";
import globalSettingsReducer from "./slices/global-settings-slice";

// Master data parameter slices
import branchReducer from "@/features/master-data/store/slices/branch-slice";
import communeReducer from "@/features/master-data/store/slices/commune-slice";
import districtReducer from "@/features/master-data/store/slices/district-slice";
import legalTypeReducer from "@/features/master-data/store/slices/legaltype-slice";
import maritalReducer from "@/features/master-data/store/slices/marital-slice";
import occupationReducer from "@/features/master-data/store/slices/occupation-slice";
import provinceReducer from "@/features/master-data/store/slices/province-slice";
import referenceReducer from "@/features/master-data/store/slices/reference-slice";
import villageReducer from "@/features/master-data/store/slices/village-slice";

const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    comboboxCache: comboboxCacheReducer,
    globalSettings: globalSettingsReducer,

    // Master data parameters
    branch: branchReducer,
    commune: communeReducer,
    district: districtReducer,
    legalType: legalTypeReducer,
    marital: maritalReducer,
    occupation: occupationReducer,
    province: provinceReducer,
    reference: referenceReducer,
    village: villageReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = () =>
  useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store };
