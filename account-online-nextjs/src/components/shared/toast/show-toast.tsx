import { toast } from "sonner";

const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  const duration = type === "error" || type === "warning" ? 8000 : 4000;

  const options = {
    duration,
    position: "top-center" as const,
    closeButton: true,
  };

  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warning(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

export default showToast;
