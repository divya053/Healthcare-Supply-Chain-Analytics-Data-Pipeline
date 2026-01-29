import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const styles = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function StatusBadge({ status, type = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[type],
        className
      )}
    >
      {status}
    </span>
  );
}

// Helper to auto-determine type from common status strings
export function AutoStatusBadge({ status }: { status: string }) {
  let type: StatusType = "neutral";
  
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("delivered") || s.includes("success") || s.includes("ok")) type = "success";
  else if (s.includes("pending") || s.includes("running") || s.includes("shipped")) type = "info";
  else if (s.includes("failed") || s.includes("cancelled") || s.includes("low")) type = "error";
  else if (s.includes("warning")) type = "warning";

  return <StatusBadge status={status} type={type} />;
}
