"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/UserContext";

interface DocumentReviewActionsProps {
  documentId: string;
  currentStatus: string;
}

export default function DocumentReviewActions({
  documentId,
  currentStatus,
}: DocumentReviewActionsProps) {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [reUploadFile, setReUploadFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // STAFF VIEW
  if (currentUser.role === "staff") {
    if (currentStatus === "CORRECTION_REQUIRED") {
      return (
        <div className="bg-white border-2 border-indigo-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Resolve Correction Request</h2>
                <p className="text-xs text-slate-500">
                  Upload a corrected version of the document to reset status to <strong className="text-indigo-600">UPLOADED</strong>.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 self-start sm:self-auto">
              Staff Action ({currentUser.name})
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleReUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Attach Revised Document <span className="text-rose-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setReUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-indigo-200 rounded-xl p-1 bg-slate-50/50 focus:outline-none"
                disabled={loading}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !reUploadFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Re-uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Re-upload Corrected Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Review Controls Restricted: Signed in as <span className="text-blue-700 font-bold">{currentUser.name} (Staff)</span>
            </p>
            <p className="text-xs text-slate-500">
              Audit decisions (Start Review, Approve, Request Correction) are reserved for Reviewers.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Switch to Aman (Reviewer) in navbar
        </span>
      </div>
    );
  }

  // REVIEWER VIEW
  async function performAction(
    newStatus: string,
    actionName: string,
    comment: string
  ) {
    if (currentUser.role !== "reviewer") {
      setErrorMsg("Permission denied: Only reviewers can perform review actions.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error: updateError } = await supabase
        .from("documents")
        .update({ status: newStatus })
        .eq("id", documentId)
        .eq("firm_id", currentUser.firm_id);

      if (updateError) {
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      const { error: logError } = await supabase.from("audit_logs").insert([
        {
          document_id: documentId,
          firm_id: currentUser.firm_id,
          action: actionName,
          performed_by: currentUser.id,
          comment: comment,
        },
      ]);

      if (logError) {
        console.warn("Audit log notice:", logError.message);
      }

      setShowCorrectionInput(false);
      setCorrectionReason("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!reUploadFile || loading) return;

    if (currentUser.role !== "staff") {
      setErrorMsg("Permission denied: Only staff members can re-upload documents.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const safeFileName = reUploadFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${currentUser.firm_id}/reuploads/${documentId}/${Date.now()}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, reUploadFile);

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: "UPLOADED",
          file_url: publicUrl,
        })
        .eq("id", documentId)
        .eq("firm_id", currentUser.firm_id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      const { error: logError } = await supabase.from("audit_logs").insert([
        {
          document_id: documentId,
          firm_id: currentUser.firm_id,
          action: "RE_UPLOADED",
          performed_by: currentUser.id,
          comment: `${currentUser.name} re-uploaded corrected document`,
        },
      ]);

      if (logError) {
        console.warn("Audit log error:", logError);
      }

      setReUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMsg("Corrected document uploaded successfully! Status reset to UPLOADED.");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during re-upload.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartReview() {
    performAction(
      "UNDER_REVIEW",
      "REVIEW_STARTED",
      `${currentUser.name} started review`
    );
  }

  function handleApprove() {
    performAction(
      "APPROVED",
      "APPROVED",
      `${currentUser.name} approved document`
    );
  }

  function handleCorrectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedReason = correctionReason.trim();
    if (!trimmedReason) {
      setErrorMsg("Please provide a reason explaining what requires correction.");
      return;
    }

    performAction(
      "CORRECTION_REQUIRED",
      "CORRECTION_REQUESTED",
      trimmedReason
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Reviewer Actions</h2>
            <p className="text-xs text-slate-500">
              Assigned Reviewer: <strong className="text-slate-800">{currentUser.name}</strong>
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 self-start sm:self-auto">
          Reviewer: {currentUser.name}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Review Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Start Review */}
        <button
          type="button"
          onClick={handleStartReview}
          disabled={loading || currentStatus === "UNDER_REVIEW"}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-amber-500/20 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{loading ? "Processing..." : "Start Review"}</span>
        </button>

        {/* Approve */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading || currentStatus === "APPROVED"}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{loading ? "Processing..." : "Approve Document"}</span>
        </button>

        {/* Request Correction toggle */}
        <button
          type="button"
          onClick={() => {
            setShowCorrectionInput(!showCorrectionInput);
            setErrorMsg(null);
          }}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl active:scale-98 transition-all ${
            showCorrectionInput
              ? "bg-slate-200 text-slate-800"
              : "bg-rose-600 hover:bg-rose-500 text-white shadow-xs hover:shadow-rose-500/20"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>{showCorrectionInput ? "Cancel Request" : "Request Correction"}</span>
        </button>
      </div>

      {/* Expandable Request Correction Form */}
      {showCorrectionInput && (
        <form onSubmit={handleCorrectionSubmit} className="mt-4 p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3.5 animate-fadeIn">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 mb-1.5">
              Reason for Correction <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={correctionReason}
              onChange={(e) => {
                setCorrectionReason(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Explain the required revision (e.g. Missing auditor signature on page 3, updated financial breakdown required)"
              rows={3}
              className="w-full p-3.5 bg-white border border-rose-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all placeholder-slate-400"
              disabled={loading}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowCorrectionInput(false);
                setErrorMsg(null);
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !correctionReason.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-rose-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Submitting..." : "Submit Correction Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
