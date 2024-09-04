import React from "react";
import { Input } from "../ui/input";
import { cn } from "@/app/lib/utils";

type Props = {
  currentValue: string | undefined | null;
  onUpdate: (value: string | undefined) => void;
  selectOnFocus?: boolean;
  inline?: boolean;
} & React.ComponentProps<typeof Input>;

const ServerInput = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { currentValue, onUpdate, selectOnFocus, inline, ...rest } = props;

  const [value, setValue] = React.useState<string>(currentValue ?? "");

  const update = () => {
    if (value !== currentValue) onUpdate(value);
  };

  return (
    <Input
      {...rest}
      className={cn(
        props.className,
        inline &&
          "h-auto truncate border-none px-2 py-1 shadow-none transition-colors placeholder:italic hover:bg-input/50",
      )}
      ref={ref}
      value={value}
      onChange={(ev) => setValue(ev.target.value)}
      onBlur={() => update()}
      onFocus={(ev) => selectOnFocus && ev.target.select()}
      onKeyDown={(ev) => {
        const target = ev.target as HTMLInputElement;
        if (ev.key === "Enter" || ev.key === "Escape") {
          ev.preventDefault();
          update();
          target.blur();
        }
      }}
      autoComplete="off"
    />
  );
});

export default ServerInput;
