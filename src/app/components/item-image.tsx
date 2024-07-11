import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { ItemSelect } from "db/types";
import useMutations from "../hooks/use-mutations";
import ServerInput from "./input/server-input";

interface Props {
  item: ItemSelect;
}

const ItemImage: React.FC<Props> = (props) => {
  const { item } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const { updateItem } = useMutations();

  // React.useEffect(() => {
  //   const pasteFiles = (e: ClipboardEvent) => {
  //     if (isOpen && e.clipboardData?.files?.length) {
  //       updateMutation.mutate(e.clipboardData.files[0]);
  //     }
  //   };

  //   document.addEventListener("paste", pasteFiles);
  //   return () => {
  //     document.removeEventListener("paste", pasteFiles);
  //   };
  // }, [isOpen, updateMutation]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex h-full">
        <div
          className={cn(
            "flex w-16 flex-1 items-center justify-center rounded-sm p-0.5",
            item.image ? "h-16 bg-white" : "h-full bg-muted/50",
            "outline-1 outline-offset-1 outline-primary transition-all hover:outline",
          )}
        >
          {item.image && (
            <img
              className="h-full w-full object-contain"
              src={item.image}
              alt={item.name}
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="p-4">
        <DialogHeader className="text-left">
          <DialogTitle>Update {item.name} Image</DialogTitle>
          <DialogDescription>
            Choose a file or paste an image to update the image for this item
          </DialogDescription>
        </DialogHeader>
        <ServerInput
          key={item.image}
          type="url"
          placeholder="Image Url"
          currentValue={item.image}
          onUpdate={(value) =>
            updateItem.mutate({ itemId: item.id, data: { image: value } })
          }
        />

        <div
          className={cn(
            "flex aspect-square items-center justify-center rounded-md p-2 text-muted-foreground",
            item.image ? "bg-white" : "bg-muted",
          )}
        >
          {item.image ? (
            <img
              className="h-full w-full object-contain"
              src={item.image}
              alt={item.name}
            />
          ) : (
            "No Image"
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={updateItem.isPending}
            onClick={() =>
              updateItem.mutate({ itemId: item.id, data: { image: null } })
            }
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Image
          </Button>
        </DialogFooter>
        <input type="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default ItemImage;
