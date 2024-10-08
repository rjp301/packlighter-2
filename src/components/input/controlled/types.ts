import type { Control, FieldValues, Path } from "react-hook-form";

export type InputOption = {
  label: string;
  value: string;
};

export type ControlledInputProps<
  T extends FieldValues,
  TFieldName extends Path<T>,
> = {
  name: TFieldName;
  control?: Control<T>;
  containerProps?: React.HTMLProps<HTMLDivElement>;
};

export type FieldOptions = {
  label?: string;
  description?: string;
};
