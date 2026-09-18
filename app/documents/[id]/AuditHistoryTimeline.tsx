import React from "react";
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
        label: "APPROVED",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        nodeBg: "bg-emerald-600 text-white ring-4 ring-emerald-100",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    case "REVIEW_STARTED":
      return {
        label: "IN REVIEW",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
        nodeBg: "bg-amber-500 text-white ring-4 ring-amber-100",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
      };
    case "CORRECTION_REQUESTED":
      return {
        label: "CORRECTION",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
        nodeBg: "bg-rose-500 text-white ring-4 ring-rose-100",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    case "RE_UPLOADED":
      return {
        label: "RE-UPLOADED",
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        nodeBg: "bg-indigo-600 text-white ring-4 ring-indigo-100",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      };
    case "UPLOADED":
    default:
      return {
        label: "UPLOADED",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
        nodeBg: "bg-blue-600 text-white ring-4 ring-blue-100",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        ),
      };
  }
}

function parseLogComment(log: EnrichedAuditLog) {
  const comment = (log.comment || "").trim();
  const userName = log.userName || "User";

  if (log.action === "CORRECTION_REQUESTED") {
    let reason = comment;
    if (comment.includes("requested correction:")) {
      const parts = comment.split(/requested correction:\s*/i);
      reason = parts[1] ? parts[1].trim() : "";
    }
    return {
      mainText: `${userName} requested correction`,
      reason: reason || "No reason specified",
    };
  }

  return {
    mainText: comment || `${userName} performed ${log.action}`,
    reason: null,
  };
}

export default function AuditHistoryTimeline({ logs }: AuditHistoryTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        No audit history recorded yet for this document.
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7">
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-7">
        {logs.map((log) => {
          const { label, badgeBg, nodeBg, icon } = getActionMeta(log.action);
          const { mainText, reason } = parseLogComment(log);
          const isCorrection = log.action === "CORRECTION_REQUESTED";

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
            <div key={log.id} className="relative pl-7 group">
              {/* Timeline Icon Node Marker */}
              <div
                className={`absolute -left-[14px] top-0.5 h-7 w-7 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${nodeBg}`}
              >
                {icon}
              </div>

              {/* Node Card Content */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border uppercase ${badgeBg}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {formattedTime} • {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Main Action Text */}
                <div className="text-sm text-slate-800">
                  {log.userName && mainText.startsWith(log.userName) ? (
                    <>
                      <strong className="font-bold text-slate-900">{log.userName}</strong>
                      {mainText.slice(log.userName.length)}
                    </>
                  ) : (
                    mainText
                  )}
                </div>

                {/* Highlighted Reason for Correction */}
                {reason && (
                  <div className="mt-3 p-3.5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-xs text-rose-950 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900 uppercase tracking-wider text-[10px] mb-1">
                      <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Reason Specified by Reviewer</span>
                    </div>
                    <p className="font-medium">{reason}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
