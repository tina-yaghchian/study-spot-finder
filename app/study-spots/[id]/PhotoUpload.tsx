"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buttonSecondary } from "@/components/ui";
import FormMessage, { type Message } from "@/components/FormMessage";

const BUCKET = "study-spot-photos";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type PhotoUploadProps = {
  studySpotId: string;
  userId: string;
};

export default function PhotoUpload({ studySpotId, userId }: PhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function handleFile(file: File) {
    setMessage(null);

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      setMessage({ type: "error", text: "Use a JPG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ type: "error", text: "Images must be 5 MB or smaller." });
      return;
    }

    setUploading(true);

    // A generated name avoids collisions and characters storage paths reject.
    const filePath = `${studySpotId}/${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      console.error(uploadError);
      setMessage({ type: "error", text: "The photo could not be uploaded." });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("photos").insert({
      study_spot_id: studySpotId,
      user_id: userId,
      image_url: publicUrl,
    });

    if (insertError) {
      console.error(insertError);
      // Do not leave an orphaned file behind if the database row failed.
      await supabase.storage.from(BUCKET).remove([filePath]);
      setMessage({ type: "error", text: "The photo could not be saved." });
      setUploading(false);
      return;
    }

    setUploading(false);
    setMessage({ type: "success", text: "Photo added." });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(ALLOWED_TYPES).join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={buttonSecondary}
      >
        {uploading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : (
          <ImagePlus className="size-4" aria-hidden />
        )}
        {uploading ? "Uploading" : "Add photo"}
      </button>
      {message && <FormMessage message={message} />}
    </div>
  );
}
