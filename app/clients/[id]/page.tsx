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
      <div className="max-w-5xl mx-auto p-6">
        <Link
          href="/clients"
          className="text-sm font-medium text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
        >
          &larr; Back to Clients
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {clientError ? clientError.message : "Client not found or does not belong to the selected tenant firm."}
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/clients"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to Clients
        </Link>
      </div>

      {/* Client Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Client ID: {client.id}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Registered:{" "}
            {new Date(client.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Upload Document Section */}
      <UploadDocumentForm clientId={client.id} />

      {/* Documents Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            Documents ({documents ? documents.length : 0})
          </h2>
        </div>

        {docsError && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            Failed to load documents: {docsError.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold text-gray-700">
                  Document Name
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-gray-700">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-gray-700">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-gray-700 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents && documents.length > 0 ? (
                documents.map((doc: DocumentItem) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {doc.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {docsError
                      ? "Unable to display documents."
                      : "No documents uploaded yet for this client."}
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
