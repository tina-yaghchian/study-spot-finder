"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Photo } from "@/lib/types";
import { card } from "@/components/ui";
import PhotoUpload from "./PhotoUpload";

type PhotoSectionProps = {
  studySpotId: string;
  photos: Photo[];
};

export default function PhotoSection({ studySpotId, photos }: PhotoSectionProps) {
  const { user } = useCurrentUser();

  return (
    <section aria-labelledby="photos" className={`${card} p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="photos" className="font-semibold text-ink">
          Photos{" "}
          <span className="font-normal text-ink-subtle">({photos.length})</span>
        </h2>
        {user && <PhotoUpload studySpotId={studySpotId} userId={user.id} />}
      </div>

      {photos.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed border-line-strong bg-canvas px-4 py-6 text-sm text-ink-muted">
          <ImageIcon className="size-5 shrink-0" aria-hidden />
          {user
            ? "No photos yet. Add one so others know what the space looks like."
            : "No photos yet. Sign in to add one."}
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <a
                href={photo.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-[4/3] overflow-hidden rounded-md bg-canvas"
              >
                <Image
                  src={photo.image_url}
                  alt={`Photo ${index + 1} of this study spot`}
                  fill
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-opacity hover:opacity-90"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
