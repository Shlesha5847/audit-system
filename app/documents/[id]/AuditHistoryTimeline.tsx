import { AuditLog } from "@/lib/constants";

export interface EnrichedAuditLog extends AuditLog {
  userName?: string;
}

interface AuditHistoryTimelineProps {
  logs: EnrichedAuditLog[];
}

function getActionMeta(action: string) {
  switch (action) {
    case "APPROVED":
      return {
        label: "[APPROVED]",
        dotColor: "bg-emerald-500 ring-emerald-100",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "REVIEW_STARTED":
      return {
        label: "[REVIEW]",
        dotColor: "bg-amber-500 ring-amber-100",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "CORRECTION_REQUESTED":
      return {
        label: "[CORRECTION]",
        dotColor: "bg-rose-500 ring-rose-100",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "UPLOADED":
    default:
      return {
        label: "[UPLOAD]",
        dotColor: "bg-blue-500 ring-blue-100",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      };
  }
}

function parseLogComment(log: EnrichedAuditLog) {
  const comment = log.comment || "";
  const userName = log.userName || log.performed_by || "User";

  // Check if comment has a correction reason
  if (
    log.action === "CORRECTION_REQUESTED" ||
    comment.includes("requested correction:")
  ) {
    const parts = comment.split(/requested correction:\s*/i);
    const reason = parts[1] ? parts[1].trim() : "";
    return {
      mainText: `${userName} requested correction`,
      reason: reason,
    };
  }

  // Check if comment starts with a name already
  return {
    mainText: comment || `${userName} performed ${log.action}`,
    reason: null,
  };
}

export default function AuditHistoryTimeline({ logs }: AuditHistoryTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No audit history recorded for this document.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {logs.map((log) => {
          const { label, dotColor, badgeColor } = getActionMeta(log.action);
          const { mainText, reason } = parseLogComment(log);
          const isCorrection = log.action === "CORRECTION_REQUESTED";

          // Format time as 10:20 AM (and date if needed)
          const dateObj = new Date(log.created_at);
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div key={log.id} className="relative pl-6">
              {/* Timeline Bullet Dot */}
              <div
                className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ring-4 ${dotColor}`}
              />

              {/* Timestamp & Action Label */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  {formattedTime} <span className="font-normal text-gray-400">({formattedDate})</span>
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border uppercase ${badgeColor}`}
                >
                  {label}
                </span>
              </div>

              {/* Event Description with Bold User Name */}
              <div
                className={`text-sm ${
                  isCorrection ? "text-rose-950 font-medium" : "text-gray-800"
                }`}
              >
                {/* Highlight bold user name */}
                {log.userName && mainText.startsWith(log.userName) ? (
                  <>
                    <strong className="font-bold text-gray-900">{log.userName}</strong>
                    {mainText.slice(log.userName.length)}
                  </>
                ) : (
                  mainText
                )}
              </div>

              {/* Highlighted Reason for Correction */}
              {reason && (
                <div className="mt-2 p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r text-xs text-rose-900">
                  <strong className="font-semibold text-rose-950">Reason:</strong> {reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
