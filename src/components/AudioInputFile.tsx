import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ChangeEvent } from "react";

interface InputFileProps {
  onChange: (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
}

export function AudioInputFile({ onChange }: InputFileProps) {
  return (
    <Field>
      <FieldLabel htmlFor="audioFile">Audio</FieldLabel>
      <Input id="audioFile" type="file" accept="audio/" onChange={onChange} />
      <FieldDescription>Select the audio to transcript.</FieldDescription>
    </Field> 
  )
}
