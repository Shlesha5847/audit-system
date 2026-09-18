import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { defaultFirm, DocumentItem } from "@/lib/constants";
import UploadDocumentForm from "./UploadDocumentForm";

export const dynamic = "force-dynamic";

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          APPROVED
        </span>
      );
    case "UNDER_REVIEW":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          UNDER REVIEW
        </span>
      );
    case "CORRECTION_REQUIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          CORRECTION REQUIRED
        </span>
      );
    case "UPLOADED":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          UPLOADED
        </span>
      );
  }
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const activeFirmId = cookieStore.get("audit_firm_id")?.value || defaultFirm.id;

  // 1. Fetch Client Details
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("firm_id", activeFirmId)
    .single();

  if (clientError || !client) {
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
          <span>{clientError ? clientError.message : "Client not found or does not belong to the selected tenant firm."}</span>
        </div>
      </div>
    );
  }

  // 2. Fetch Documents for this Client
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", id)
    .eq("firm_id", activeFirmId)
    .order("created_at", { ascending: false });

  const docCount = documents?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Clients Directory</span>
        </Link>
      </div>

      {/* Client Overview Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-indigo-500/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Client Workspace
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {client.id.slice(0, 12)}...
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {client.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Documents
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {docCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <UploadDocumentForm clientId={client.id} />

      {/* Documents Directory */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-sm font-bold text-slate-800">
              Audit Documents ({docCount})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Organization Repository
          </span>
        </div>

        {docsError && (
          <div className="p-4 m-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
            Failed to load documents: {docsError.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document Details
                </th>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Review Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Uploaded At
                </th>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {documents && documents.length > 0 ? (
                documents.map((doc: DocumentItem) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors shadow-2xs">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                            {doc.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {doc.id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {new Date(doc.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(doc.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-2xs hover:shadow-indigo-500/20 active:scale-98 transition-all"
                      >
                        <span>Review Document</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700">No documents uploaded</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Use the upload form above to submit initial audit documents for this client.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
