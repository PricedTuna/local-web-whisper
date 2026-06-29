import { getTranscriber } from "@/lib/whisper";

self.onmessage = async (event) => {
  const audioFloat32 = event.data;

  const transcriber = await getTranscriber((message) => {
    self.postMessage(message)
    // switch (message.status) {
    //   case "progress":
    //     console.log(`+se progresó en un archivo (${message.file})`);
    //     self.postMessage({
    //       transcription: null,
    //       status: 'progress',
    //       message: `Se progresó en el archivo ${message.file}`
    //     });
    //     break;
    //   case "update":
    //     // Received partial update
    //     // console.log("update", message);
    //     // eslint-disable-next-line no-case-declarations
    //     // console.log("~~ bloque transcrito");
    //     break;
    //   case "complete":
    //     // Received complete transcript
    //     // console.log("complete", message);
    //     // eslint-disable-next-line no-case-declarations
    //     // console.log("~~~~~~~~~~ transcripción completada");
    //     break;

    //   case "initiate":
    //     // Model file start load: add a new progress item to the list.
    //     console.log("+++++++++++++++++++ Empieza la carga de los archivos");
    //     self.postMessage({
    //       transcription: null,
    //       status: 'initiate',
    //       message: `Se está descargando el modelo`
    //     });
    //     break;
    //   case "ready":
    //     console.log("======== Termina la carga");
    //     self.postMessage({
    //       transcription: null,
    //       status: 'ready',
    //       message: `Modelo cargado`
    //     });
    //     break;
    //   case "error":
    //     alert(
    //       `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`,
    //     );
        
    //     break;
    //   case "done":
    //     // Model file loaded: remove the progress item from the list.
    //     console.log(`+++ Terminó la carga de un archivo (${message.file})`);
    //     self.postMessage({
    //       transcription: null,
    //       status: 'done',
    //       message: `Terminó la carga del archivo ${message.file}`
    //     });
    //     break;

    //   default:
    //     // initiate/download/done
    //     break;
    // }
  });
  
  const result = await transcriber(audioFloat32);

  self.postMessage({
    transcription: result.text,
    status: 'transcripted',
    message: null
  });
};
