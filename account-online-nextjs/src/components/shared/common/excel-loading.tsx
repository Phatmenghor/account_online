import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 16 }: { size?: number }) => (
  <Loader2
    className={`animate-spin text-muted-foreground`}
    style={{ width: size, height: size }}
  />
);

export default LoadingSpinner;
