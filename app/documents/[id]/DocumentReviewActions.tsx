"use client";

import { useState } from "react";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // STAFF CANNOT review; REVIEWER CAN review
  if (currentUser.role !== "reviewer") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          <span>
            Signed in as <strong className="text-gray-800">{currentUser.name}</strong> ({currentUser.role}). Review actions (Start Review, Approve, Request Correction) are restricted to <strong>Reviewers</strong>.
          </span>
        </div>
        <span className="text-xs text-gray-400">Switch to Reviewer in navbar to review</span>
      </div>
    );
  }

  async function performAction(
    newStatus: string,
    actionName: string,
    comment: string
  ) {
    // Logic protection: Enforce reviewer role check before action
    if (currentUser.role !== "reviewer") {
      setErrorMsg("Permission denied: Only reviewers can perform review actions.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Update Document status
      const { error: updateError } = await supabase
        .from("documents")
        .update({ status: newStatus })
        .eq("id", documentId)
        .eq("firm_id", currentUser.firm_id);

      if (updateError) {
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      // 2. Insert Audit Log
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

      // 3. Reset correction input state and refresh page data
      setShowCorrectionInput(false);
      setCorrectionReason("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
    if (!correctionReason.trim()) return;

    performAction(
      "CORRECTION_REQUIRED",
      "CORRECTION_REQUESTED",
      `${currentUser.name} requested correction: ${correctionReason.trim()}`
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Review Actions</h2>
          <p className="text-xs text-gray-500">
            Reviewer: <span className="font-medium text-gray-700">{currentUser.name}</span>
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Current Status: <span className="font-semibold text-gray-800">{currentStatus}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {errorMsg}
        </div>
      )}

      {/* Main Review Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Start Review */}
        <button
          type="button"
          onClick={handleStartReview}
          disabled={loading || currentStatus === "UNDER_REVIEW"}
          className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Start Review"}
        </button>

        {/* Approve */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading || currentStatus === "APPROVED"}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Approve"}
        </button>

        {/* Request Correction toggle */}
        <button
          type="button"
          onClick={() => setShowCorrectionInput(!showCorrectionInput)}
          disabled={loading}
          className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {showCorrectionInput ? "Cancel Correction" : "Request Correction"}
        </button>
      </div>

      {/* Request Correction Form */}
      {showCorrectionInput && (
        <form onSubmit={handleCorrectionSubmit} className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-3">
          <label className="block text-xs font-semibold text-rose-800">
            Reason for Correction
          </label>
          <textarea
            value={correctionReason}
            onChange={(e) => setCorrectionReason(e.target.value)}
            placeholder="Explain why correction is required (e.g. Missing signature on page 2, updated balance sheet needed)"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-rose-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            disabled={loading}
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCorrectionInput(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !correctionReason.trim()}
              className="px-4 py-1.5 bg-rose-600 text-white text-xs font-medium rounded hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Correction Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
