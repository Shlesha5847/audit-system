import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { defaultFirm } from "@/lib/constants";
import DocumentReviewActions from "./DocumentReviewActions";
import AuditHistoryTimeline, { EnrichedAuditLog } from "./AuditHistoryTimeline";

export const dynamic = "force-dynamic";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          APPROVED
        </span>
      );
    case "UNDER_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          UNDER REVIEW
        </span>
      );
    case "CORRECTION_REQUIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          CORRECTION REQUIRED
        </span>
      );
    case "UPLOADED":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          UPLOADED
        </span>
      );
  }
}

export default async function DocumentReviewPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const activeFirmId = cookieStore.get("audit_firm_id")?.value || defaultFirm.id;

  // 1. Fetch Document details
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("firm_id", activeFirmId)
    .single();

  if (docError || !document) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Clients Directory</span>
        </Link>
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{docError ? docError.message : "Document not found or does not belong to the selected tenant firm."}</span>
        </div>
      </div>
    );
  }

  // 2. Fetch associated Client info
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", document.client_id)
    .single();

  // 3. Fetch Uploader info
  let uploaderName = "Unknown";
  if (document.uploaded_by) {
    const { data: uploader } = await supabase
      .from("users")
      .select("name")
      .eq("id", document.uploaded_by)
      .single();
    if (uploader?.name) {
      uploaderName = uploader.name;
    }
  }

  // 4. Fetch Audit Logs in Chronological Order (ASC)
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("document_id", document.id)
    .eq("firm_id", activeFirmId)
    .order("created_at", { ascending: true });

  // 5. Join User Names for all log entries
  const performedByIds = Array.from(
    new Set((auditLogs || []).map((log) => log.performed_by).filter(Boolean))
  );

  let usersMap: Record<string, string> = {};
  if (performedByIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", performedByIds);

    if (users) {
      usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {});
    }
  }

  const enrichedLogs: EnrichedAuditLog[] = (auditLogs || []).map((log) => ({
    ...log,
    userName: usersMap[log.performed_by] || log.performed_by || "User",
  }));

  // 6. Extract Latest Correction Reason (if any)
  const correctionLogs = enrichedLogs.filter(
    (log) => log.action === "CORRECTION_REQUESTED"
  );
  const latestCorrectionLog =
    correctionLogs.length > 0 ? correctionLogs[correctionLogs.length - 1] : null;

  let latestCorrectionReason = "";
  if (latestCorrectionLog?.comment) {
    const raw = latestCorrectionLog.comment.trim();
    if (raw.includes("requested correction:")) {
      latestCorrectionReason =
        raw.split(/requested correction:\s*/i)[1]?.trim() || raw;
    } else {
      latestCorrectionReason = raw;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Link
          href={`/clients/${document.client_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to {client?.name || "Client Workspace"}</span>
        </Link>
      </div>

      {/* Prominent Correction Reason Banner when CORRECTION_REQUIRED */}
      {document.status === "CORRECTION_REQUIRED" && (
        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white uppercase tracking-wider shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              Status: Action Required
            </span>
          </div>
          <div>
            <span className="font-bold text-rose-950 block text-xs uppercase tracking-wider mb-1">
              Reviewer Correction Notice:
            </span>
            <p className="font-semibold text-rose-900 bg-white/95 p-4 rounded-xl border border-rose-200 text-sm shadow-2xs">
              {latestCorrectionReason || "No reason specified by reviewer."}
            </p>
          </div>
        </div>
      )}

      {/* Document Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {document.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {document.id}
              </p>
            </div>
          </div>
          <div>
            {getStatusBadge(document.status)}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-0.5">
              Client Organization
            </span>
            <span className="font-bold text-slate-900 text-sm">{client?.name || "N/A"}</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-0.5">
              Uploaded By
            </span>
            <span className="font-bold text-slate-900 text-sm">{uploaderName}</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-0.5">
              Upload Date
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {new Date(document.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 flex flex-col justify-center">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-0.5">
              Repository File
            </span>
            {document.file_url ? (
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View Raw File</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-slate-400 font-medium">No URL linked</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Actions Section */}
      <DocumentReviewActions
        documentId={document.id}
        currentStatus={document.status}
      />

      {/* Audit History Timeline Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-800">
              Audit History Trail ({enrichedLogs.length} Events)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
            Append-Only Log
          </span>
        </div>

        <AuditHistoryTimeline logs={enrichedLogs} />
      </div>
    </div>
  );
}
