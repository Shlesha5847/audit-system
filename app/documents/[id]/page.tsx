import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { currentUser, AuditLog } from "@/lib/constants";
import DocumentReviewActions from "./DocumentReviewActions";

export const dynamic = "force-dynamic";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "CORRECTION_REQUIRED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "UPLOADED":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default async function DocumentReviewPage({ params }: DocumentPageProps) {
  const { id } = await params;

  // 1. Fetch Document details
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("firm_id", currentUser.firm_id)
    .single();

  if (docError || !document) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link
          href="/clients"
          className="text-sm font-medium text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
        >
          &larr; Back to Clients
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {docError ? docError.message : "Document not found or you do not have permission to view it."}
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

  // 4. Fetch Audit Logs for this document
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("document_id", document.id)
    .eq("firm_id", currentUser.firm_id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/clients/${document.client_id}`}
          className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to Client ({client?.name || "Client"})
        </Link>
      </div>

      {/* Document Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Document ID: {document.id}
            </p>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                document.status
              )}`}
            >
              {document.status}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
          <div>
            <span className="text-xs font-medium text-gray-500 block">Client</span>
            <span className="font-medium text-gray-800">{client?.name || "N/A"}</span>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 block">Uploaded By</span>
            <span className="font-medium text-gray-800">{uploaderName}</span>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 block">Created At</span>
            <span className="text-gray-700">
              {new Date(document.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 block">File Link</span>
            {document.file_url ? (
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 mt-0.5"
              >
                View / Download File &rarr;
              </a>
            ) : (
              <span className="text-gray-400">No URL available</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Actions Section */}
      <DocumentReviewActions
        documentId={document.id}
        currentStatus={document.status}
      />

      {/* Audit Logs Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-800">
            Audit Trail ({auditLogs?.length || 0})
          </h3>
        </div>

        <div className="p-6">
          {auditLogs && auditLogs.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {auditLogs.map((log: AuditLog) => (
                <li key={log.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          by <strong className="text-gray-700">{log.performed_by}</strong>
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">
                        {log.comment}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">
                      {new Date(log.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No audit logs recorded for this document.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
