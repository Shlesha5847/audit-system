import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import { defaultFirm, FIRMS, Client } from "@/lib/constants";
import CreateClientForm from "./CreateClientForm";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const activeFirmId = cookieStore.get("audit_firm_id")?.value || defaultFirm.id;
  const activeFirm = FIRMS.find((f) => f.id === activeFirmId) || defaultFirm;

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("firm_id", activeFirmId)
    .order("created_at", { ascending: false });

  const clientCount = clients?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header & Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Tenant: {activeFirm.name}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                ID: {activeFirmId.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Audit Clients
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage client audit profiles, document review pipelines, and verification lifecycles.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Clients
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {clientCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Form Component */}
      <CreateClientForm />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Failed to load clients: {error.message}</span>
        </div>
      )}

      {/* Clients Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-sm font-bold text-slate-800">
              Client Directory ({clientCount})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Active Tenant: {activeFirm.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Client Organization
                </th>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients && clients.length > 0 ? (
                clients.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-100 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-2xs group-hover:from-indigo-600 group-hover:to-blue-600 group-hover:text-white transition-all">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                            {client.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {client.id.slice(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {new Date(client.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(client.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-2xs hover:shadow-indigo-500/20 active:scale-98 transition-all"
                      >
                        <span>Open Workspace</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700">No clients registered yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Use the form above to add your first audit client for <strong className="text-slate-600">{activeFirm.name}</strong>.
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
