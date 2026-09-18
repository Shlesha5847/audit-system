"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/UserContext";

interface UploadDocumentFormProps {
  clientId: string;
}

export default function UploadDocumentForm({ clientId }: UploadDocumentFormProps) {
  const { currentUser } = useUser();
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // STAFF CAN upload; REVIEWER CANNOT upload
  if (currentUser.role !== "staff") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500"></span>
          <span>
            Signed in as <strong className="text-gray-800">{currentUser.name}</strong> ({currentUser.role}). Document upload is restricted to <strong>Staff</strong>.
          </span>
        </div>
        <span className="text-xs text-gray-400">Switch user in navbar to upload</span>
      </div>
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!docName.trim() || !file || loading) return;

    // Logic protection: Enforce staff role check before action
    if (currentUser.role !== "staff") {
      setErrorMsg("Permission denied: Only staff members can upload documents.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Upload file to Supabase Storage (bucket: "documents")
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${currentUser.firm_id}/${clientId}/${Date.now()}_${safeFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get file URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      // 3. Insert record into `documents` table
      const { data: insertedDoc, error: docError } = await supabase
        .from("documents")
        .insert([
          {
            name: docName.trim(),
            client_id: clientId,
            firm_id: currentUser.firm_id,
            file_url: publicUrl,
            status: "UPLOADED",
            uploaded_by: currentUser.id,
          },
        ])
        .select()
        .single();

      if (docError) {
        throw new Error(`Database record failed: ${docError.message}`);
      }

      // 4. Create Audit Log in `audit_logs` table
      if (insertedDoc) {
        const { error: auditError } = await supabase.from("audit_logs").insert([
          {
            document_id: insertedDoc.id,
            firm_id: currentUser.firm_id,
            action: "UPLOADED",
            performed_by: currentUser.id,
            comment: `${currentUser.name} uploaded ${docName.trim()}`,
          },
        ]);

        if (auditError) {
          console.error("Audit log error:", auditError);
        }
      }

      // 5. Reset form and refresh list
      setDocName("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccessMsg("Document uploaded successfully!");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">Upload Document</h3>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
          Staff Action ({currentUser.name})
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Audit Report 2026, Tax Filing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !docName.trim() || !file}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </div>
  );
}
