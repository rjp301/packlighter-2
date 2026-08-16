import { ACCENT_COLOR } from "@/lib/client/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton, Text, TextField, Tooltip } from "@radix-ui/themes";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { z } from "astro/zod";
import { alertSystemAtom } from "../alert-system/alert-system.store";
import { useAtom } from "jotai";
import { AlertCircleIcon, SaveIcon, XIcon } from "lucide-react";

type SharedProps = {
  textFieldProps?: React.ComponentProps<typeof TextField.Root>;
  formProps?: React.ComponentProps<"form">;
  customSchema?: z.ZodString;
  compactButtons?: boolean;
};

const Form: React.FC<
  {
    initialValue: string;
    handleSubmit: (value: string) => void;
    handleCancel: (value: string) => void;
  } & SharedProps
> = ({
  initialValue,
  handleSubmit,
  handleCancel,
  textFieldProps,
  formProps,
  customSchema,
  compactButtons,
}) => {
  const ref = React.useRef<HTMLFormElement>(null);
  const form = useForm({
    defaultValues: { value: initialValue },
    resolver: zodResolver(
      z.object({ value: customSchema || z.string().nonempty() }),
    ),
  });

  useEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    const isDialog = target.closest(".rt-BaseDialogOverlay");
    if (isDialog) return;

    const { value } = form.getValues();
    if (e.key === "Escape") handleCancel(value);
  });

  useOnClickOutside(ref, (e) => {
    const target = e.target as HTMLElement;
    const isDialog = target.closest(".rt-BaseDialogOverlay");
    if (isDialog) return;

    const { value } = form.getValues();
    handleCancel(value);
  });

  return (
    <form
      ref={ref}
      onSubmit={form.handleSubmit(({ value }) => handleSubmit(value))}
      {...formProps}
    >
      <Controller
        control={form.control}
        name="value"
        render={({ field, fieldState: { error } }) => (
          <TextField.Root
            autoFocus
            autoComplete="off"
            onFocus={(e) => e.target.select()}
            variant="soft"
            color="gray"
            {...textFieldProps}
            {...field}
          >
            {error && (
              <TextField.Slot side="left">
                <Tooltip content={error.message} side="top" align="center">
                  <Text size="1" color="red" aria-label="Error">
                    <AlertCircleIcon className="size-4 cursor-help" />
                  </Text>
                </Tooltip>
              </TextField.Slot>
            )}
            <TextField.Slot side="right" className="gap-1">
              {compactButtons ? (
                <>
                  <IconButton
                    type="submit"
                    variant="soft"
                    size="1"
                    color={ACCENT_COLOR}
                    aria-label="Save changes"
                  >
                    <SaveIcon className="size-4" />
                  </IconButton>
                  <IconButton
                    type="button"
                    variant="soft"
                    size="1"
                    color="amber"
                    aria-label="Cancel"
                    onClick={() => handleCancel(field.value)}
                  >
                    <XIcon className="size-4" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    size="1"
                    type="submit"
                    variant="soft"
                    color={ACCENT_COLOR}
                  >
                    Save changes
                  </Button>
                  <Button
                    size="1"
                    variant="soft"
                    color="amber"
                    onClick={() => handleCancel(field.value)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </TextField.Slot>
          </TextField.Root>
        )}
      />
    </form>
  );
};

type ConditionalFormProps = {
  value: string;
  handleSubmit: (value: string) => void;
  children: (props: {
    startEditing: () => void;
    displayValue: string;
  }) => React.ReactNode;
} & SharedProps;

const ConditionalForm: React.FC<ConditionalFormProps> = ({
  value,
  handleSubmit,
  children,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isEditing, setIsEditing] = React.useState(false);

  const [, dispatchAlert] = useAtom(alertSystemAtom);

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleConfirm = () => {
    dispatchAlert({
      type: "open",
      data: {
        type: "confirm",
        title: "Cancel Editing",
        message: "Are you sure you want to cancel? You will lose your changes.",
        handleConfirm: () => {
          setIsEditing(false);
          dispatchAlert({ type: "close" });
        },
      },
    });
  };

  if (isEditing) {
    return (
      <Form
        initialValue={value}
        handleCancel={(formValue) =>
          formValue !== value ? handleConfirm() : setIsEditing(false)
        }
        handleSubmit={(value) => {
          setDisplayValue(value);
          setIsEditing(false);
          handleSubmit(value);
        }}
        {...rest}
      />
    );
  }

  return children({ startEditing: () => setIsEditing(true), displayValue });
};

export default ConditionalForm;
