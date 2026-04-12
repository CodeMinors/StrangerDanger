import { useEffect } from "react";

export default function Toast({ message, type = "success" }) {
  const borderColor = type === "success" ? "border-[#00FF66]" : "border-[#FF2A55]";
  const icon = type === "success" ? "+" : "!";
  const iconColor = type === "success" ? "text-[#00FF66]" : "text-[#FF2A55]";

  return (
    <div
      data-testid="toast-notification"
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#101218] border ${borderColor} px-6 py-3 flex items-center gap-3 animate-fade-in-up`}
      style={{ minWidth: 280 }}
    >
      <span className={`font-bold text-lg ${iconColor} font-mono`}>{icon}</span>
      <span className="text-sm text-white">{message}</span>
    </div>
  );
}
