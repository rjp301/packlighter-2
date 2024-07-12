import React from "react";
import Gripper from "@/app/components/base/gripper";
import { Checkbox } from "@/app/components/ui/checkbox";
import DeleteButton from "@/app/components/base/delete-button";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/app/lib/utils";
import useListId from "@/app/hooks/use-list-id";

import { itemsQueryOptions, listQueryOptions } from "@/app/lib/queries";
import { Badge } from "../../ui/badge";
import { formatWeight } from "@/app/lib/utils";
import QuantityEditor from "../../quantity-editor";
import ItemEditor from "../../item-editor/item-editor";
import ItemImage from "../../item-image";
import type { CategoryItemProps } from "./types";

const ListCategoryItemMobile: React.FC<CategoryItemProps> = (props) => {
  const { categoryItem, provided, isDragging, update, remove } = props;
  const listId = useListId();
  const queryClient = useQueryClient();

  const list = queryClient.getQueryData(listQueryOptions(listId).queryKey);
  const items = queryClient.getQueryData(itemsQueryOptions.queryKey);
  const item = items?.find((item) => item.id === categoryItem.itemId);

  const [editorOpen, setEditorOpen] = React.useState(false);

  if (!list || !item) return null;

  return (
    <>
      <ItemEditor item={item} isOpen={editorOpen} setIsOpen={setEditorOpen} />
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={cn(
          "flex items-center gap-2 border-b px-2 py-1.5 text-sm",
          isDragging && "rounded border bg-muted/30",
        )}
      >
        {list.showPacked && (
          <Checkbox
            className="mr-2"
            checked={categoryItem.packed}
            onCheckedChange={(packed) => update({ packed: Boolean(packed) })}
          />
        )}
        <Gripper {...provided.dragHandleProps} />
        {list.showImages && <ItemImage item={item} />}
        <div
          className="flex flex-1 flex-col gap-1"
          onClick={() => setEditorOpen(true)}
        >
          <h3
            className={cn(
              "truncate",
              !item.name && "italic text-muted-foreground",
            )}
          >
            {item.name || "Unnamed Item"}
          </h3>
          {item.description && (
            <p className="text-muted-foreground">{item.description}</p>
          )}
        </div>

        <QuantityEditor
          quantity={categoryItem.quantity}
          setQuantity={(quantity) => update({ quantity: Number(quantity) })}
        />
        {list.showWeights && (
          <Badge
            className="shrink-0 rounded-full"
            variant="secondary"
            onClick={() => setEditorOpen(true)}
          >
            {`${formatWeight(item.weight)} ${item.weightUnit}`}
          </Badge>
        )}
        <DeleteButton handleDelete={remove} />
      </div>
    </>
  );
};

export default ListCategoryItemMobile;
