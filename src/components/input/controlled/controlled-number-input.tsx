import React from "react";
import { useController, type FieldValues, type Path } from "react-hook-form";
import type { ControlledInputProps, FieldOptions } from "./types";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Props<
  T extends FieldValues,
  TFieldName extends Path<T>,
> = ControlledInputProps<T, TFieldName> &
  FieldOptions &
  React.HTMLProps<HTMLInputElement>;

const ControlledNumberInput = <
  T extends FieldValues,
  TFieldName extends Path<T>,
>(
  props: Props<T, TFieldName>,
) => {
  const {
    control,
    name,
    label,
    description,
    containerProps,
    ...rest
  } = props;
  const { field } = useController({ control, name });

  return (
    <FormItem {...containerProps}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Input
          {...field}
          {...rest}
          type="number"
          value={field.value?.toString()}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value ? Number(value) : undefined);
          }}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};

export default ControlledNumberInput;
