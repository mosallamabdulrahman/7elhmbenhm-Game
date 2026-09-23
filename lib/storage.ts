import { supabasePanel } from "./supabase-panel";

export const AUDIO_EXTS = ["mp3", "ogg", "wav", "m4a"];
export const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "ogv"];
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
export const ALL_MEDIA_EXTS = [...IMAGE_EXTS, ...AUDIO_EXTS, ...VIDEO_EXTS];

export const mediaTypeFromExt = (ext: string): "audio" | "video" | "image" => {
  if (AUDIO_EXTS.includes(ext)) return "audio";
  if (VIDEO_EXTS.includes(ext)) return "video";
  return "image";
};

export const mediaTypeFromUrl = (url: string): "audio" | "video" | "image" => {
  const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase() || "";
  return mediaTypeFromExt(ext);
};

export const uploadFileToStorage = async (
  file: File,
  bucket: string,
  allowedExts: string[] = ALL_MEDIA_EXTS,
  prefix: string = ""
): Promise<string> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedExts.includes(ext)) {
    throw new Error("نوع الملف غير مدعوم.");
  }

  const prefixPart = prefix ? `${prefix}_` : "";
  const path = `${prefixPart}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error: upErr } = await supabasePanel.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (upErr) throw upErr;

  const {
    data: { publicUrl },
  } = supabasePanel.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
};
