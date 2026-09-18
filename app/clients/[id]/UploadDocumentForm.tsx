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
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Upload Restricted: Signed in as <span className="text-purple-700 font-bold">{currentUser.name} (Reviewer)</span>
            </p>
            <p className="text-xs text-slate-500">
              Only Staff members have permission to upload new audit documents.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Switch to Rohit (Staff) in navbar
        </span>
      </div>
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!docName.trim() || !file || loading) return;

    if (currentUser.role !== "staff") {
      setErrorMsg("Permission denied: Only staff members can upload documents.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Upload file to Supabase Storage
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${currentUser.firm_id}/${clientId}/${Date.now()}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
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
      setSuccessMsg("Document successfully uploaded to audit repository!");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow mb-8">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Audit Document</h3>
            <p className="text-xs text-slate-500">
              Submit PDF, invoices, spreadsheets, or financial disclosures for review.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
          Staff: {currentUser.name}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Q3 Audited Balance Sheet, Tax Filing"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Choose File <span className="text-rose-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50/50 focus:outline-none"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !docName.trim() || !file}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-blue-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
