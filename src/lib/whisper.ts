import { pipeline } from "@huggingface/transformers";

let transcriber: any = null;

export async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", {
      device: "webgpu",
      dtype: {
        encoder_model: "fp32",
        decoder_model_merged: "q4",
      },
    });
  }

  return transcriber;
}
