"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/UserContext";

export default function CreateClientForm() {
  const { currentUser } = useUser();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.from("clients").insert([
      {
        name: name.trim(),
        firm_id: currentUser.firm_id,
      },
    ]);

    if (error) {
      setErrorMsg(error.message || "Failed to create client.");
      setLoading(false);
    } else {
      setName("");
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xs mb-6">
      <h2 className="text-base font-semibold text-gray-800 mb-3">Add New Client</h2>

      {errorMsg && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter client name (e.g. Acme Corp)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating..." : "Create Client"}
        </button>
      </form>
    </div>
  );
}
