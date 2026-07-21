import { useState } from "react";

export const useAccountOtp = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [resetOtp, setResetOtp] = useState(false);

  const triggerResetOtp = () => {
    setResetOtp(true);
    setTimeout(() => setResetOtp(false), 100);
  };

  const clearOtp = () => {
    setPhoneNumber("");
    setIsPhoneVerified(false);
    triggerResetOtp();
  };

  return {
    phoneNumber,
    setPhoneNumber,
    isPhoneVerified,
    setIsPhoneVerified,
    resetOtp,
    triggerResetOtp,
    clearOtp,
  };
};
