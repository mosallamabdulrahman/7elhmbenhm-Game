"use client";

import React, { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { supabasePanel as supabase } from "@/lib/supabase-panel";

// ─── Media Upload (question image/audio/video) ─────────────────
const AUDIO_EXTS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "ogv"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

const mediaTypeFromExt = (ext: string): "audio" | "video" | "image" => {
  if (AUDIO_EXTS.includes(ext)) return "audio";
  if (VIDEO_EXTS.includes(ext)) return "video";
  return "image";
};

const mediaTypeFromUrl = (url: string): "audio" | "video" | "image" => {
  const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase() || "";
  return mediaTypeFromExt(ext);
};

interface MediaUploadProps {
  value?: string | null;
  type?: "audio" | "video" | "image" | null;
  onChange: (url: string, mediaType: "audio" | "video" | "image" | null) => void;
  extra?: React.ReactNode;
}

export function MediaUpload({ value, type, onChange, extra }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const allowed = [...IMAGE_EXTS, ...AUDIO_EXTS, ...VIDEO_EXTS];
      if (!allowed.includes(ext)) throw new Error("نوع الملف غير مدعوم.");

      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error: upErr } = await supabase.storage
        .from("question-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("question-media").getPublicUrl(data.path);

      onChange(publicUrl, mediaTypeFromExt(ext));
    } catch (err: any) {
      setError(err?.message || "فشل الرفع.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {value && type === "image" && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="معاينة"
            className="h-32 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/logo.png";
              e.currentTarget.className =
                "h-32 w-full object-contain p-3 bg-slate-100";
            }}
          />
        </div>
      )}
      {value && type === "audio" && (
        <audio controls src={value} className="w-full h-10 rounded-xl" />
      )}
      {value && type === "video" && (
        <video
          controls
          src={value}
          className="h-40 w-full rounded-xl border border-slate-200 bg-black object-contain"
        />
      )}
      {value ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value, type || null)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 bg-slate-50 focus:border-cyan-500 outline-none transition-colors"
          placeholder="أو أدخل رابط URL مباشرة"
        />
      ) : (
        <input
          value=""
          onChange={(e) => {
            const url = e.target.value.trim();
            if (!url) return;
            onChange(url, mediaTypeFromUrl(url));
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 bg-slate-50 focus:border-cyan-500 outline-none transition-colors"
          placeholder="أو أدخل رابط URL مباشرة"
        />
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "جارٍ الرفع..." : "رفع ملف"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("", null)}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              إزالة
            </button>
          )}
        </div>
        {extra && <div className="ms-auto flex items-center">{extra}</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

interface CategoryImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  extra?: React.ReactNode;
}

export function CategoryImageUpload({ value, onChange, extra }: CategoryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const allowed = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!allowed.includes(ext)) throw new Error("نوع الملف غير مدعوم.");

      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error: upErr } = await supabase.storage
        .from("category-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("category-images").getPublicUrl(data.path);

      onChange(publicUrl);
    } catch (err: any) {
      setError(err?.message || "فشل الرفع.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {value && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="معاينة الغلاف"
            className="h-32 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/logo.png";
              e.currentTarget.className =
                "h-32 w-full object-contain p-3 bg-slate-100";
            }}
          />
        </div>
      )}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 bg-slate-50 focus:border-cyan-500 outline-none transition-colors"
        placeholder="أو أدخل رابط URL مباشرة"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "جارٍ الرفع..." : "رفع صورة"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              إزالة
            </button>
          )}
        </div>
        {extra && <div className="ms-auto flex items-center">{extra}</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

interface AnswerImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  extra?: React.ReactNode;
}

export function AnswerImageUpload({ value, onChange, extra }: AnswerImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const allowed = [...IMAGE_EXTS, ...AUDIO_EXTS, ...VIDEO_EXTS];
      if (!allowed.includes(ext)) throw new Error("نوع الملف غير مدعوم. الصيغ المدعومة: صور، صوت، أو فيديو.");

      const path = `answer_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error: upErr } = await supabase.storage
        .from("question-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("question-media").getPublicUrl(data.path);

      onChange(publicUrl);
    } catch (err: any) {
      setError(err?.message || "فشل الرفع.");
    } finally {
      setUploading(false);
    }
  };

  const detectedType = value ? mediaTypeFromUrl(value) : null;

  return (
    <div className="space-y-2">
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {value && detectedType === "image" && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="معاينة ميديا الإجابة"
            className="h-32 w-full object-contain p-1"
            onError={(e) => {
              e.currentTarget.src = "/images/logo.png";
              e.currentTarget.className =
                "h-32 w-full object-contain p-3 bg-slate-100";
            }}
          />
        </div>
      )}
      {value && detectedType === "audio" && (
        <div className="p-2 rounded-xl border border-slate-200 bg-slate-50">
          <audio controls src={value} className="w-full h-10 rounded-lg" />
        </div>
      )}
      {value && detectedType === "video" && (
        <video
          controls
          src={value}
          className="h-40 w-full rounded-xl border border-slate-200 bg-black object-contain"
        />
      )}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-500 bg-slate-50 focus:border-cyan-500 outline-none transition-colors"
        placeholder="أو أدخل رابط URL مباشرة (صورة، صوت، أو فيديو)"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "جارٍ الرفع..." : "رفع ملف (صورة / صوت / فيديو)"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              إزالة
            </button>
          )}
        </div>
        {extra && <div className="ms-auto flex items-center">{extra}</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
