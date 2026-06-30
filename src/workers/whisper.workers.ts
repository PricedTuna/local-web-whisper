import { getTranscriber } from "@/lib/whisper";

self.onmessage = async (event: MessageEvent<Float32Array>) => {
  const audioFloat32 = event.data;

  try {
    const transcriber = await getTranscriber((message) => {
      self.postMessage(message);
    });

    self.postMessage({
      transcription: null,
      status: "transcribing",
      message: "Transcribing audio",
    });

    const result = await transcriber(audioFloat32);

    self.postMessage({
      transcription: result.text,
      status: "transcripted",
      message: null,
    });
  } catch (error) {
    self.postMessage({
      data: {
        message: error instanceof Error ? error.message : "Unexpected transcription error",
      },
      status: "error",
    });
  }
};
