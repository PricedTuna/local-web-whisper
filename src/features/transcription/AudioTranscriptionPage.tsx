import { useEffect, useState } from "react";

import { AudioInputFile } from "@/components/AudioInputFile";
import { Button } from "@/components/ui/button";

import { TranscriptCard } from "./TranscriptCard";
import { TranscriptionProgress } from "./TranscriptionProgress";
import { useWhisperTranscription } from "./useWhisperTranscription";

export function AudioTranscriptionPage() {
  const [audioFile, setAudioFile] = useState<File>();
  const {
    transcription,
    isModelLoading,
    isTranscribing,
    isBusy,
    progressItems,
    errorMessage,
    clearError,
    transcribe,
  } = useWhisperTranscription();

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    alert(errorMessage);
    clearError();
  }, [clearError, errorMessage]);

  const handleTranscribe = () => {
    if (!audioFile) {
      alert("First upload an audio");
      return;
    }

    void transcribe(audioFile);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex w-full flex-col gap-2">
          <AudioInputFile onChange={(event) => setAudioFile(event.target.files?.[0])} />
          <Button disabled={isBusy} onClick={handleTranscribe}>
            Transcribe it!
          </Button>
        </div>

        <TranscriptionProgress
          isModelLoading={isModelLoading}
          isTranscribing={isTranscribing}
          progressItems={progressItems}
        />

        <TranscriptCard transcription={transcription} />
      </div>
    </div>
  );
}
