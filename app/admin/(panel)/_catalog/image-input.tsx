"use client";

import { useId } from "react";
import { toast } from "sonner";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_MB } from "@/lib/constants/media";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { imageFileProblem } from "@/utils/catalog/image-file";
import { AdminIcon } from "../../_components/admin-icons";

/** File picker that only hands over images the API will accept. */
export function ImageInput({ label, multiple, disabled, onFiles }: { label: string; multiple?: boolean; disabled?: boolean; onFiles: (files: File[]) => void }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <AdminIcon className="h-4 w-4" name="upload" />
      {label}
      <span className="text-xs font-normal text-slate-500">max {MAX_UPLOAD_MB} MB</span>
      <input
        id={id}
        type="file"
        className="sr-only"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          const accepted = files.filter((file) => {
            const problem = imageFileProblem(file);
            if (problem) toast.error(ERROR_MESSAGES.upload.fileProblem(file.name, problem));
            return !problem;
          });
          if (accepted.length) onFiles(accepted);
        }}
      />
    </label>
  );
}
