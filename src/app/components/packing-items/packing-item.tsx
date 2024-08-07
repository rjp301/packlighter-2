import React from "react";
import DeleteButton from "@/app/components/base/delete-button";
import { cn } from "@/app/lib/utils";
import { formatWeight } from "@/app/lib/utils";
import Gripper from "@/app/components/base/gripper";
import useMutations from "@/app/hooks/use-mutations";
import type { ItemSelect } from "@/api/lib/types";
import PackingItemDragImage from "./packing-item-drag-image";
import useDragImage from "@/app/hooks/use-drag-image";

interface Props {
  item: ItemSelect;
  isOverlay?: boolean;
}

const PackingItem: React.FC<Props> = (props) => {
  const { item, isOverlay } = props;
  const { deleteItem } = useMutations();

  const itemName = item.name || "Unnamed Gear";

  const dragImage = useDragImage();

  return (
    <>
      <PackingItemDragImage item={item} imageRef={dragImage.ref} />
      <div
        draggable
        onDragStart={(e) => {
          // dragImage.handleDragStart(e);
          e.dataTransfer.setData("text/plain", item.id);
        }}
        key={item.id}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-2 text-sm hover:bg-secondary",
          isOverlay && "rounded outline outline-1 outline-ring",
        )}
      >
        <Gripper />
        <div className="flex flex-1 flex-col">
          <span className={cn(!item.name && "italic text-muted-foreground")}>
            {itemName}
          </span>
          <span className="text-muted-foreground">{item.description}</span>
        </div>
        <span className="flex gap-1 text-muted-foreground">
          <span>{formatWeight(item.weight)}</span>
          <span>{item.weightUnit}</span>
        </span>
        <DeleteButton
          handleDelete={() =>
            deleteItem.mutate({ itemId: item.id, itemName: itemName })
          }
        />
      </div>
    </>
  );
};

export default PackingItem;
