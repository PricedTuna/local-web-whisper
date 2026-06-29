import { getTranscriber } from "@/lib/whisper";

self.onmessage = async (event) => {
  const audioBlob = event.data;

  const transcriber = await getTranscriber();
  const result = await transcriber(audioBlob);

  self.postMessage(result.text);
}