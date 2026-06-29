import { pipeline, type ProgressCallback } from "@huggingface/transformers";

let transcriber: any = null;

export async function getTranscriber(progress_callback?: ProgressCallback) {
  if (!transcriber) {
    transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", {
      device: "webgpu",
      dtype: {
        encoder_model: "fp32",
        decoder_model_merged: "q4",
      },

      progress_callback
    });
  }

  return transcriber;
}
