import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Checkbox } from "@/app/components/ui/checkbox";
import DeleteButton from "@/app/components/base/delete-button";
import Gripper from "@/app/components/base/gripper";

import { cn } from "@/app/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import ServerInput from "@/app/components/input/server-input";
import { formatWeight } from "@/app/lib/utils";
import useListId from "@/app/hooks/use-list-id";
import { listQueryOptions } from "@/app/lib/queries";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import CategoryItem from "../category-item";
import type { CategoryProps } from "./types";
import { useListStore } from "@/app/lib/list-store";

const ListCategory: React.FC<CategoryProps> = (props) => {
  const { category, provided, isDragging } = props;
  const listId = useListId();
  const queryClient = useQueryClient();

  const list = queryClient.getQueryData(listQueryOptions(listId).queryKey);

  const {
    deleteCategory,
    toggleCategoryPacked,
    updateCategory,
    addCategoryItem,
  } = useListStore();

  if (!list) return null;

  return (
    <div
      ref={provided.innerRef}
      className={cn(
        "transition-all",
        isDragging && "rounded border bg-card/70",
      )}
      {...provided.draggableProps}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {list.showPacked && (
              <TableHead className="w-6">
                <Checkbox
                  checked={category.items.every((item) => item.packed)}
                  onCheckedChange={() => toggleCategoryPacked(category.id)}
                />
              </TableHead>
            )}
            <TableHead className="w-4 px-1">
              <Gripper {...provided.dragHandleProps} isGrabbing={isDragging} />
            </TableHead>
            <TableHead
              colSpan={2 + (list.showImages ? 1 : 0)}
              className="text-foregound px-1 text-base font-semibold"
            >
              <ServerInput
                inline
                className="py-0.5 text-base"
                placeholder="Category Name"
                currentValue={category.name ?? ""}
                onUpdate={(value) =>
                  updateCategory(category.id, { name: value })
                }
              />
            </TableHead>
            {list.showWeights && (
              <TableHead className="w-[7rem] text-center">Weight</TableHead>
            )}
            <TableHead className="w-[5rem]">Qty</TableHead>
            <TableHead className="w-6 pl-0">
              <DeleteButton handleDelete={() => deleteCategory(category.id)} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <Droppable droppableId={category.id} type="category-item">
          {(provided) => (
            <TableBody ref={provided.innerRef} {...provided.droppableProps}>
              {category.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <CategoryItem
                      key={item.id}
                      item={item}
                      provided={provided}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </TableBody>
          )}
        </Droppable>
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={
                3 + (list.showPacked ? 1 : 0) + (list.showImages ? 1 : 0)
              }
            >
              <Button
                variant="linkMuted"
                size="sm"
                onClick={() => addCategoryItem(category.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </TableCell>
            {list.showWeights && (
              <TableCell>
                <div className="flex justify-end gap-2">
                  <span>{formatWeight(category.weight)}</span>
                  <span className="min-w-8">{list.weightUnit ?? "g"}</span>
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className="pl-2">
                {category.items.reduce((acc, val) => acc + val.quantity, 0)}
              </div>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ListCategory;
