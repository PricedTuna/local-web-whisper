import { useState } from "react";
import { blobToFloat32Array } from "./lib/blobToFloat32Array";
import { AudioInputFile } from "./components/AudioInputFile";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

function App() {
  const [text, setText] = useState("Aquí se verá el texto!");

  async function transcribe(file: File) {
    const worker = new Worker(new URL("./workers/whisper.workers.ts", import.meta.url), { type: "module" });

    worker.onmessage = (event) => {
      setText(event.data);
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
