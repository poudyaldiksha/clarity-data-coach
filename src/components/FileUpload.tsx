import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DatasetSummary {
  filename: string;
  rowCount: number;
  columnCount: number;
  columns: Array<{
    name: string;
    type: string;
    missing: number;
    missingPct: string;
    [key: string]: unknown;
  }>;
  totalMissing: number;
}

interface Props {
  userId: string;
  onDatasetReady: (datasetId: string, summary: DatasetSummary, cleaningSuggestions: string[], aiSuggestions: string) => void;
}

export function FileUpload({ userId, onDatasetReady }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "tsv"].includes(ext || "")) {
      toast.error("Only CSV and TSV files are supported currently");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    setUploading(true);
    setProgress("Uploading file...");

    try {
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("datasets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("datasets").getPublicUrl(filePath);
      
      // Get a signed URL since bucket is private
      const { data: signedUrlData } = await supabase.storage
        .from("datasets")
        .createSignedUrl(filePath, 3600);
      
      const fileUrl = signedUrlData?.signedUrl || publicUrl;

      setProgress("Creating dataset record...");
      const { data: dataset, error: dbError } = await supabase
        .from("datasets")
        .insert({ user_id: userId, filename: file.name, file_url: filePath })
        .select()
        .single();

      if (dbError) throw dbError;

      setProgress("Analyzing dataset with AI...");
      const { data: analysis, error: fnError } = await supabase.functions.invoke("analyze-dataset", {
        body: { fileUrl, filename: file.name, datasetId: dataset.id },
      });

      if (fnError) throw fnError;

      setProgress("Done!");
      onDatasetReady(
        dataset.id,
        analysis.summary,
        analysis.cleaningSuggestions,
        analysis.aiSuggestions
      );
      toast.success(`"${file.name}" analyzed successfully!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
      setProgress("");
    }
  }, [userId, onDatasetReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="w-full">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.tsv"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        multiple={false}
      />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-4"
          >
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-secondary-foreground">{progress}</span>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-5 py-6 text-center cursor-pointer transition-all ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-secondary-foreground font-medium">
              Drop CSV files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supports CSV, TSV (max 10MB)</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
