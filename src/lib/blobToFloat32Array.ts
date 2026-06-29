export async function blobToFloat32Array(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();

  const audioContext = new AudioContext({
    sampleRate: 16000,
  });

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);

  return new Float32Array(channelData);
}