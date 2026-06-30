import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranscriptCardProps {
  transcription: string;
}

export function TranscriptCard({ transcription }: TranscriptCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transcripted text</CardTitle>
      </CardHeader>
      <CardContent>{transcription}</CardContent>
    </Card>
  );
}
