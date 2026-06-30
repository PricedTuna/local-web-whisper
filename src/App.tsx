import { useState } from "react";
import { blobToFloat32Array } from "./lib/blobToFloat32Array";
import { AudioInputFile } from "./components/AudioInputFile";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Spinner } from "./components/ui/spinner";
import { Check } from "lucide-react";
import { Button } from "./components/ui/button";

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [audioFile, setAudioFile] = useState<undefined | File>();

  async function transcribe(file: File) {
    setIsModelLoading(false);
    setIsTranscribing(false);
    setProgressItems([]);

    const worker = new Worker(new URL("./workers/whisper.workers.ts", import.meta.url), { type: "module" });

    worker.onmessage = (msg) => {
      const message = msg.data;

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

        case "transcribing":
          setIsModelLoading(false);
          setIsTranscribing(true);
          setProgressItems([]);
          break;

        case "error":
          setIsModelLoading(false);
          setIsTranscribing(false);
          setProgressItems([]);

          alert(
            `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
          );

          worker.terminate();
          break;
        case "done":
          // Model file loaded: update progressItems.
          setProgressItems((prev) => prev.map((item) => (item.file !== message.file ? item : { ...message })));
          break;

        case "transcripted":
          setIsTranscribing(false);
          setText(message.transcription);
          worker.terminate();
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
            setAudioFile(e.target.files?.[0])
          }}
        />
        <Button onClick={() => audioFile ? transcribe(audioFile) : alert('First upload an audio')}>Transcribe it!</Button>

        {(isModelLoading || isTranscribing) && (
          <div className="flex flex-col w-full max-w-xs gap-2 [--radius:1rem]">
            <div className="flex border-b-2 gap-2 items-center">
              <Spinner /> {isTranscribing ? "Transcribing audio..." : "Loading model files..."}
            </div>
            {isModelLoading &&
              progressItems.map((progressItem) => (
                <div key={progressItem.file} className="flex w-full gap-2">
                  {progressItem.status === "done" ? (
                    <Check color="green" />
                  ) : (
                    <>
                      <Spinner /> {progressItem.progress.toFixed(1)}
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
