import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { currentUser, Client } from "@/lib/constants";
import CreateClientForm from "./CreateClientForm";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("firm_id", currentUser.firm_id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your audit clients for Firm ID: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">{currentUser.firm_id}</code>
          </p>
        </div>
      </div>

      {/* Create Client Form */}
      <CreateClientForm />

      {/* Error State */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          Failed to load clients: {error.message}
        </div>
      )}

      {/* Clients Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold text-gray-700">
                Client Name
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
            {clients && clients.length > 0 ? (
              clients.map((client: Client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(client.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  {error ? "Unable to display clients." : "No clients found. Create your first client above."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
