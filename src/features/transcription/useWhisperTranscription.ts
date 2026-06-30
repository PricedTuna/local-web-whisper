import { useCallback, useEffect, useRef, useState } from "react";

import { blobToFloat32Array } from "@/lib/blobToFloat32Array";

export interface TranscriptionProgressItem {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

interface WhisperWorkerMessage {
  status: string;
  data?: {
    message?: string;
  };
  file?: string;
  loaded?: number;
  progress?: number;
  total?: number;
  name?: string;
  transcription?: string;
}

const INITIAL_TRANSCRIPTION = "Waiting to transcript ;)";
const WORKER_ERROR_HELP =
  "This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.";

function createWhisperWorker() {
  return new Worker(new URL("../../workers/whisper.workers.ts", import.meta.url), {
    type: "module",
  });
}

function toProgressItem(message: WhisperWorkerMessage): TranscriptionProgressItem | null {
  if (!message.file) {
    return null;
  }

  return {
    file: message.file,
    loaded: message.loaded ?? 0,
    progress: message.progress ?? 0,
    total: message.total ?? 0,
    name: message.name ?? message.file,
    status: message.status,
  };
}

function upsertProgressItem(items: TranscriptionProgressItem[], message: WhisperWorkerMessage) {
  const progressItem = toProgressItem(message);

  if (!progressItem) {
    return items;
  }

  if (!items.some((item) => item.file === progressItem.file)) {
    return [...items, progressItem];
  }

  return items.map((item) => (item.file === progressItem.file ? { ...item, ...progressItem } : item));
}

function getWorkerErrorMessage(message: WhisperWorkerMessage) {
  const errorMessage = message.data?.message ?? "Unexpected transcription error";

  return `${errorMessage} ${WORKER_ERROR_HELP}`;
}

export function useWhisperTranscription() {
  const workerRef = useRef<Worker | null>(null);
  const [transcription, setTranscription] = useState(INITIAL_TRANSCRIPTION);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progressItems, setProgressItems] = useState<TranscriptionProgressItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetProgressState = useCallback(() => {
    setIsModelLoading(false);
    setIsTranscribing(false);
    setProgressItems([]);
  }, []);

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const transcribe = useCallback(
    async (file: File) => {
      terminateWorker();
      resetProgressState();
      clearError();

      const worker = createWhisperWorker();
      workerRef.current = worker;

      worker.onmessage = ({ data: message }: MessageEvent<WhisperWorkerMessage>) => {
        if (workerRef.current !== worker) {
          return;
        }

        switch (message.status) {
          case "progress":
          case "done":
            setProgressItems((currentItems) => upsertProgressItem(currentItems, message));
            break;

          case "initiate":
            setIsModelLoading(true);
            setProgressItems((currentItems) => upsertProgressItem(currentItems, message));
            break;

          case "ready":
            setIsModelLoading(false);
            setProgressItems([]);
            break;

          case "transcribing":
            setIsModelLoading(false);
            setIsTranscribing(true);
            setProgressItems([]);
            break;

          case "error":
            resetProgressState();
            setErrorMessage(getWorkerErrorMessage(message));
            terminateWorker();
            break;

          case "transcripted":
            setIsTranscribing(false);
            setTranscription(message.transcription ?? "");
            terminateWorker();
            break;

          default:
            break;
        }
      };

      try {
        const audioFloat32 = await blobToFloat32Array(file);

        if (workerRef.current !== worker) {
          return;
        }

        worker.postMessage(audioFloat32);
      } catch (error) {
        if (workerRef.current !== worker) {
          return;
        }

        resetProgressState();
        setErrorMessage(error instanceof Error ? error.message : "Unable to prepare audio file");
        terminateWorker();
      }
    },
    [clearError, resetProgressState, terminateWorker],
  );

  useEffect(() => terminateWorker, [terminateWorker]);

  return {
    transcription,
    isModelLoading,
    isTranscribing,
    isBusy: isModelLoading || isTranscribing,
    progressItems,
    errorMessage,
    clearError,
    transcribe,
  };
}
