import { AppToast } from "@/components/shared/toast/app-toast";

const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  switch (type) {
    case "success":
      AppToast({ type: "success", message });
      break;
    case "error":
      AppToast({ type: "error", message });
      break;
    case "info":
      AppToast({ type: "info", message });
      break;
    case "warning":
      AppToast({ type: "warning", message });
      break;
    default:
      AppToast({ type: "info", message });
  }
};

export default showToast;
