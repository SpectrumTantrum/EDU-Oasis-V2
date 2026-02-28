"use client";

import { useState } from "react";
import { Upload, FileText, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFocusFlowStore } from "@/store/useFocusFlowStore";

export function UploadPanel({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const { setKnowledgeGraph, initConceptRecordsFromGraph, startSession } = useFocusFlowStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleIngest = async () => {
    setUploading(true);
    setStatus("Extracting concepts...");
    try {
      if (file) {
        setStatus("Uploading PDF to storage...");
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          const uploadError =
            uploadData?.error?.message ?? uploadData?.error ?? `Upload failed: ${uploadRes.status}`;
          throw new Error(uploadError);
        }

        setStatus("Extracting concepts from uploaded file...");
        let ingestRes: Response;
        if (uploadData.provider === "supabase" && uploadData.path) {
          ingestRes = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storage_path: uploadData.path,
              storage_bucket: uploadData.bucket,
            }),
          });
        } else if (uploadData.base64) {
          ingestRes = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdfBase64: uploadData.base64 }),
          });
        } else {
          // Fallback for non-Supabase providers when inline base64 is unavailable.
          const directIngestForm = new FormData();
          directIngestForm.append("file", file);
          ingestRes = await fetch("/api/ingest", {
            method: "POST",
            body: directIngestForm,
          });
        }

        const ingestData = await ingestRes.json().catch(() => ({}));
        if (!ingestRes.ok) {
          const ingestError =
            ingestData?.error?.message ?? ingestData?.error ?? `Ingest failed: ${ingestRes.status}`;
          throw new Error(ingestError);
        }

        setKnowledgeGraph(ingestData);
        initConceptRecordsFromGraph(ingestData);
        startSession();
        setStatus(`Extracted ${ingestData.concepts?.length ?? 0} concepts!`);
      } else if (textInput.trim()) {
        setStatus("Extracting concepts...");
        const ingestRes = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput.trim() }),
        });
        const ingestData = await ingestRes.json().catch(() => ({}));
        if (!ingestRes.ok) {
          const ingestError =
            ingestData?.error?.message ?? ingestData?.error ?? `Ingest failed: ${ingestRes.status}`;
          throw new Error(ingestError);
        }

        setKnowledgeGraph(ingestData);
        initConceptRecordsFromGraph(ingestData);
        startSession();
        setStatus(`Extracted ${ingestData.concepts?.length ?? 0} concepts!`);
      } else {
        setStatus("Please select a file or enter text.");
        setUploading(false);
        return;
      }

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 rounded-xl max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center">
        <Upload className="w-12 h-12 mb-4 text-neutral-500" />
        <h3 className="text-xl font-semibold mb-2">Upload Course Material</h3>
        <p className="text-sm text-neutral-500 mb-6">
          Upload a PDF or paste text. We will extract concepts into your classroom.
        </p>

        <div className="w-full space-y-4">
          <Input type="file" onChange={handleFileChange} accept=".pdf,.txt" />
          {file && (
            <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
              <FileText className="w-4 h-4" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
          )}
          <div className="text-xs text-neutral-400">— or paste text below —</div>
          <textarea
            className="w-full h-32 p-3 text-sm border rounded-md bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700"
            placeholder="Paste lecture notes or study material here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button onClick={handleIngest} disabled={uploading} className="w-full">
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Brain className="w-4 h-4 mr-2" /> Extract Concepts</>}
          </Button>
          {status && <p className="text-sm text-neutral-600 dark:text-neutral-400">{status}</p>}
        </div>
      </div>
    </Card>
  );
}
