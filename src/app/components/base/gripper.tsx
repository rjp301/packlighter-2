import { cn } from "@/app/lib/utils";
import { GripVertical } from "lucide-react";
import React from "react";

type Props = {
  reference?: React.RefObject<HTMLButtonElement>;
  isGrabbing?: boolean;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const Gripper: React.FC<Props> = (props) => {
  const { isGrabbing, disabled, reference, ...rest } = props;

  return (
    <button
      ref={reference}
      {...(disabled ? { disabled: true } : rest)}
      className={cn(
        "flex cursor-grab items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
        isGrabbing && "cursor-grabbing",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <GripVertical size="1rem" />
    </button>
  );
};

export default Gripper;
