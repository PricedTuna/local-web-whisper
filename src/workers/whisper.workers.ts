import { getTranscriber } from "@/lib/whisper";

self.onmessage = async (event) => {
  const audioFloat32 = event.data;

  const transcriber = await getTranscriber();
  const result = await transcriber(audioFloat32);

  self.postMessage(result.text);
}
