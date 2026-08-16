import type { ZodString } from "astro/zod";

export type DeleteAlertProps = {
  type: "delete";
  title: string;
  message: string;
  handleDelete: () => void;
};

export type ConfirmAlertProps = {
  type: "confirm";
  title: string;
  message: string;
  handleConfirm: () => void;
};

export type ErrorAlertProps = {
  type: "error";
  title: string;
  message: string;
};

export type InputAlertProps = {
  type: "input";
  title: string;
  message: string;
  value?: string;
  placeholder?: string;
  schema?: ZodString;
  handleSubmit: (value: string) => void;
};

export type AlertProps =
  DeleteAlertProps | ErrorAlertProps | InputAlertProps | ConfirmAlertProps;
