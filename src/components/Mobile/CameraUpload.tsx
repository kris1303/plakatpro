"use client";

import { useState, useRef } from "react";
import { extractExifGPS } from "@/lib/photos";

interface CameraUploadProps {
  campaignId: string;
  albumId: string;
  planItemId?: string;
  onUploadSuccess?: (photoId: string) => void;
}

export default function CameraUpload({
  campaignId,
  albumId,
  planItemId,
  onUploadSuccess,
}: CameraUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview anzeigen
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // GPS-Daten extrahieren
    const gps = await extractExifGPS(file);
    console.log("GPS-Daten:", gps);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);
      formData.append("albumId", albumId);
      if (planItemId) formData.append("planItemId", planItemId);
      
      // TODO: Access Token Management implementieren
      formData.append("accessToken", "dummy_token");

      const response = await fetch("/api/google/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload fehlgeschlagen");
      }

      const data = await response.json();
      
      if (onUploadSuccess) {
        onUploadSuccess(data.photoId);
      }

      // Erfolgsmeldung
      alert("✅ Foto erfolgreich hochgeladen!");
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Fehler beim Hochladen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="btn-primary w-full text-lg py-4 disabled:opacity-50"
      >
        {uploading ? "📤 Lade hoch..." : "📷 Foto aufnehmen"}
      </button>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg border-2 border-brand-yellow"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-brand-yellow font-bold">Upload läuft...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

