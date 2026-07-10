"use client";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  User,
  Lock,
  Activity,
  FileText,
  Database,
  Clock,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

// CPBank Internal App Toast Types
export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "customer"
  | "system"
  | "audit"
  | "compliance"
  | "transaction"
  | "urgent"
  | "process";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export type ToastPriority = "low" | "normal" | "high" | "critical";

export interface ToastOptions {
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  priority?: ToastPriority;
  actionRequired?: boolean;
  ticketId?: string;
  customerId?: string;
  employeeId?: string;
  timestamp?: Date;
}

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  priority: ToastPriority;
  actionRequired: boolean;
  ticketId?: string;
  customerId?: string;
  employeeId?: string;
  timestamp: Date;
  isVisible: boolean;
  duration: number;
  position: ToastPosition;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  customer: (
    message: string,
    description?: string,
    customerId?: string
  ) => void;
  system: (message: string, description?: string) => void;
  audit: (message: string, description?: string, ticketId?: string) => void;
  compliance: (message: string, description?: string) => void;
  transaction: (
    message: string,
    description?: string,
    customerId?: string
  ) => void;
  urgent: (
    message: string,
    description?: string,
    actionRequired?: boolean
  ) => void;
  process: (message: string, description?: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  employeeId?: string;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Global toast function
let globalToastFunction: ((options: ToastOptions) => void) | null = null;

export const AppToast = (options: ToastOptions): void => {
  // Delegate to sonner
  import("sonner").then(({ toast }) => {
    const msg = options.message;
    const desc = options.description;
    switch (options.type) {
      case "success": toast.success(msg, { description: desc }); break;
      case "error":   toast.error(msg,   { description: desc }); break;
      case "warning": toast.warning(msg, { description: desc }); break;
      default:        toast.info(msg,    { description: desc }); break;
    }
  });
};

// Individual Toast Component
const Toast: React.FC<{
  toast: ToastData;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState<number>(100);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (toast.isVisible && toast.duration > 0 && !toast.actionRequired) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (toast.duration / 100);
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, toast.duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.isVisible, toast.duration, toast.actionRequired]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 200);
  }, [toast.id, onClose]);

  const getToastStyles = (): string => {
    const baseStyles =
      "fixed z-50 flex flex-col gap-3 p-4 rounded-lg backdrop-blur-sm transition-all duration-200 ease-out max-w-md shadow-lg border";

    const positionStyles: Record<ToastPosition, string> = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    // Professional, functional color schemes for internal use
    const typeStyles: Record<ToastType, string> = {
      success:
        "bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-900/90 dark:border-emerald-700 dark:text-emerald-100",
      error:
        "bg-red-50/95 border-red-200 text-red-900 dark:bg-red-900/90 dark:border-red-700 dark:text-red-100",
      warning:
        "bg-amber-50/95 border-amber-200 text-amber-900 dark:bg-amber-900/90 dark:border-amber-700 dark:text-amber-100",
      info: "bg-blue-50/95 border-blue-200 text-blue-900 dark:bg-blue-900/90 dark:border-blue-700 dark:text-blue-100",
      customer:
        "bg-purple-50/95 border-purple-200 text-purple-900 dark:bg-purple-900/90 dark:border-purple-700 dark:text-purple-100",
      system:
        "bg-slate-50/95 border-slate-300 text-slate-900 dark:bg-slate-800/90 dark:border-slate-600 dark:text-slate-100",
      audit:
        "bg-indigo-50/95 border-indigo-200 text-indigo-900 dark:bg-indigo-900/90 dark:border-indigo-700 dark:text-indigo-100",
      compliance:
        "bg-orange-50/95 border-orange-200 text-orange-900 dark:bg-orange-900/90 dark:border-orange-700 dark:text-orange-100",
      transaction:
        "bg-teal-50/95 border-teal-200 text-teal-900 dark:bg-teal-900/90 dark:border-teal-700 dark:text-teal-100",
      urgent:
        "bg-red-100/95 border-red-400 text-red-950 shadow-red-200/50 dark:bg-red-800/90 dark:border-red-500 dark:text-red-50",
      process:
        "bg-cyan-50/95 border-cyan-200 text-cyan-900 dark:bg-cyan-900/90 dark:border-cyan-700 dark:text-cyan-100",
    };

    const priorityStyles: Record<ToastPriority, string> = {
      low: "",
      normal: "",
      high: "shadow-lg ring-2 ring-yellow-200 dark:ring-yellow-600",
      critical: "shadow-xl ring-2 ring-red-300 dark:ring-red-500 animate-pulse",
    };

    const visibilityStyles =
      toast.isVisible && !isExiting
        ? "opacity-100 translate-y-0 scale-100"
        : "opacity-0 translate-y-1 scale-95";

    return `${baseStyles} ${positionStyles[toast.position]} ${
      typeStyles[toast.type]
    } ${priorityStyles[toast.priority]} ${visibilityStyles}`;
  };

  const getIcon = (): JSX.Element => {
    const baseIconStyles = "w-5 h-5 flex-shrink-0";

    const iconMap: Record<ToastType, JSX.Element> = {
      success: <CheckCircle className={baseIconStyles} />,
      error: <AlertCircle className={baseIconStyles} />,
      warning: <AlertTriangle className={baseIconStyles} />,
      info: <Info className={baseIconStyles} />,
      customer: <User className={baseIconStyles} />,
      system: <Database className={baseIconStyles} />,
      audit: <FileText className={baseIconStyles} />,
      compliance: <Lock className={baseIconStyles} />,
      transaction: <CreditCard className={baseIconStyles} />,
      urgent: <AlertTriangle className={`${baseIconStyles} animate-pulse`} />,
      process: <Activity className={baseIconStyles} />,
    };

    return iconMap[toast.type] || iconMap.info;
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getPriorityLabel = (priority: ToastPriority): string => {
    const labels: Record<ToastPriority, string> = {
      low: "Low",
      normal: "Normal",
      high: "High Priority",
      critical: "CRITICAL",
    };
    return labels[priority];
  };

  const getPriorityColor = (priority: ToastPriority): string => {
    const colors: Record<ToastPriority, string> = {
      low: "text-gray-500",
      normal: "text-gray-600",
      high: "text-amber-600 font-semibold",
      critical: "text-red-600 font-bold animate-pulse",
    };
    return colors[priority];
  };

  return (
    <div className={getToastStyles()}>
      {/* Progress bar for auto-dismiss toasts */}
      {!toast.actionRequired && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden rounded-b-lg">
          <div
            className="h-full bg-current opacity-50 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header with icon, priority, and close button */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold leading-tight">
              {toast.message}
            </h4>

            <div className="flex items-center gap-2 flex-shrink-0">
              {toast.priority !== "normal" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full bg-current/10 ${getPriorityColor(
                    toast.priority
                  )}`}
                >
                  {getPriorityLabel(toast.priority)}
                </span>
              )}

              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-current/10 transition-colors duration-150"
                title="Dismiss notification"
              >
                <X className="w-4 h-4 opacity-60 hover:opacity-100" />
              </button>
            </div>
          </div>

          {toast.description && (
            <p className="text-xs opacity-90 leading-relaxed mb-2">
              {toast.description}
            </p>
          )}

          {/* Metadata section */}
          <div className="flex flex-wrap gap-3 text-xs opacity-75">
            {/* <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(toast.timestamp)}</span>
            </div> */}

            {toast.customerId && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Customer: {toast.customerId}</span>
              </div>
            )}

            {toast.ticketId && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Ticket: {toast.ticketId}</span>
              </div>
            )}

            {toast.employeeId && (
              <div className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                <span>Employee: {toast.employeeId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action required indicator */}
      {toast.actionRequired && (
        <div className="mt-2 p-2 bg-current/5 rounded border border-current/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium">Action Required</span>
          </div>
        </div>
      )}

      {/* Left border indicator for priority */}
      {toast.priority === "high" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-lg" />
      )}
      {toast.priority === "critical" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg animate-pulse" />
      )}
    </div>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = "top-right",
  defaultDuration = 5000,
  employeeId,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback(
    (options: ToastOptions): void => {
      const id = `cpbank-internal-${counterRef.current++}-${Date.now()}`;
      const newToast: ToastData = {
        id,
        type: options.type || "info",
        message: options.message,
        description: options.description,
        priority: options.priority || "normal",
        actionRequired: options.actionRequired || false,
        ticketId: options.ticketId,
        customerId: options.customerId,
        employeeId: options.employeeId || employeeId,
        timestamp: options.timestamp || new Date(),
        isVisible: true,
        duration: options.duration || defaultDuration,
        position: options.position || defaultPosition,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [defaultDuration, defaultPosition, employeeId]
  );

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Internal app convenience methods
  const success = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "success", message, description });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "error", message, description, priority: "high" });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "warning", message, description });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "info", message, description });
    },
    [showToast]
  );

  const customer = useCallback(
    (message: string, description?: string, customerId?: string): void => {
      showToast({ type: "customer", message, description, customerId });
    },
    [showToast]
  );

  const system = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "system", message, description, priority: "high" });
    },
    [showToast]
  );

  const audit = useCallback(
    (message: string, description?: string, ticketId?: string): void => {
      showToast({
        type: "audit",
        message,
        description,
        ticketId,
        duration: 8000, // Audit notifications stay longer
      });
    },
    [showToast]
  );

  const compliance = useCallback(
    (message: string, description?: string): void => {
      showToast({
        type: "compliance",
        message,
        description,
        priority: "high",
        actionRequired: true,
        duration: 0, // Compliance notifications don't auto-dismiss
      });
    },
    [showToast]
  );

  const transaction = useCallback(
    (message: string, description?: string, customerId?: string): void => {
      showToast({ type: "transaction", message, description, customerId });
    },
    [showToast]
  );

  const urgent = useCallback(
    (message: string, description?: string, actionRequired = true): void => {
      showToast({
        type: "urgent",
        message,
        description,
        priority: "critical",
        actionRequired,
        duration: actionRequired ? 0 : 10000,
      });
    },
    [showToast]
  );

  const process = useCallback(
    (message: string, description?: string): void => {
      showToast({ type: "process", message, description });
    },
    [showToast]
  );

  const contextValue: ToastContextType = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      customer,
      system,
      audit,
      compliance,
      transaction,
      urgent,
      process,
    }),
    [
      showToast,
      success,
      error,
      warning,
      info,
      customer,
      system,
      audit,
      compliance,
      transaction,
      urgent,
      process,
    ]
  );

  // Set global function
  useEffect(() => {
    globalToastFunction = showToast;
    return () => {
      globalToastFunction = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </ToastContext.Provider>
  );
};
