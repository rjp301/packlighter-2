import React from "react";
import { TableCell, TableRow } from "@/app/components/ui/table";
import Gripper from "@/app/components/base/gripper";
import { Checkbox } from "@/app/components/ui/checkbox";
import ServerInput from "@/app/components/input/server-input";
import DeleteButton from "@/app/components/base/delete-button";
import { useQueryClient } from "@tanstack/react-query";
import ItemImage from "@/app/components/item-image";
import { cn } from "@/app/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import useListId from "@/app/hooks/use-list-id";

import { itemsQueryOptions, listQueryOptions } from "@/app/lib/queries";
import { weightUnits, type WeightUnit } from "@/api/helpers/weight-units";
import useMutations from "@/app/hooks/use-mutations";
import type { CategoryItemProps } from "./types";

const ListCategoryItem: React.FC<CategoryItemProps> = (props) => {
  const { categoryItem, provided, isDragging, update, remove } = props;
  const listId = useListId();
  const queryClient = useQueryClient();

  const list = queryClient.getQueryData(listQueryOptions(listId).queryKey);
  const items = queryClient.getQueryData(itemsQueryOptions.queryKey);
  const item = items?.find((item) => item.id === categoryItem.itemId);

  const { updateItem } = useMutations();

  if (!list || !item) return null;

  return (
    <TableRow
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn("rounded", isDragging && "rounded border bg-muted/30")}
    >
      {list.showPacked && (
        <TableCell className="py-0">
          <Checkbox
            checked={categoryItem.packed}
            onCheckedChange={(packed) => update({ packed: Boolean(packed) })}
          />
        </TableCell>
      )}
      <TableCell className="w-4 px-1 py-0.5">
        <Gripper {...provided.dragHandleProps} />
      </TableCell>
      {list.showImages && (
        <TableCell>
          <div className={cn(!item.image && "absolute inset-2")}>
            <ItemImage item={item} />
          </div>
        </TableCell>
      )}
      <TableCell className="px-1 py-0.5">
        <ServerInput
          inline
          placeholder="Name"
          currentValue={item.name}
          onUpdate={(name) =>
            updateItem.mutate({
              itemId: item.id,
              data: { name },
            })
          }
        />
      </TableCell>
      <TableCell className="w-1/2 px-1 py-0.5 text-muted-foreground">
        <ServerInput
          inline
          placeholder="Description"
          currentValue={item.description}
          onUpdate={(description) =>
            updateItem.mutate({
              itemId: item.id,
              data: { description },
            })
          }
        />
      </TableCell>
      {list.showWeights && (
        <TableCell className="py-0.5">
          <div className="no-spin flex">
            <ServerInput
              inline
              type="number"
              min={0}
              selectOnFocus
              className="text-right"
              currentValue={item.weight.toLocaleString()}
              onUpdate={(weight) =>
                updateItem.mutate({
                  itemId: item.id,
                  data: { weight: Number(weight) },
                })
              }
            />
            <Select
              value={item.weightUnit}
              onValueChange={(value) =>
                updateItem.mutate({
                  itemId: item.id,
                  data: { weightUnit: value as WeightUnit },
                })
              }
            >
              <SelectTrigger className="h-auto border-none p-0 px-2 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(weightUnits).map((unit) => (
                  <SelectItem value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TableCell>
      )}
      <TableCell className="py-0.5">
        <ServerInput
          inline
          type="number"
          min={1}
          selectOnFocus
          currentValue={categoryItem.quantity.toLocaleString()}
          onUpdate={(quantity) => update({ quantity: Number(quantity) })}
        />
      </TableCell>
      <TableCell className="py-0.5 pl-0">
        <DeleteButton handleDelete={() => remove()} />
      </TableCell>
    </TableRow>
  );
};

export default ListCategoryItem;
