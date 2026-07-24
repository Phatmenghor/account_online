import React, { createContext, useContext, ReactNode } from "react";
import { NIDFormData } from "@/features/account-opening/components/form-field/form-validate-error";

interface FormStateContextType {
  isLoading: boolean;
  isValidating: boolean;
  isSubmitting: boolean;
  translate: (key: string) => string;
  translateSelect: (key: string) => string;
  validationErrors: Record<string, string>;
  validateField: (field: keyof NIDFormData, value: any) => void;
  handleValidationChange: (field: string, error: string | null) => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(
  undefined
);

export const useFormState = () => {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used within FormStateProvider");
  }
  return context;
};

interface FormStateProviderProps {
  children: ReactNode;
  value: FormStateContextType;
}

export const FormStateProvider: React.FC<FormStateProviderProps> = ({
  children,
  value,
}) => {
  return (
    <FormStateContext.Provider value={value}>
      {children}
    </FormStateContext.Provider>
  );
};

