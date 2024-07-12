import React from "react";
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
import { Badge } from "../../ui/badge";
import CategoryItem from "../category-item";
import type { CategoryProps } from "./types";
import { useListStore } from "@/app/lib/list-store";

const ListCategoryMobile: React.FC<CategoryProps> = (props) => {
  const { category, provided, isDragging } = props;
  const listId = useListId();
  const queryClient = useQueryClient();

  const list = queryClient.getQueryData(listQueryOptions(listId).queryKey);

  const {
    deleteCategory,
    toggleCategoryPacked,
    updateCategory,
    addCategoryItem,
    updateCategoryItem,
    deleteCategoryItem,
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
      <header className="flex items-center gap-1 rounded-t border-b bg-card/50 px-2 py-1">
        {list.showPacked && (
          <Checkbox
            className="mr-2"
            checked={category.items.every((item) => item.packed)}
            onCheckedChange={() => toggleCategoryPacked(category.id)}
          />
        )}
        <Gripper {...provided.dragHandleProps} isGrabbing={isDragging} />
        <ServerInput
          inline
          className="px-1 py-0.5 text-base font-semibold"
          placeholder="Category Name"
          currentValue={category.name ?? ""}
          onUpdate={(value) => updateCategory(category.id, { name: value })}
        />
        {list.showWeights && (
          <Badge className="shrink-0 rounded-full" variant="secondary">
            {`${formatWeight(0)} ${list.weightUnit ?? "g"}`}
          </Badge>
        )}
        <DeleteButton handleDelete={() => deleteCategory(category.id)} />
      </header>
      <Droppable droppableId={category.id} type="category-item">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {category.items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <CategoryItem
                    key={item.id}
                    categoryItem={item}
                    provided={provided}
                    remove={() => deleteCategoryItem(category.id, item.id)}
                    update={(data) =>
                      updateCategoryItem(category.id, item.id, data)
                    }
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <footer className="w-full px-2 py-1">
        <Button
          variant="linkMuted"
          size="sm"
          onClick={() => addCategoryItem(category.id)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </footer>
    </div>
  );
};

export default ListCategoryMobile;
