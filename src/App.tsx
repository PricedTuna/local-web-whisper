import { useState } from "react";
import { blobToFloat32Array } from "./lib/blobToFloat32Array";
import { AudioInputFile } from "./components/AudioInputFile";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Spinner } from "./components/ui/spinner";
import { Check } from "lucide-react";

interface ProgressItem {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

function App() {
  const [text, setText] = useState("Waiting to transcript ;)");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

  async function transcribe(file: File) {
    const worker = new Worker(new URL("./workers/whisper.workers.ts", import.meta.url), { type: "module" });

    worker.onmessage = (msg) => {
      let message = msg.data;

      switch (message.status) {
        case "progress":
          // File progress: update progressItems
          setProgressItems((prev) => prev.map((item) => (item.file !== message.file ? item : { ...message })));
          break;

        case "initiate":
          // Model file start load: add a new progress item to the list.
          setIsModelLoading(true);
          setProgressItems((prev) => [...prev, message]);
          break;

        case "ready":
          // model loading finished
          setIsModelLoading(false);
          setProgressItems([]);
          break;

        case "error":
          alert(
            `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
          );

          break;
        case "done":
          // Model file loaded: update progressItems.
          setProgressItems((prev) => prev.map((item) => (item.file !== message.file ? item : { ...message })));
          break;

        case "transcripted":
          setText(message.transcription);
          break;

        default:
          // initiate/download/done
          break;
      }
    };

    const audioFloat32 = await blobToFloat32Array(file);

    worker.postMessage(audioFloat32);
  }

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="w-full max-w-sm flex flex-col gap-10">
        <AudioInputFile
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) transcribe(file);
          }}
        />

        {isModelLoading && (
          <div className="flex flex-col w-full max-w-xs gap-2 [--radius:1rem]">
            <div className="flex border-b-2 gap-2 items-center">
              <Spinner /> Loading model files...
            </div>
            {progressItems.map((progressItem) => (
              <div className="flex w-full gap-2">
                {progressItem.status === "done" ? (
                  <Check color="green" />
                ) : (
                  <>
                    <Spinner /> {progressItem.progress}
                  </>
                )}{" "}
                {progressItem.name}
              </div>
            ))}
          </div>
        )}

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Transcripted text</CardTitle>
          </CardHeader>
          <CardContent>{text}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
