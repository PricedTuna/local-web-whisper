import { useState } from "react"

function App() {
  const [text, setText] = useState("Aquí se verá el texto!");

  async function transcribe(file: File) {
    const worker = new Worker(
      new URL("./workers/whisper.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event) => {
      setText(event.data);
    }

    worker.postMessage(file)
  }

  return (
    <div>
      <input 
        type="file"
        accept="audio/"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) transcribe(file)
        }}
      />
      <div>{text}</div>
    </div>
  )
}

export default App
