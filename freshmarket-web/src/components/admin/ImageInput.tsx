import { useRef, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import axios from "axios";

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageInput({ value, onChange }: ImageInputProps) {
  const [mode, setMode]       = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await client.post<{ url: string }>(
        endpoints.admin.uploads.image,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onChange(res.data.url);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data ?? "Erro ao fazer upload.")
        : "Erro ao fazer upload.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setUploading(false);
      // reset input para permitir re-upload do mesmo ficheiro
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {/* Toggle URL / Upload */}
      <div className="flex gap-3 mb-2">
        <span className="text-sm text-slate-600 font-medium">Imagem</span>
        <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 font-medium transition-colors ${
              mode === "url" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2.5 py-1 font-medium transition-colors border-l border-slate-200 ${
              mode === "upload" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Ficheiro
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg px-3 py-4 text-sm text-center text-slate-400 cursor-pointer hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          {uploading ? "A fazer upload..." : "Clica para escolher imagem (JPG, PNG, WebP · máx 5MB)"}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <img
          src={value}
          alt="preview"
          className="mt-2 h-20 w-20 rounded-lg object-cover border border-slate-100"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}