"use client";

import { useState } from "react";

const REQUIRED_DOCUMENTS = [
  { type: "DRIVERS_LICENSE", label: "Driver's License", description: "Front and back" },
  { type: "PROOF_OF_INCOME", label: "Proof of Income", description: "Last 2 pay stubs or tax return" },
  { type: "PROOF_OF_INSURANCE", label: "Proof of Insurance", description: "Current insurance card" },
  { type: "TRADE_IN_TITLE", label: "Trade-in Title", description: "Required only if trading in a vehicle" },
] as const;

interface DocumentChecklistProps {
  applicationId: string;
  uploadedDocuments?: { type: string; fileName: string; verified: boolean }[];
}

export function DocumentChecklist({ applicationId, uploadedDocuments = [] }: DocumentChecklistProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState(uploadedDocuments);

  const uploadDoc = async (type: string, file: File) => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      formData.append("type", type);

      const res = await fetch("/api/financing/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setLocalDocs((prev) => [...prev.filter((d) => d.type !== type), data.document]);
      }
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em]">Required Documents</h2>
        <p className="text-xs text-slate-400 mt-0.5">Upload to speed up your financing approval</p>
      </div>

      <div className="divide-y divide-slate-100">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const uploaded = localDocs.find((d) => d.type === doc.type);
          const isUploading = uploading === doc.type;

          return (
            <div key={doc.type} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                  uploaded?.verified
                    ? "bg-emerald-100 text-emerald-700"
                    : uploaded
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {uploaded?.verified ? "✓" : uploaded ? "↑" : "○"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{doc.label}</p>
                  <p className="text-xs text-slate-400">{doc.description}</p>
                  {uploaded && !uploaded.verified && (
                    <p className="text-xs text-blue-600 mt-0.5">{uploaded.fileName}</p>
                  )}
                </div>
              </div>

              {!uploaded && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadDoc(doc.type, file);
                    }}
                  />
                  <span className={`text-xs px-3 py-1.5 border font-semibold uppercase tracking-[0.06em] transition-colors ${
                    isUploading
                      ? "bg-slate-100 text-slate-500 border-slate-200 cursor-wait"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}>
                    {isUploading ? "Uploading…" : "Upload"}
                  </span>
                </label>
              )}
              {uploaded?.verified && (
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-[0.06em]">Verified</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
