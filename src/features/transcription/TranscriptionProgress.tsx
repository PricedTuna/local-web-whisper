import { Check } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

import type { TranscriptionProgressItem } from "./useWhisperTranscription";

interface TranscriptionProgressProps {
  isModelLoading: boolean;
  isTranscribing: boolean;
  progressItems: TranscriptionProgressItem[];
}

export function TranscriptionProgress({
  isModelLoading,
  isTranscribing,
  progressItems,
}: TranscriptionProgressProps) {
  if (!isModelLoading && !isTranscribing) {
    return null;
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2 [--radius:1rem]">
      <div className="flex items-center gap-2 border-b-2">
        <Spinner />
        {isTranscribing ? "Transcribing audio..." : "Loading model files..."}
      </div>

      {isModelLoading &&
        progressItems.map((progressItem) => (
          <div key={progressItem.file} className="flex w-full gap-2">
            {progressItem.status === "done" ? (
              <Check color="green" />
            ) : (
              <>
                <Spinner />
                {progressItem.progress.toFixed(1)}
              </>
            )}{" "}
            {progressItem.name}
          </div>
        ))}
    </div>
  );
}
