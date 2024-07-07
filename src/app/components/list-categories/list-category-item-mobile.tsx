import React from "react";
import Gripper from "@/app/components/base/gripper";
import { Checkbox } from "@/app/components/ui/checkbox";
import DeleteButton from "@/app/components/base/delete-button";
import { useQueryClient } from "@tanstack/react-query";
// import ItemImage from "@/app/components/item-image";
import { cn } from "@/app/lib/utils";
import useListId from "@/app/hooks/use-list-id";

import { listQueryOptions } from "@/app/lib/queries";
import type { ExpandedCategoryItem } from "@/api/lib/types";
import useMutations from "@/app/hooks/use-mutations";
import type { DraggableProvided } from "@hello-pangea/dnd";
import { Badge } from "../ui/badge";
import { formatWeight } from "@/app/lib/utils";
import QuantityEditor from "../quantity-editor";
import ItemEditor from "../item-editor/item-editor";
import ItemImage from "../item-image";

interface Props {
  item: ExpandedCategoryItem;
  isDragging?: boolean;
  provided: DraggableProvided;
}

const ListCategoryItemMobile: React.FC<Props> = (props) => {
  const { item, isDragging, provided } = props;
  const listId = useListId();
  const queryClient = useQueryClient();

  const list = queryClient.getQueryData(listQueryOptions(listId).queryKey);
  const { deleteCategoryItem, updateCategoryItem } = useMutations();

  const [editorOpen, setEditorOpen] = React.useState(false);

  if (!list) return null;

  return (
    <>
      <ItemEditor
        item={item.itemData}
        isOpen={editorOpen}
        setIsOpen={setEditorOpen}
      />
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={cn(
          "flex items-center gap-2 border-b px-2 py-1.5 text-sm",
          isDragging && "rounded border opacity-30",
        )}
      >
        {list.showPacked && (
          <Checkbox
            className="mr-2"
            checked={item.packed}
            onCheckedChange={(packed) =>
              updateCategoryItem.mutate({
                categoryItemId: item.id,
                data: { packed: Boolean(packed) },
              })
            }
          />
        )}
        <Gripper {...provided.dragHandleProps} />
        {list.showImages && <ItemImage item={item.itemData} />}
        <div
          className="flex flex-1 flex-col gap-1"
          onClick={() => setEditorOpen(true)}
        >
          <h3
            className={cn(
              "truncate",
              !item.itemData.name && "italic text-muted-foreground",
            )}
          >
            {item.itemData.name || "Unnamed Item"}
          </h3>
          {item.itemData.description && (
            <p className="text-muted-foreground">{item.itemData.description}</p>
          )}
        </div>

        <QuantityEditor
          quantity={item.quantity}
          setQuantity={(quantity) =>
            updateCategoryItem.mutate({
              categoryItemId: item.id,
              data: { quantity: Number(quantity) },
            })
          }
        />
        {list.showWeights && (
          <Badge
            className="shrink-0 rounded-full"
            variant="secondary"
            onClick={() => setEditorOpen(true)}
          >
            {`${formatWeight(item.itemData.weight)} ${item.itemData.weightUnit}`}
          </Badge>
        )}
        <DeleteButton
          handleDelete={() =>
            deleteCategoryItem.mutate({ categoryItemId: item.id })
          }
        />
      </div>
    </>
  );
};

export default ListCategoryItemMobile;
